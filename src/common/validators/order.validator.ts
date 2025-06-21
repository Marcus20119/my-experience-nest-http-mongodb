import { NotAcceptableException } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

import { ORDER_PARAM_REGEX } from '../constants/base.constants'
import { t } from '../utils'

@ValidatorConstraint({ async: false, name: 'orderValidator' })
export class OrderValidator implements ValidatorConstraintInterface {
  validate(order: string): boolean {
    if (!(order && ORDER_PARAM_REGEX.test(order)))
      throw new NotAcceptableException(t('message.base.FormatOrderIncorrect'))
    return true
  }
}
