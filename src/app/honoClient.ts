import { AppType } from "@/hono";
import { hc } from "hono/client";

export const honoClient = hc<AppType>("");
