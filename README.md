# uws test

\*이 문서는 Gemini 2.5 Pro로 작성되었습니다.

이 프로젝트는 Bun.js, TypeScript, 그리고 tsyringe를 기반으로 구축된 확장 가능한 웹소켓 서버 프레임워크입니다. 의존성 주입(DI)과 동적 메시지 라우팅을 통해 깔끔하고 유지보수하기 쉬운 코드 작성을 목표로 합니다.

## 📂 프로젝트 구조

```
.
├── src
│   ├── core/                # 프레임워크 핵심 로직 (서버, 라우터)
│   │   ├── server.service.ts
│   │   └── websocket-router.ts
│   ├── features/            # 기능별 도메인 로직 (컨트롤러)
│   │   └── message/
│   │       └── message.controller.ts
│   ├── shared/              # 공용 타입 및 유틸리티
│   │   └── types/
│   │       └── index.ts
│   └── index.ts             # 애플리케이션 진입점, DI 컨테이너 설정
├── package.json
└── tsconfig.json
```

## 🚀 시작하기

### 요구사항

- [Bun](https://bun.sh/)

### 설치

```bash
bun install
```

### 서버 실행

```bash
bun start
```

서버는 기본적으로 `6974` 포트에서 실행됩니다.

## 💡 사용 방법

### 1. 메시지 형식

클라이언트와 서버는 다음 JSON 형식의 메시지를 주고받습니다.

```json
{
  "type": "event_name_in_snake_case",
  "payload": {
    "key": "value"
  }
}
```

- `type`: 처리할 이벤트의 종류를 나타냅니다. `snake_case`로 작성합니다.
- `payload`: 이벤트에 필요한 데이터를 담습니다.

### 2. 메시지 핸들러 추가하기

새로운 종류의 메시지를 처리하려면 해당 기능을 담당하는 컨트롤러에 핸들러 메서드를 추가하면 됩니다. 라우터는 메시지의 `type`을 `PascalCase`로 변환하고 앞에 `handle`을 붙여 일치하는 이름의 메서드를 찾아 실행합니다.

예를 들어, `type`이 `new_event`인 메시지를 처리하고 싶다면, 컨트롤러에 `handleNewEvent`라는 이름의 메서드를 만들면 됩니다.

**예시: `handleJoinRoom` 핸들러 추가**

1.  **`message.controller.ts` 파일에 메서드를 추가합니다.**

    ```typescript
    // src/features/message/message.controller.ts

    import { z } from "zod";

    // ... 기존 코드

    const JoinRoomPayloadSchema = z.object({
      roomId: z.string(),
    });

    @singleton()
    export class MessageController {
      // ... 기존 handleSendMessage, handleTest 메서드

      public handleJoinRoom(ws: AppWebSocket, payload: unknown) {
        const validation = JoinRoomPayloadSchema.safeParse(payload);
        if (!validation.success) {
          this.sendValidationError(ws, validation.error);
          return;
        }

        const { roomId } = validation.data;
        console.log(`User ${ws.data.userId} joined room ${roomId}`);

        ws.send(
          JSON.stringify({
            type: "room_joined_confirmation",
            payload: {
              status: "success",
              roomId: roomId,
            },
          })
        );
      }

      private sendValidationError(ws: AppWebSocket, error: z.ZodError) {
        // ... 기존 코드
      }
    }
    ```

2.  **클라이언트에서 메시지 보내기**

    이제 클라이언트는 `type`을 `join_room`으로 설정하여 서버에 메시지를 보낼 수 있습니다.

    ```javascript
    // 클라이언트 측 코드 예시
    const ws = new WebSocket("ws://localhost:6974");

    ws.onopen = () => {
      const message = {
        type: "join_room",
        payload: {
          roomId: "general-chat-101",
        },
      };
      ws.send(JSON.stringify(message));
    };
    ```
