import { isPromise } from './type.utils'

const INSTANCE = Symbol('instance')

export class Lazy<T> {
  [INSTANCE]?: Awaited<T>

  constructor(private readonly function_: () => Awaited<T>) {}

  resolve(): T {
    if (this[INSTANCE]) {
      return this[INSTANCE]
    }

    const deferred = this.function_()
    const returnCallback = (value: Awaited<T>): Awaited<T> => {
      this[INSTANCE] = value
      return value
    }

    if (isPromise(deferred)) {
      return deferred.then(returnCallback) as T
    }

    return returnCallback(deferred as Awaited<T>)
  }
}
