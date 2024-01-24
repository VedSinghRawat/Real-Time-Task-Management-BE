import { z } from 'zod'
import { Validator } from '../base.validator'
import { signupSchema } from './signup.validator'

const loginSchema = signupSchema.pick({ email: true, password: true })

export type LoginDTO = z.infer<typeof loginSchema>
export const LoginValidator = new Validator(loginSchema)
