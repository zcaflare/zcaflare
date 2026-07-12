import { z } from 'zod'
import { GetGroupBlockedMemberPayloadSchema } from './_shared'

export const GetGroupBlockedMemberSchema = z.object({
  payload: GetGroupBlockedMemberPayloadSchema,
  groupId: z.string(),
})
export type GetGroupBlockedMemberInput = z.infer<typeof GetGroupBlockedMemberSchema>
