import { ValidateBy, ValidationOptions } from 'class-validator'

import { IsStepInRangeConstraint } from '../validators'

export function IsStepInRange(
  min: number,
  max: number,
  step: number,
  validationOptions?: ValidationOptions,
) {
  return ValidateBy({
    constraints: [min, max, step],
    name: 'IsStepInRange',
    validator: IsStepInRangeConstraint,
    ...validationOptions,
  })
}
