"use client";

import { useState } from "react";
import { honoClient } from "./honoClient";
import z from "zod";

// see https://mastra.ai/ja/reference/workflows/run-methods/stream
const streamEventTypeSchema = z.enum([
  "start",
  "step-start",
  "tool-call",
  "tool-call-streaming-start",
  "tool-call-delta",
  "step-result",
  "step-finish",
  "finish",
]);

const streamEventSchema = z.object({
  type: streamEventTypeSchema,
  payload: z.any().optional(),
});

type StreamEvent = z.infer<typeof streamEventSchema>;

export default function Page() {
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>();

  const onClick = async () => {
    setStreamEvents([]);

    const res = await honoClient.api.stream.$get();

    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");

      // 最後の要素は未完かもしれないので残す
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line) {
          continue;
        }

        const parsed = streamEventSchema.safeParse(JSON.parse(line));

        if (!parsed.success) {
          console.error("Invalid chunk:", parsed.error, line);
          continue;
        }

        const chunk = parsed.data;

        setStreamEvents((prev) => (prev ? [...prev, chunk] : [chunk]));
      }
    }

    if (buffer.trim()) {
      const parsed = streamEventSchema.safeParse(JSON.parse(buffer));

      if (!parsed.success) {
        console.error("Invalid final chunk:", parsed.error, buffer);
        return;
      }

      const chunk = parsed.data;

      setStreamEvents((prev) => (prev ? [...prev, chunk] : [chunk]));
    }
  };

  return (
    <div className="p-6 mx-auto max-w-3xl space-y-6">
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        onClick={onClick}
      >
        処理開始
      </button>

      {streamEvents && streamEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">
            ストリームイベント
          </h2>

          <div className="space-y-4">
            {streamEvents.map((d, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 shadow-sm bg-white"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-blue-600">{d.type}</h3>
                  <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(d.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
