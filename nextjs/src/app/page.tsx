"use client";

import { honoClient } from "./honoClient";

export default function Page() {
  const onClick = async () => {
    const res = await honoClient.api.stream.$get();

    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const decoder = new TextDecoder();

      const text = decoder.decode(value);

      for (const line of text.trim().split("\n")) {
        if (!line) {
          continue;
        }

        console.log("Received chunk:", line);
      }
    }
  };

  return <button onClick={onClick}>Test</button>;
}
