import { NotAcceptableException } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

import { t } from '../utils'

function isFilePath(str: string): boolean {
  const filePathRegex = /^[a-zA-Z0-9_\-/.]{1,255}$/

  return filePathRegex.test(str)
}

@ValidatorConstraint({ async: false, name: 'filePathValidator' })
export class FilePathValidator implements ValidatorConstraintInterface {
  validate(filePath: string): boolean {
    if (!isFilePath(filePath)) throw new NotAcceptableException(t('message.base.invalidFilePath'))
    return true
  }
}
