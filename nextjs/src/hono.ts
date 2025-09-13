import { Hono } from "hono";
import { stream } from "hono/streaming";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = app.get("/stream", (c) => {
  return stream(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Aborted!");
    });

    await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
  });
});

export { app };

export type AppType = typeof route;
