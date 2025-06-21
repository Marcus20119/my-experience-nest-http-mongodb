import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { FilterQuery } from 'mongoose'

export class RangeNumberQueryDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  eq: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  ne: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  gte: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  lte: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  gt: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ nullable: true })
  lt: number;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ nullable: true, type: [Number] })
  in: number[]

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ nullable: true, type: [Number] })
  nin: number[]
}

export class RangeDateQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  eq: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  ne: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  gte: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  lte: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  gt: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ nullable: true })
  lt: Date;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ nullable: true, type: [Date] })
  in: Date[]

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ nullable: true, type: [Date] })
  nin: Date[]
}

export class RangeStringQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  eq?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  ne?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  gte?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  lte?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  gt?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  lt?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({ nullable: true, type: [String] })
  in?: string[]

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({ nullable: true, type: [String] })
  nin?: string[]
}

export class WhereInputDto {
  @IsNotEmpty()
  @IsString()
  fieldName: string

  @IsNotEmpty()
  value: any
}

export class SearchInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsNotEmpty()
  @ApiProperty()
  keyword: string
}

export class ManyRequestType {
  filters: FilterQuery<any>
  sort?: { [key: string]: -1 | 1 }
  limit: number
  offset: number
  select?: string
}

export class SingleRequestType {
  filters: FilterQuery<any>
  select: string
}
