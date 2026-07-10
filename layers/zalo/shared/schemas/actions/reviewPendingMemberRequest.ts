import { z } from 'zod'
import { ReviewPendingMemberRequestPayloadSchema } from './_shared'

export const ReviewPendingMemberRequestSchema = z.object({
  payload: ReviewPendingMemberRequestPayloadSchema,
  groupId: z.string(),
})
export type ReviewPendingMemberRequestInput = z.infer<typeof ReviewPendingMemberRequestSchema>
