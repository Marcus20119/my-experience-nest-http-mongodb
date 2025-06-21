import type { PipeTransform, Type } from '@nestjs/common'

const BRAND = Symbol()

export type Brand<T, B extends string> = T & { [BRAND]?: B }

export type UnType<T> = T extends Type<infer U> ? U : T

export type ErrorType<T extends string> = Brand<T, T>

export type IsMatchPipelineType<
  TInput,
  TPipes extends (PipeTransform | Type<PipeTransform>)[],
  TOutput,
> = TPipes extends [
  infer TPipe extends PipeTransform | Type<PipeTransform>,
  ...infer TRestPipes extends (PipeTransform | Type<PipeTransform>)[],
]
  ? Parameters<UnType<TPipe>['transform']>[0] extends TInput
    ? IsMatchPipelineType<ReturnType<UnType<TPipe>['transform']>, TRestPipes, TOutput>
    : ErrorType<'INVALID_PIPELINE'>
  : TOutput extends TInput
    ? void
    : ErrorType<'PARAMETER_TYPE_MISMATCH'>

export type IfIntersect<T1, T2, True, False> = Extract<T1, T2> extends never ? False : True

export type IfEquals<T, U, Y = unknown, N = never> =
  (<G>() => G extends T ? true : false) extends <G>() => G extends U ? true : false ? Y : N

export type AnyObject = Record<string, any>

export type Maybe<T> = null | T | undefined
