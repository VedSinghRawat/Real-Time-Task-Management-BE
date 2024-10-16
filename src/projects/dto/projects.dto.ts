import { Validator } from 'src/dto.util'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().min(1),
  public: z.boolean().optional(),
})
export type ProjectCreateDTO = z.infer<typeof createSchema>
const createValidator = new Validator(createSchema)

const updateSchema = createSchema.partial()
export type ProjectUpdateDTO = z.infer<typeof updateSchema>
const updateValidator = new Validator(updateSchema)

export default { createValidator, updateValidator, createSchema, updateSchema }
