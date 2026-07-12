import { z } from 'zod'

export const LastOnlineSchema = z.object({
  uid: z.string(),
})
export type LastOnlineInput = z.infer<typeof LastOnlineSchema>
