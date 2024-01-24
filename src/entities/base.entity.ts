export type Entity<T extends 'id' | 'uuid' = 'id'> = {
  createdAt: Date
} & (T extends 'id'
  ? {
      id: number
    }
  : {
      uuid: string
    })
