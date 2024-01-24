import { Entity } from './base.entity'

export interface User extends Entity {
  username: string
  email: string
  password: string
}
