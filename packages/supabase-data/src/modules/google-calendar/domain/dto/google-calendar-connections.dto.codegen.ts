// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleCalendarConnectionsDTOSchema = z.object({
  accessToken: looseCell,
  accessTokenEncrypted: looseCell,
  autoCreateMeetForSessions: looseCell,
  consecutiveErrors: looseCell,
  createdAt: looseCell,
  googleCalendarId: looseCell,
  googleEmail: looseCell,
  id: looseCell,
  isConnected: looseCell,
  lastFullSyncAt: looseCell,
  lastIncrementalSyncAt: looseCell,
  lastSuccessfulSyncAt: looseCell,
  lastSyncAt: looseCell,
  lastSyncError: looseCell,
  lastSyncErrorCode: looseCell,
  lastWatchRenewalAt: looseCell,
  lastWebhookAt: looseCell,
  psychologistId: looseCell,
  refreshErrorCount: looseCell,
  refreshToken: looseCell,
  refreshTokenEncrypted: looseCell,
  showEventDetails: looseCell,
  showPatientName: looseCell,
  syncBlocks: looseCell,
  syncEnabled: looseCell,
  syncFromGoogle: looseCell,
  syncMeetings: looseCell,
  syncOther: looseCell,
  syncSessions: looseCell,
  syncState: looseCell,
  syncSupervisions: looseCell,
  syncTasks: looseCell,
  syncToGoogle: looseCell,
  syncToken: looseCell,
  syncTokenUpdatedAt: looseCell,
  tokenExpiresAt: looseCell,
  updatedAt: looseCell,
  watchChannelId: looseCell,
  watchChannelToken: looseCell,
  watchExpiration: looseCell,
  watchExpiresAt: looseCell,
  watchResourceId: looseCell,
})

type GoogleCalendarConnectionsDTO = z.infer<typeof GoogleCalendarConnectionsDTOSchema>

export { GoogleCalendarConnectionsDTOSchema, type GoogleCalendarConnectionsDTO }
