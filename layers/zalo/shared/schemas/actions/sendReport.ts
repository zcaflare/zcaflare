import { z } from 'zod'
import { SendReportOptionsSchema, ThreadTypeSchema } from './_shared'

export const SendReportSchema = z.object({
  options: SendReportOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendReportInput = z.infer<typeof SendReportSchema>
