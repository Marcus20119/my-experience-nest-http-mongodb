import { NotAcceptableException } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

import { PHONE_NUMBER_REGEX } from '../constants'
import { t } from '../utils'

@ValidatorConstraint({ async: false, name: 'phoneNumberValidator' })
export class PhoneNumberValidator implements ValidatorConstraintInterface {
  validate(phoneNumber: string): boolean {
    if (!phoneNumber) return true // Skip if empty — let @IsNotEmpty handle it
    const regex = PHONE_NUMBER_REGEX

    if (!phoneNumber || regex.exec(phoneNumber) === null) {
      throw new NotAcceptableException(t('message.base.incorrectPhoneNumber'))
    }

    return true
  }
}
