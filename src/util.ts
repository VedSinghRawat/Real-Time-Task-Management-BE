import { hash } from 'bcrypt'
import { SALT_ROUNDS } from './constants'

export const encrypt = (str: string) => hash(str, SALT_ROUNDS)
