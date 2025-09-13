import { Hono } from "hono";
import { stream } from "hono/streaming";
import { mastra } from "./mastra";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const route = app.get("/stream", async (c) => {
  const run = await mastra.getWorkflow("weatherWorkflow").createRunAsync();

  const { stream: workflowStream } = run.stream({
    inputData: { city: "tokyo" }, // tokyoで固定
  });

  return stream(c, async (stream) => {
    for await (const chunk of workflowStream) {
      await stream.write(JSON.stringify(chunk) + "\n");
    }
  });
});

export { app };

export type AppType = typeof route;
