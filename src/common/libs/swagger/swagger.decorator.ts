import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger'
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { BaseResponse, IPaginatedResponse, OrderDto, PaginationDto } from '@/common/types'

type ApiCustomResponseOptions = ApiResponseOptions & {
  type: Type<unknown>
  isArray?: boolean
}

export const ApiSuccessResponse = (options: ApiCustomResponseOptions) => {
  let schemaObject: ReferenceObject | SchemaObject = {
    $ref: getSchemaPath(options.type),
  }
  if (options.isArray) {
    schemaObject = {
      items: {
        $ref: getSchemaPath(options.type),
      },
      type: 'array',
    }
  }

  return applyDecorators(
    ApiExtraModels(BaseResponse, options.type),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponse) },
          {
            properties: {
              data: schemaObject,
            },
          },
        ],
      },
    }),
  )
}

export const ApiSuccessPaginatedResponse = (options: ApiCustomResponseOptions) => {
  const addOnOptions: Partial<ApiCustomResponseOptions> = { ...options }
  delete addOnOptions.type

  return applyDecorators(
    ApiExtraModels(BaseResponse, IPaginatedResponse, options.type, PaginationDto, OrderDto),
    ApiOkResponse({
      ...addOnOptions,
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponse) },
          {
            properties: {
              data: {
                allOf: [
                  {
                    $ref: getSchemaPath(IPaginatedResponse),
                  },
                  {
                    properties: {
                      items: {
                        items: {
                          $ref: getSchemaPath(options.type),
                        },
                        type: 'array',
                      },
                    },
                    type: 'object',
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  )
}
