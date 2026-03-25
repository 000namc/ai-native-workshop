# 203. Docker 기본 — 개발환경 세팅법

> Session 2: 개발 환경 기본

## 이것은 무엇인가요?

Docker는 개발 환경을 통째로 패키징해서 어디서든 동일하게 실행할 수 있게 해주는 도구입니다.

## 왜 알아야 하나요?

- "내 컴퓨터에서는 되는데..." 문제를 해결합니다
- 에이전트가 만든 앱을 누구나 동일하게 실행할 수 있습니다
- 복잡한 환경 설정 없이 한 번에 실행할 수 있습니다

## 핵심 개념

### 컨테이너 — 가벼운 가상 컴퓨터

```
내 컴퓨터
├── 컨테이너 A: 웹 서버 (Node.js)
├── 컨테이너 B: 데이터베이스 (SQLite)
└── 서로 독립적으로 동작, 필요할 때 연결
```

| 개념 | 비유 |
|------|------|
| Image | 레시피 (설계도) |
| Container | 레시피로 만든 요리 (실행 중인 환경) |
| Dockerfile | 레시피를 적어놓은 파일 |
| docker-compose | 여러 요리를 동시에 만드는 코스 메뉴 |

### Dockerfile — 환경 설계도

```dockerfile
FROM node:18          # Node.js가 설치된 환경에서 시작
COPY . /app           # 내 코드를 컨테이너에 복사
RUN npm install       # 필요한 패키지 설치
CMD ["node", "server.js"]  # 서버 실행
```

### docker-compose — 한 번에 실행

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"   # 내 컴퓨터 3000번 포트로 접속 가능
```

## 따라해보기

<!-- TODO: Docker 실습 단계 작성 -->

## 정리

- Docker = 개발 환경을 통째로 패키징하는 도구
- Dockerfile로 환경을 정의하고, docker-compose로 한 번에 실행
- "docker compose up" 한 줄이면 앱이 실행됩니다

---

이전: [← 202. Git 기본](./202-git-basics.md) | 다음: [Session 3. 코딩 에이전트 기본 →](../session3/300-session3-intro.md)
