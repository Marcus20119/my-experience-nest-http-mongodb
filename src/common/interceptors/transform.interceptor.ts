import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { BaseResponse } from '../types'

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, BaseResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse<T>> {
    const context_ = context.switchToHttp()
    const response = context_.getResponse()

    return next
      .handle()
      .pipe(map((data) => (data?.statusCode ? data : { data, statusCode: response.statusCode })))
  }
}
