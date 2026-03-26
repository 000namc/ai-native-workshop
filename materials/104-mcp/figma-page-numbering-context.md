# Figma 페이지 번호 자동화 — 작업 맥락 기록

> 작성일: 2026-03-16
> 목적: 다른 컴퓨터에서 동일한 플러그인을 재현하기 위한 전체 맥락 기록

---

## 1. 문서 구조

| 항목 | 값 |
|---|---|
| 문서명 | `26.03` |
| 섹션명 | `매뉴얼 v1.3` |
| 섹션 ID | `3672:32733` |
| 시작 페이지 번호 | `10` (프레임 `02`부터) |
| 제외 프레임 | `00` (표지), `01` (목차) |

### footer 컴포넌트 구조

| 항목 | 값 |
|---|---|
| 메인 컴포넌트 ID | `895:36354` |
| `{current}` 텍스트 노드 ID | `895:36353` |
| 폰트 (원본) | NanumSquareRound Regular, 9.987px |
| `"02"` 프레임 footer 인스턴스 ID | `3672:47861` |
| `"02"` 프레임 `{current}` 노드 ID | `I3672:47861;895:36353` |

---

## 2. 왜 로컬 플러그인인가

### MCP로 시도했다가 실패한 이유

| 방법 | 결과 | 원인 |
|---|---|---|
| MCP `set_text_content` 직접 수정 | ❌ 실패 | NanumSquareRound 폰트 미로드 |
| MCP `load_font_async` 호출 | ❌ 실패 | Claude Talk to Figma 플러그인 미지원 |
| Inter 폰트로 교체 후 MCP 수정 | ⚠️ 부분 성공 | 폰트가 깨져 원복 불가 |

MCP는 Figma **외부**에서 WebSocket으로 통신하는 구조라, Figma 런타임 내부의 `figma.loadFontAsync()`를 직접 호출할 수 없습니다. 텍스트 수정 전에 폰트가 반드시 로드되어 있어야 하는데, 이 조건을 외부에서 충족할 방법이 없어요.

로컬 플러그인은 Figma **내부 샌드박스**에서 직접 실행되므로 Plugin API 전체에 접근 가능하고 폰트 로드도 자유롭습니다.

---

## 3. 트러블슈팅 이력

### 문제 1 — 폰트 로드에서 멈춤
**원인:** 코드 상단에 `NanumSquareRound` 4종을 일괄 사전 로드하는 블록이 있었는데, 로컬 설치 폰트를 못 찾으면 거기서 무한 대기.
**해결:** 상단 사전 로드 블록 전체 제거. 루프 안에서 `figma.loadFontAsync(currentNode.fontName)`으로 각 노드 실제 폰트만 그때그때 로드.

### 문제 2 — "섹션 탐색 중..." 메시지가 계속 표시됨
**원인:** 첫 번째 `figma.notify()`를 `notifyHandler`에 할당하지 않아 60초 타임아웃 동안 사라지지 않고 이후 프로그레스 토스트를 가림.
**해결:** `notifyHandler = figma.notify("🔍 섹션 탐색 중...", ...)` 로 변경해 이후 `showProgress()`에서 취소되도록 수정.

### 문제 3 — 페이지 순서가 잘못됨 (열 우선 → 행 우선)
**원인:** 정렬 기준이 `x(열) → y(행)` 순서여서, 왼쪽 열 전체를 내려간 후 오른쪽 열로 이동하는 방식.
**해결:** 정렬 기준을 `y(행) → x(열)` 순서로 변경. 같은 행 내에서는 왼쪽→오른쪽.

```js
.sort((a, b) => {
  const rowA = Math.round(a.y / 900);
  const rowB = Math.round(b.y / 900);
  return rowA !== rowB ? rowA - rowB : a.x - b.x;
});
```
> `900`은 행 간격 기준값. 프레임 높이 + 여백이 다를 경우 조정 필요.

---

## 4. 최종 플러그인 파일

### `manifest.json`
```json
{
  "name": "페이지 번호 자동 업데이트",
  "id": "page-numbering-updater-v1",
  "api": "1.0.0",
  "main": "code.js",
  "editorType": ["figma"]
}
```

### `code.js`
```js
(async () => {
  const SECTION_ID = "3672:32733";   // 매뉴얼 v1.3 섹션
  const START_PAGE_NUMBER = 10;      // 02 프레임 시작 번호
  const SKIP_FRAMES = ["00", "01"];  // 표지·목차 건너뜀

  // 진행 상황 토스트
  let notifyHandler = null;
  function showProgress(current, total, frameName) {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round(percent / 5); // 20칸 기준
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    const msg = `[${bar}] ${percent}% (${current}/${total}) — ${frameName}`;
    if (notifyHandler) notifyHandler.cancel();
    notifyHandler = figma.notify(msg, { timeout: 60000 });
  }

  // 1. 섹션 노드 가져오기
  notifyHandler = figma.notify("🔍 섹션 탐색 중...", { timeout: 60000 });
  const section = figma.getNodeById(SECTION_ID);
  if (!section || section.type !== "SECTION") {
    figma.notify("❌ 섹션을 찾을 수 없어요!", { error: true });
    figma.closePlugin();
    return;
  }

  // 2. 프레임 필터 및 정렬 (캔버스 좌→우, 위→아래)
  const frames = section.children
    .filter(node => node.type === "FRAME" && !SKIP_FRAMES.includes(node.name))
    .sort((a, b) => {
      const rowA = Math.round(a.y / 900);
      const rowB = Math.round(b.y / 900);
      return rowA !== rowB ? rowA - rowB : a.x - b.x;
    });

  const total = frames.length;

  // 3. 각 프레임 footer > {current} 수정
  let pageNum = START_PAGE_NUMBER;
  let successCount = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    showProgress(i + 1, total, frame.name);

    const footer = frame.children.find(
      node => node.type === "INSTANCE" && node.name === "footer"
    );
    if (!footer) continue;

    const currentNode = footer.children.find(
      node => node.type === "TEXT" && node.name === "{current}"
    );
    if (!currentNode) continue;

    try {
      await figma.loadFontAsync(currentNode.fontName);
      currentNode.characters = String(pageNum);
      successCount++;
      pageNum++;
    } catch (err) {
      console.error(`[✗] ${frame.name}:`, err);
    }
  }

  if (notifyHandler) notifyHandler.cancel();
  figma.notify(
    `✅ ${successCount}개 완료! (${START_PAGE_NUMBER}~${pageNum - 1}페이지)`,
    { timeout: 5000 }
  );
  figma.closePlugin();
})();
```

---

## 5. 설치 및 실행 방법

### 1단계 — 파일 준비
바탕화면에 `figma-page-numbering` 폴더를 만들고 위 `manifest.json`과 `code.js`를 저장.

### 2단계 — Figma 데스크탑에서 플러그인 등록
> ⚠️ **Figma 브라우저가 아닌 데스크탑 앱**에서만 가능

1. Figma 데스크탑 앱 실행
2. 좌측 상단 메뉴(≡) 클릭
3. **Plugins → Development → Import plugin from manifest...** 클릭
4. `figma-page-numbering/manifest.json` 선택 → 열기

### 3단계 — 플러그인 실행
1. **메뉴 → Plugins → Development → 페이지 번호 자동 업데이트** 클릭
2. 프로그레스바 토스트 확인 (`[████░░░░░░░░░░░░░░░░] 20% (8/38) — 프레임명`)
3. 완료 시: `✅ 38개 완료! (10~47페이지)`
4. 오류 발생 시: **Plugins → Development → Open Console** 에서 로그 확인

---

## 6. 다음 버전 재사용 시 변경 항목

| 변수 | 설명 | 변경 필요 조건 |
|---|---|---|
| `SECTION_ID` | 섹션 노드 ID | 문서가 바뀔 때 |
| `START_PAGE_NUMBER` | 시작 페이지 번호 | 시작 번호가 다를 때 |
| `SKIP_FRAMES` | 번호 제외 프레임 이름 | 표지/목차 프레임명이 다를 때 |
| `900` (정렬 기준) | 행 간격 임계값 | 프레임 높이+간격이 다를 때 |

### SECTION_ID 확인 방법
Figma에서 해당 섹션 클릭 → 우측 패널 하단 또는 개발자 도구에서 노드 ID 확인.
또는 Claude Talk to Figma MCP로 `get_node_info` 호출해 섹션 ID 조회.

---

## 7. 목차 페이지 번호 (수동 수정 필요)

`01` 프레임(목차)의 페이지 번호는 footer가 아닌 직접 텍스트 노드로 존재해 플러그인 자동 수정 대상에서 제외됩니다. 아래 표를 참고해 수동으로 업데이트하세요.

| 항목 | 페이지 |
|---|---|
| 접속 | 05 |
| 학교 정보 | 07 |
| 교과 선택 | 08 |
| 학생 관리 | 09 |
| 선생님 목록 | 13 |
| 수업 관리 | 15 |
| 평가 홈 | 17 |
| 평가 대상 | 18 |
| 평가 설계 | 23 |
| 과제물 관리 | 28 |
| AI 채점 | 31 |
| 채점 결과 활용 | 36 |
| 평가 리포트 | 38 |
| 평가계획 | 41 |
| 평가 참고 자료 | 45 |
