import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false, name: 'IsStepInRange' })
export class IsStepInRangeConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    if (typeof value !== 'number') return false

    const [min, max, step] = args.constraints

    const inRange = value >= min && value <= max
    const stepValid = Math.abs((value - min) * (1 / step)) % 1 === 0

    return inRange && stepValid
  }

  defaultMessage(args: ValidationArguments): string {
    const [min, max, step] = args.constraints
    return `Value must be between ${min} and ${max} in steps of ${step}`
  }
}
