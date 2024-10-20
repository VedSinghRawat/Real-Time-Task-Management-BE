import { Validator } from 'src/dto.util'
import { z } from 'zod'

const signupSchema = z
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

export type AuthDTOSignup = z.infer<typeof signupSchema>
const signupValidator = new Validator(signupSchema)

const loginSchema = signupSchema.pick({ email: true, password: true })

export type AuthDTOLogin = z.infer<typeof loginSchema>
const loginValidator = new Validator(loginSchema)

export default { signupValidator, loginValidator }
