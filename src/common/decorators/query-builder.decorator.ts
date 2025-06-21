import { BadRequestException } from '@nestjs/common'
import { Transform, TransformFnParams } from 'class-transformer'
import { isBoolean, isBooleanString, isNumberString } from 'class-validator'

import { convertSlug } from '../utils/string.utils'

export const IsSearch = () => {
  return Transform(({ value }: TransformFnParams) => {
    if (value.includes('::')) {
      return value
    }

    return `search::${convertSlug(value)}`
  })
}

export const IsBooleanSearch = () => {
  return Transform(({ value }: TransformFnParams) => {
    if (isBoolean(value)) return value
    if (isBooleanString(value)) return value === 'true'
    return false
  })
}

export const IsNumberStringCustom = () => {
  return Transform(({ value }: TransformFnParams) => {
    const values = value
      .split(',')
      .map((v: string) => v.trim())
      .filter(Boolean)

    const hasValidNumber = values.some((v: string) => isNumberString(v))

    if (!hasValidNumber) {
      throw new BadRequestException(`Invalid number string: ${value}`)
    }

    return value
  })
}
