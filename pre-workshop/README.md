# 사전 준비 — 뽀모도로 타이머 만들어보기

> 워크숍 전에 코딩 에이전트를 직접 체험해보는 과정입니다.
> 이 과정을 완료하면 워크숍을 훨씬 더 알차게 들을 수 있습니다!

---

## 1단계: Claude Code 설치

### Mac

1. [Claude Desktop App](https://claude.ai/download) 설치
2. 앱 실행 후 **Code 탭** 진입 → 바로 시작!

### Windows

1. [Claude Desktop App](https://claude.ai/download) 설치
2. [Git Desktop App](https://git-scm.com/downloads/win) 설치
3. Windows PowerShell을 열고 아래 명령 실행:

```powershell
[System.Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', 'C:\Program Files\Git\bin\bash.exe', 'User')
```

4. [Docker Desktop App](https://www.docker.com/products/docker-desktop/) 설치

> 설치 과정에서 재부팅이 필요할 수 있습니다.

---

## 2단계: 프로젝트 폴더 준비

1. 작업할 폴더를 하나 만듭니다 (예: `~/workspace/pomodoro-timer`)
2. 이 폴더 안에 있는 [`CLAUDE.md`](./CLAUDE.md) 파일을 해당 폴더에 복사합니다

```
pomodoro-timer/
└── CLAUDE.md    ← 이 파일이 에이전트의 "업무 인수인계서" 입니다
```

---

## 3단계: Claude Code에서 만들기

Claude Code를 열고, 2단계에서 만든 폴더로 이동한 뒤 아래 명령을 입력하세요:

```
CLAUDE.md를 읽고, 뽀모도로 타이머 웹앱을 만들어줘.
기본 기능: 25분 집중 / 5분 휴식 타이머, 세션 완료 시 DB에 기록 저장, 오늘의 작업 기록 목록 표시.
build/ 아래에 Dockerfile과 docker-compose.yml도 함께 만들어줘.
```

에이전트가 알아서 코드를 작성하고, Docker 설정까지 만들어줍니다.

---

## 4단계: 실행 확인

에이전트가 작업을 완료하면 아래 명령으로 실행해보세요:

```bash
docker compose -f build/docker-compose.yml up
```

브라우저에서 `http://localhost:3000` 에 접속하면 뽀모도로 타이머가 나타납니다!

<!-- TODO: 완성 스크린샷 추가 -->

---

## 잘 안 되나요?

- Docker Desktop이 실행 중인지 확인해주세요
- 에이전트에게 "오류가 나는데 확인해줘" 라고 말하면 알아서 수정합니다
- 그래도 안 되면 워크숍에서 함께 해결합니다 — 걱정 마세요!
