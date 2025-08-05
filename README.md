# UWS Test - Bun 기반 WebSocket 서버 프레임워크

\*이 문서는 Claude 4 sonnet으로 작성되었습니다.

## 📋 개요

UWS Test는 **Bun** 런타임을 기반으로 한 현대적인 WebSocket 서버 프레임워크입니다.

### 🌟 주요 특징

- ⚡ **고성능**: Bun의 빠른 WebSocket 구현 활용
- 🔒 **타입 안전성**: TypeScript + Zod를 통한 강력한 타입 검증
- 🏗️ **의존성 주입**: TSyringe를 활용한 모듈화된 아키텍처
- 🎯 **자동 라우팅**: 메시지 타입 기반 핸들러 자동 매핑
- 🛡️ **에러 처리**: 강력한 에러 처리 및 검증 시스템

## 🚀 빠른 시작

### 설치 및 실행

```bash
# 의존성 설치
bun install

# 개발 서버 시작 (핫 리로드)
bun start
```

서버가 `http://localhost:6974`에서 실행됩니다.

### 환경 변수

`.env` 파일을 생성하여 포트를 설정할 수 있습니다:

```env
PORT=6974
```

## 🏗️ 아키텍처

### 핵심 구조

```
src/
├── core/                    # 핵심 서비스
│   ├── server.service.ts    # WebSocket 서버 관리
│   └── websocket-router.ts  # 메시지 라우팅
├── features/                # 기능별 모듈
│   └── message/
│       └── message.controller.ts
├── shared/
│   └── types/               # 공유 타입 정의
└── index.ts                 # 애플리케이션 엔트리 포인트
```

### 메시지 처리 흐름

1. **클라이언트 연결**: WebSocket 연결 시 고유 `userId` 할당
2. **메시지 수신**: JSON 형태의 메시지 수신
3. **라우팅**: 메시지 `type`을 기반으로 적절한 핸들러 찾기
4. **처리**: 컨트롤러에서 payload 검증 및 비즈니스 로직 실행
5. **응답**: 클라이언트에게 결과 전송

## 📡 API 사용법

### 메시지 형식

모든 WebSocket 메시지는 다음 형식을 따릅니다:

```typescript
{
  type: string,     // 메시지 타입 (핸들러 매핑에 사용)
  payload: any      // 실제 데이터
}
```

### 지원되는 메시지 타입

#### 1. `send_message` - 메시지 전송

**요청:**

```json
{
  "type": "send_message",
  "payload": {
    "content": "안녕하세요!"
  }
}
```

**응답:**

```json
{
  "type": "message_confirmation",
  "payload": {
    "status": "ok",
    "content": "Message \"안녕하세요!\" received."
  }
}
```

#### 2. `test` - 서버 테스트

**요청:**

```json
{
  "type": "test",
  "payload": {}
}
```

**응답:**

```json
{
  "type": "test_response",
  "payload": {
    "message": "Test successful!"
  }
}
```

### 에러 응답

잘못된 요청이나 검증 실패 시:

```json
{
  "type": "error",
  "payload": {
    "message": "Validation failed",
    "errors": {
      "content": ["Required"]
    }
  }
}
```

## 🛠️ 개발 가이드

### 새로운 메시지 핸들러 추가

1. **핸들러 메서드 추가**:

   ```typescript
   // src/features/message/message.controller.ts
   public handleMyNewMessage(ws: AppWebSocket, payload: unknown) {
     // 로직 구현
   }
   ```

2. **스키마 정의** (선택사항):

   ```typescript
   const MyNewMessageSchema = z.object({
     // 필드 정의
   });
   ```

3. **클라이언트에서 호출**:
   ```json
   {
     "type": "my_new_message",
     "payload": {
       /* 데이터 */
     }
   }
   ```

### 자동 핸들러 매핑 규칙

메시지 타입이 자동으로 핸들러 메서드명으로 변환됩니다:

- `send_message` → `handleSendMessage`
- `user_login` → `handleUserLogin`
- `get_data` → `handleGetData`

### 새로운 컨트롤러 추가

1. **컨트롤러 생성**:

   ```typescript
   import { singleton } from "tsyringe";

   @singleton()
   export class UserController {
     public handleUserLogin(ws: AppWebSocket, payload: unknown) {
       // 로그인 로직
     }
   }
   ```

2. **의존성 등록**:
   ```typescript
   // src/index.ts
   container.register("UserController", {
     useClass: UserController,
   });
   ```

## 📦 주요 의존성

- **[Bun](https://bun.sh/)**: JavaScript 런타임 및 패키지 매니저
- **[TSyringe](https://github.com/microsoft/tsyringe)**: 의존성 주입 컨테이너
- **[Zod](https://zod.dev/)**: 스키마 검증 라이브러리
- **[TypeScript](https://www.typescriptlang.org/)**: 정적 타입 시스템

## 🧪 테스트

WebSocket 연결 테스트는 다음과 같은 도구를 사용할 수 있습니다:

- **브라우저 콘솔**:

  ```javascript
  const ws = new WebSocket("ws://localhost:6974");
  ws.onmessage = (event) => console.log(JSON.parse(event.data));
  ws.send(
    JSON.stringify({
      type: "test",
      payload: {},
    })
  );
  ```

- **WebSocket 클라이언트 도구** (Postman, Insomnia 등)

## 🔧 설정

### TypeScript 설정

프로젝트는 ES 모듈과 데코레이터를 사용하도록 설정되어 있습니다. `tsconfig.json`에서 추가 설정을 변경할 수 있습니다.

### 환경별 설정

- **개발**: `bun --hot src/index.ts` (핫 리로드 활성화)
- **프로덕션**: `bun src/index.ts`

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

**💡 팁**: WebSocket 연결 시 각 클라이언트에게 고유한 `userId`가 자동으로 할당되어 개별 클라이언트 식별이 가능합니다.
