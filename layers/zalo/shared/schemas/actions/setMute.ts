import { z } from 'zod'
import { SetMuteParamsSchema, ThreadTypeSchema } from './_shared'

export const SetMuteSchema = z.object({
  params: SetMuteParamsSchema.optional(),
  threadID: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SetMuteInput = z.infer<typeof SetMuteSchema>
