import { z } from 'zod'
import { UploadProductPhotoPayloadSchema } from './_shared'

export const UploadProductPhotoSchema = z.object({
  payload: UploadProductPhotoPayloadSchema,
})
export type UploadProductPhotoInput = z.infer<typeof UploadProductPhotoSchema>
