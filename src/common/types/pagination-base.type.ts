import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator'

import { SortType } from '../enums'
import { OrderValidator } from '../validators/order.validator'
import {
  RangeDateQueryDto,
  RangeNumberQueryDto,
  RangeStringQueryDto,
  SearchInputDto,
  WhereInputDto,
} from './query.type'

export class IMeta {
  @ApiProperty({
    default: 10,
    type: Number,
  })
  limit: number

  @ApiProperty({
    default: 0,
    type: Number,
  })
  offset: number

  @ApiProperty()
  total: number

  @ApiPropertyOptional({ nullable: true })
  totalPages?: number
}

export interface ISortInput {
  sortBy: string
  sortType: SortType
}

export class IPaginatedResponse<T> {
  @ApiProperty()
  items: T[]

  @ApiProperty({ type: IMeta })
  meta: IMeta
}

export interface FilterPaginationOutput<T> {
  items: T[]
  total: number
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ default: 10, type: Number })
  readonly limit: number = 10

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ default: 0, type: Number })
  readonly offset: number = 0
}

export class OrderDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    description: 'Format: fieldName:[asc,desc]',
    nullable: true,
  })
  @Validate(OrderValidator)
  order: string
}

export class QuerySingleDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WhereInputDto)
  queries?: WhereInputDto[]

  @IsOptional()
  @IsString({ each: true })
  selectFields?: string[]
}

export class SortInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  sortBy: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ enum: SortType, enumName: 'SortType' })
  sortType: SortType
}

export interface RawFilterDto {
  [key: string]: any
}

export class QueryFilterDto extends QuerySingleDto {
  @ValidateNested()
  @Type(() => PaginationDto)
  @ApiProperty()
  pagination: PaginationDto

  @IsOptional()
  @ValidateNested()
  @Type(() => SortInputDto)
  @ApiPropertyOptional({ nullable: true })
  order?: SortInputDto

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RangeNumberQueryDto)
  @ApiPropertyOptional({ nullable: true, type: [RangeNumberQueryDto] })
  rangeNumberFilters?: RangeNumberQueryDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RangeDateQueryDto)
  @ApiPropertyOptional({ nullable: true, type: [RangeDateQueryDto] })
  rangeDateFilters?: RangeDateQueryDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RangeStringQueryDto)
  @ApiPropertyOptional({ nullable: true, type: [RangeStringQueryDto] })
  rangeStringFilters?: RangeStringQueryDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SearchInputDto)
  @ApiPropertyOptional({ nullable: true, type: [SearchInputDto] })
  searches?: SearchInputDto[]
}
