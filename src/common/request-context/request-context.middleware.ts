import type { NestMiddleware } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { I18nContext } from 'nestjs-i18n'

import { Language } from '@/common/enums'

import { RequestContext } from './request-context'

export class RequestContextMiddleware implements NestMiddleware {
  async use(
    request: FastifyRequest['raw'],
    _response: FastifyReply['raw'],
    next: (error?: unknown) => void,
  ) {
    RequestContext.lazyCreate(() => {
      const context = plainToInstance(RequestContext, request.headers, {
        excludeExtraneousValues: true,
      })

      for (const error of validateSync(context)) {
        context[error.property as keyof RequestContext] = Reflect.getMetadata(
          'default',
          context,
          error.property,
        )
      }

      context.lang = (I18nContext.current()?.lang as Language) ?? Language.EN

      return context
    }, next)
  }
}
