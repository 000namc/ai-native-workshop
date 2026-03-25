# Project

**Pomodoro Timer** — 작업 기록이 남는 집중력 타이머 웹앱

---

# Stack

- **Language**: Python 3.12 (via mise)
- **Framework**: FastAPI
- **DB**: SQLite
- **Frontend**: HTML / CSS / Vanilla JS (템플릿: Jinja2)

---

# Directory Structure

```
/
├── src/                  # 소스 코드
│   ├── main.py           # FastAPI 앱 엔트리포인트
│   ├── models.py         # DB 모델
│   ├── routes.py         # API 라우터
│   ├── static/           # CSS, JS
│   └── templates/        # Jinja2 HTML 템플릿
├── build/                # 개발 환경 설정
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                 # 핵심 맥락 문서
│   ├── architecture.md   # 구조 및 설계 결정
│   ├── api.md            # API 엔드포인트 정의
│   └── progress.md       # 진행 현황 및 TODO
├── .mise.toml            # 런타임 버전 관리
└── CLAUDE.md
```

---

# Commands

```bash
# 개발 환경 세팅 (처음 한 번)
mise install

# 개발 서버 실행
docker compose -f build/docker-compose.yml up

# 재빌드 (의존성 변경 시)
docker compose -f build/docker-compose.yml up --build

# 중지
docker compose -f build/docker-compose.yml down
```

---

# Rules

- 작업 전 `docs/progress.md` 확인, 완료 후 업데이트한다
- 설계 결정이 생기면 `docs/architecture.md`에 기록한다
- API 변경 시 `docs/api.md`를 함께 수정한다
- 추측하지 말고 불확실하면 먼저 질문한다
- 변경은 작게, 커밋은 자주

---

# docs/ 작성 가이드

새로운 맥락이 생길 때마다 아래 기준으로 문서를 업데이트한다.

**architecture.md** — 왜 이 구조를 선택했는지
→ 기술 선택 이유, 데이터 흐름, 주요 컴포넌트 관계

**api.md** — 어떤 엔드포인트가 있는지
→ method, path, request/response 예시

**progress.md** — 지금 어디까지 왔는지
→ 완료된 것 `[x]`, 진행 중 `[ ]`, 다음 할 일 순서대로
