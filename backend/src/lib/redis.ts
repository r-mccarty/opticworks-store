import Redis from "ioredis"
import { env } from "./env"

let client: Redis | undefined

/** Shared client for app-level keys (rate limits). */
export function redis(): Redis {
  if (!client) {
    client = new Redis(env().REDIS_URL, {
      keyPrefix: "ow:",
      maxRetriesPerRequest: 2,
      // Queue commands issued before the connection is up (otherwise the first
      // requests after boot fail), but cap how long any command may wait.
      enableOfflineQueue: true,
      commandTimeout: 500,
    })
  }
  return client
}

