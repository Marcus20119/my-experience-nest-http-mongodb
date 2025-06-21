import type { PipeTransform, Type } from '@nestjs/common'
import { BadRequestException, createParamDecorator } from '@nestjs/common'

import { isNil } from '@/common/utils'

import { ErrorType, IfIntersect, IsMatchPipelineType } from '../types'
import { RequestContext } from './request-context'

const requiredContext = createParamDecorator(async (data: keyof RequestContext) => {
  const requestContext = RequestContext.current()
  const value = requestContext[data]

  if (isNil(value)) {
    throw new BadRequestException(`'${data}' is missing or invalid`)
  }

  return value
})

export const RequiredContext = <
  TRequestContextKey extends keyof RequestContext,
  TPipes extends (PipeTransform | Type<PipeTransform>)[],
>(
  key: TRequestContextKey,
  ...pipes: TPipes
) => {
  const function_ = requiredContext(key, ...pipes)

  return <
    TObject extends object,
    TKey extends keyof TObject,
    TParameterIndex extends number,
    TResult = TObject[TKey] extends (...arguments_: any[]) => any
      ? IsMatchPipelineType<
          RequestContext[TRequestContextKey],
          TPipes,
          Parameters<TObject[TKey]>[TParameterIndex]
        >
      : never,
  >(
    target: TObject,
    propertyKey: TKey extends string ? TKey : never,
    parameterIndex: TParameterIndex,
  ): TResult => function_(target, propertyKey, parameterIndex) as TResult
}

export const optionalContext = createParamDecorator(async (data: keyof RequestContext) => {
  const requestContext = RequestContext.current()

  return requestContext[data]
})

export const OptionalContext = <
  TRequestContextKey extends keyof RequestContext,
  TPipes extends (PipeTransform | Type<PipeTransform>)[],
>(
  key: TRequestContextKey,
  ...pipes: TPipes
) => {
  const function_ = optionalContext(key, ...pipes)

  return <
    TObject extends object,
    TKey extends keyof TObject,
    TParameterIndex extends number,
    TResult = TObject[TKey] extends (...arguments_: any[]) => any
      ? IfIntersect<
          Parameters<TObject[TKey]>[TParameterIndex],
          null | undefined,
          IsMatchPipelineType<
            RequestContext[TRequestContextKey],
            TPipes,
            Parameters<TObject[TKey]>[TParameterIndex]
          >,
          ErrorType<'PARAMETER_MUST_BE_OPTIONAL'>
        >
      : never,
  >(
    target: TObject,
    propertyKey: TKey extends string ? TKey : never,
    parameterIndex: TParameterIndex,
  ): TResult => function_(target, propertyKey, parameterIndex) as TResult
}
