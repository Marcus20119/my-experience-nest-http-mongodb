import { ApiProperty } from '@nestjs/swagger'

export class PreSignedUrlResponse {
  @ApiProperty({
    type: String,
  })
  key: string

  @ApiProperty({
    type: String,
  })
  uploadUrl: string
}
