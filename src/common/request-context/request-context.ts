import { AsyncLocalStorage } from 'node:async_hooks'

import { BadRequestException } from '@nestjs/common'

import type { Language } from '@/common/enums'
// import type { UserContext } from '@/common/modules/auth'
import { isLazy, Lazy } from '@/common/utils'

import { IfEquals } from '../types'

export class RequestContext {
  private static storage = new AsyncLocalStorage<Lazy<RequestContext> | RequestContext>()

  tokenId: string

  lang: Language

  // userContext: UserContext

  serialize(): string {
    return JSON.stringify(this)
  }

  static deserialize(data: string): RequestContext {
    const object = JSON.parse(data)
    const instance = new RequestContext()
    Object.assign(instance, object)
    return instance
  }

  static lazyCreate<T>(resolver: () => RequestContext, next: () => T): T {
    return RequestContext.storage.run(new Lazy(resolver), next)
  }

  static create<T>(value: RequestContext, next: () => T): T {
    return RequestContext.storage.run(value, next)
  }

  static current<TNullable extends boolean>(
    nullable = false as TNullable,
  ): IfEquals<TNullable, true, RequestContext | undefined, RequestContext> {
    const store = RequestContext.storage.getStore()

    if (!store && !nullable) {
      throw new Error('Request context not found, maybe you forgot to import RequestContextModule?')
    }

    return store && isLazy(store)
      ? store.resolve()
      : (store as IfEquals<TNullable, true, RequestContext | undefined, RequestContext>)
  }

  static checkRequired<TFields extends (keyof RequestContext)[]>(
    requestContext: RequestContext,
    ...fields: TFields
  ): asserts requestContext is RequestContext & Required<Pick<RequestContext, TFields[number]>> {
    for (const field of fields) {
      if (!requestContext[field]) {
        throw new BadRequestException(`Missing required field: ${field.toString()}`)
      }
    }
  }
}
