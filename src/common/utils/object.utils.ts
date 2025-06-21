import { AnyObject, Maybe } from '../types'
import { isNil } from './type.utils'

export const isEmpty = (object: Maybe<AnyObject>) =>
  isNil(object) || Object.keys(object).length === 0
