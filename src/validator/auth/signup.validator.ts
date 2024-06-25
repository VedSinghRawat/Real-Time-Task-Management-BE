import { z } from 'zod'
import { Validator } from '../base.validator'

export const signupSchema = z
  .object({
    username: z.string().min(1).max(24),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(20)
      .regex(/.*[A-Z].*/, 'At least one capital letter')
      .regex(/.*\d.*/, 'At least one number')
      .regex(/.*[a-z].*/, 'At least one lowercase letter')
      .regex(/..*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~].*/, 'At least one special character'),
  })
  .required()

export type SignupDTO = z.infer<typeof signupSchema>
export const SignupValidator = new Validator(signupSchema)
