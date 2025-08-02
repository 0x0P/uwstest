import { describe, it, expect } from "bun:test";

describe("Bun WebSocket server", () => {
  it("should handle send_message type and respond correctly", (done) => {
    const ws = new WebSocket("ws://localhost:6974");

    ws.onopen = () => {
      const message = {
        type: "send_message",
        payload: { content: "hi" },
      };
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      expect(response.type).toBe("message_confirmation");
      expect(response.payload.status).toBe("ok");
      expect(response.payload.content).toBe('Message "hi" received.');
      ws.close();
      done();
    };

    ws.onerror = (event) => {
      done(new Error("WebSocket error"));
    };
  });
});
