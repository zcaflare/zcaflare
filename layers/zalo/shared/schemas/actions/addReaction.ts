import { z } from 'zod'
import { AddReactionDestinationSchema, CustomReactionSchema, ReactionsSchema } from './_shared'

export const AddReactionSchema = z.object({
  icon: z.union([ReactionsSchema, CustomReactionSchema]),
  dest: AddReactionDestinationSchema,
})
export type AddReactionInput = z.infer<typeof AddReactionSchema>
