import { ApiProperty } from '@nestjs/swagger'

export class SimpleResponse {
  @ApiProperty()
  success: boolean

  @ApiProperty()
  code: string

  constructor(success = true, code = 'SUCCESS') {
    this.success = success
    this.code = code
  }
}

export class BaseResponse<T> {
  @ApiProperty({ default: 200 })
  statusCode: number

  @ApiProperty()
  data: T
}
export class IMessageResponse {
  @ApiProperty({ default: true })
  success: boolean
}
