# 202. Git 기본 — 버전관리 개념 이해하기

> Session 2: 개발 환경 기본

## 이것은 무엇인가요?

Git은 개발자들이 코드를 관리하는 데 쓰는 도구입니다. 코드의 **버전관리** — 누가, 언제, 무엇을 바꿨는지 기록하고, 필요하면 이전 버전으로 되돌릴 수 있습니다.

"최종.pptx", "최종_진짜최종.pptx" 대신, 모든 변경 기록이 체계적으로 쌓인다고 생각하면 됩니다.

## 왜 알아야 하나요?

- 코딩 에이전트가 만든 코드를 안전하게 관리할 수 있습니다
- 문제가 생겼을 때 이전 상태로 되돌릴 수 있습니다
- 여러 사람이 동시에 작업할 수 있습니다

## 핵심 개념

### Repository (저장소) — 프로젝트 폴더

Git으로 관리되는 프로젝트 폴더를 **Repository(레포)**라고 합니다. 레포 안에서 일어나는 모든 변경이 기록됩니다.

### Local → Commit → Remote

Git의 핵심 흐름은 세 단계입니다:

```
[Local]              [Commit]             [Remote]
내 컴퓨터에서        변경 사항을           GitHub에
파일을 수정한다      스냅샷으로 저장한다    업로드한다
```

![Git 워크플로우](../../image/202-1.png)

> 출처: [University of Idaho Library](https://uidaholib.github.io/get-git/3workflow.html)

#### 1. Local (내 컴퓨터)

파일을 자유롭게 수정하는 단계입니다. 아직 Git에 기록되지 않은 상태입니다.

#### 2. Commit (스냅샷 저장)

수정한 파일을 골라서(`git add`) 하나의 기록으로 묶어 저장(`git commit`)합니다.

```
commit 1: "로그인 페이지 추가"
commit 2: "비밀번호 찾기 기능 추가"
commit 3: "디자인 수정"
  └── 언제든 commit 1 시점으로 돌아갈 수 있습니다
```

> `git add`는 "이 파일을 다음 커밋에 포함시키겠다"고 **준비(stage)**하는 단계입니다.

#### 3. Remote (원격 저장소)

커밋을 GitHub 같은 원격 저장소에 올려서(`git push`) 다른 사람과 공유합니다. 반대로 다른 사람의 변경을 가져올 수도(`git pull`) 있습니다.

### 기본 명령어

| 명령어 | 하는 일 | 비유 |
|--------|---------|------|
| `git add` | 변경 사항 준비 (stage) | 택배 상자에 물건 넣기 |
| `git commit` | 변경 사항 저장 | 택배 상자 봉인 |
| `git push` | 원격에 업로드 | 택배 발송 |
| `git pull` | 원격에서 가져오기 | 택배 수령 |

## 따라해보기

이 워크숍 레포를 내 GitHub에 복사하고, 파일을 만들어서 push하는 실습입니다.

### 1단계 — Fork (내 GitHub에 복사)

1. [워크숍 레포](https://github.com/000namc/ai-native-workshop)에 접속
2. 오른쪽 상단 **Fork** 버튼 클릭
3. **Create fork** 클릭 → 내 GitHub에 동일한 레포가 생깁니다

### 2단계 — Clone (내 컴퓨터로 가져오기)

Fork한 레포 페이지에서 **Code** 버튼 → URL 복사 후 터미널에서:

```bash
git clone https://github.com/내아이디/ai-native-workshop.git
cd ai-native-workshop
```

> `내아이디` 부분을 본인의 GitHub 아이디로 바꿔주세요.

### 3단계 — 파일 만들기 (Local)

```bash
echo "hello world" > hello.md
```

`hello.md` 파일이 만들어졌습니다. 확인해봅시다:

```bash
git status
```

빨간색으로 `hello.md`가 보이면 — Git이 "새 파일이 생겼는데 아직 추적하고 있지 않다"고 알려주는 것입니다.

### 4단계 — Add & Commit (저장)

```bash
git add hello.md
git commit -m "hello world 추가"
```

- `git add` → hello.md를 커밋에 포함시킬 준비 (stage)
- `git commit` → "hello world 추가"라는 메시지와 함께 스냅샷 저장

### 5단계 — Push (GitHub에 업로드)

```bash
git push
```

내 GitHub 레포 페이지를 새로고침하면 `hello.md` 파일이 올라가 있습니다!

## 정리

- Git = 개발자들이 코드의 버전을 관리하는 도구
- 흐름: **Local**(수정) → **Commit**(저장) → **Remote**(공유)
- GitHub = Git 저장소를 클라우드에서 관리하는 서비스

---

이전: [← 201. CLI 기본](./201-cli-basics.md) | 다음: [203. Docker 기본 →](./203-docker-basics.md)
