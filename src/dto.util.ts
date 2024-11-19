import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodType } from 'zod'

export class Validator<T extends ZodType> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.schema.parse(value) as T['_output']
    } catch (error) {
      if (error instanceof ZodError) {
        console.error({ validationError: error, value })

        const errs = error.issues.reduce<{
          [key in keyof T['_output']]?: string
        }>((curr, issue) => {
          const key = issue.path[0]
          if (key) curr[key.toString() as keyof T['_output']] = issue.message

          return curr
        }, {})

        throw new BadRequestException(errs)
      }

      throw new BadRequestException('Invalid request body')
    }
  }
}
