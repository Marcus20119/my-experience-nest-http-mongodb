import { ApiProperty } from '@nestjs/swagger'

export class PresignedUrlResponse {
  @ApiProperty({
    type: String,
  })
  key: string

  @ApiProperty({
    type: String,
  })
  uploadUrl: string
}
