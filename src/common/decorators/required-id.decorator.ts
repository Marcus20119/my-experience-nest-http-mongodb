import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { DECORATORS } from '@nestjs/swagger/dist/constants'
import { isMongoId } from 'class-validator'

import { AnyObject } from '../types'
import { t } from '../utils'

export const RequiredId = (name = 'id') =>
  createParamDecorator(
    (_, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest()
      const param = request.params[name]

      if (!param) {
        throw new BadRequestException(t('message.base.requiredIdParam'))
      }

      if (!isMongoId(param)) {
        throw new BadRequestException(t('message.base.invalidIdParam'))
      }

      return param
    },
    [
      async (target: AnyObject, key) => {
        if (typeof key !== 'string') return
        const explicit = Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[key]) ?? []

        Reflect.defineMetadata(
          DECORATORS.API_PARAMETERS,
          [
            ...explicit,
            {
              description: `Param ${name} is required`,
              in: 'path',
              name,
              required: true,
              type: 'string',
            },
          ],
          target[key],
        )
      },
    ],
  )()
