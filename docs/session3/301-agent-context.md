# 301. 맥락 관리 — agent.md 파일

> Session 3: 코딩 에이전트 기본

## 이것은 무엇인가요?

CLAUDE.md(또는 agent.md)는 코딩 에이전트에게 프로젝트의 맥락을 알려주는 파일입니다.
사람에게 업무 인수인계서를 주는 것과 같습니다.

## 왜 중요한가요?

- 에이전트는 매번 새로운 대화를 시작합니다
- 맥락 파일이 없으면 매번 처음부터 설명해야 합니다
- 잘 작성된 맥락 파일 = 일 잘하는 에이전트

## 좋은 예시 vs 나쁜 예시

| | 나쁜 예시 | 좋은 예시 |
|---|-----------|-----------|
| 프로젝트 설명 | "웹앱임" | "작업 기록이 남는 집중력 타이머 웹앱" |
| 기술 스택 | (안 적음) | "Python 3.12 / FastAPI / SQLite" |
| 구조 | "알아서 해줘" | "src/ 아래에 코드, build/ 아래에 Docker 설정" |
| 규칙 | (안 적음) | "변경은 작게, 커밋은 자주" |
| 실행 방법 | "그냥 돌려" | "docker compose -f build/docker-compose.yml up" |

핵심은 **구체적일수록 에이전트가 정확하게 일한다**는 것입니다.

## 실제 CLAUDE.md 예시

이 워크숍의 사전 준비 프로젝트에서 사용하는 [CLAUDE.md](../../pre-workshop/CLAUDE.md)를 살펴봅시다:

```markdown
# Project
**Pomodoro Timer** — 작업 기록이 남는 집중력 타이머 웹앱

# Stack
- Language: Python 3.12
- Framework: FastAPI
- DB: SQLite
- Frontend: HTML / CSS / Vanilla JS

# Directory Structure
/
├── src/              # 소스 코드
│   ├── main.py       # FastAPI 앱 엔트리포인트
│   ├── models.py     # DB 모델
│   ├── routes.py     # API 라우터
│   └── templates/    # Jinja2 HTML 템플릿
├── build/            # 개발 환경 설정
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/             # 핵심 맥락 문서

# Commands
docker compose -f build/docker-compose.yml up        # 실행
docker compose -f build/docker-compose.yml up --build # 재빌드

# Rules
- 작업 전 docs/progress.md 확인, 완료 후 업데이트한다
- 설계 결정이 생기면 docs/architecture.md에 기록한다
- 추측하지 말고 불확실하면 먼저 질문한다
- 변경은 작게, 커밋은 자주
```

이 파일 하나로 에이전트는 **무슨 프로젝트인지, 어떤 기술을 쓰는지, 어디에 코드를 넣어야 하는지, 어떤 규칙을 따라야 하는지** 바로 파악할 수 있습니다.

## 정리

- CLAUDE.md = 에이전트를 위한 업무 인수인계서
- 기술 스택, 프로젝트 구조, 규칙을 명확하게 작성
- 맥락이 좋으면 결과도 좋습니다

---

이전: [← Session 3 소개](./300-session3-intro.md) | 다음: [302. 작업환경 설계 →](./302-agent-workspace.md)
