import { z } from 'zod'
import { AttachmentSourceSchema, ThreadTypeSchema } from './_shared'

export const UploadAttachmentSchema = z.object({
  sources: z.union([AttachmentSourceSchema, z.array(AttachmentSourceSchema)]),
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type UploadAttachmentInput = z.infer<typeof UploadAttachmentSchema>
