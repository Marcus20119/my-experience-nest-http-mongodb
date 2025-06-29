import { isNumberString } from 'class-validator'
import { AnyObject, FilterQuery, Model } from 'mongoose'

import { SortType } from '../enums'
import {
  OrderDto,
  PaginationDto,
  QueryFilterDto,
  QuerySingleDto,
  RawFilterDto,
  SortInputDto,
} from '../types'
import {
  ManyRequestType,
  RangeDateQueryDto,
  RangeNumberQueryDto,
  RangeStringQueryDto,
  SearchInputDto,
  SingleRequestType,
  WhereInputDto,
} from '../types/query.type'
import { escapeSpecialChars } from './string.utils'

export default class BuildQuery {
  static buildFilterRequest(input: RawFilterDto) {
    const searchPrefix = 'search::'

    const searches: SearchInputDto[] = []
    const rangeStringFilters: RangeStringQueryDto[] = []
    for (const key of Object.keys(input)) {
      const searchValue = input[key]
      if (typeof searchValue === 'object') {
        rangeStringFilters.push({ fieldName: key, ...searchValue })
        continue
      }

      if (typeof searchValue === 'string' && searchValue.startsWith(searchPrefix)) {
        searches.push({
          fieldName: key,
          keyword: searchValue.slice(searchPrefix.length),
        })
      } else {
        rangeStringFilters.push({
          eq: searchValue,
          fieldName: key,
        })
      }
    }

    return { rangeStringFilters, searches }
  }

  static buildOrderRequest(input: string): SortInputDto {
    const items = input.split(':')
    return {
      sortBy: items[0],
      sortType: items[1] as SortType,
    }
  }

  static buildManyRequest(input: QueryFilterDto): ManyRequestType {
    const { limit, offset } = input.pagination || { limit: 10, offset: 0 }

    const select = input.selectFields ? input.selectFields.join(' ') : ''
    const filters: FilterQuery<any> = BuildQuery.buildDataQuery(input)

    return {
      filters,
      limit,
      offset,
      select,
      sort: input.order
        ? {
            [input.order.sortBy]: input.order.sortType === SortType.Asc ? 1 : -1,
          }
        : { createdAt: -1 },
    }
  }

  static getManyRequest({
    filter,
    orderBy,
    pagination,
  }: {
    pagination: PaginationDto
    filter?: RawFilterDto
    orderBy?: OrderDto
  }): ManyRequestType {
    let buildFilter: RawFilterDto = {}
    let order: SortInputDto | undefined
    if (filter) {
      buildFilter = this.buildFilterRequest(filter)
    }

    if (orderBy?.order) {
      order = this.buildOrderRequest(orderBy.order)
    }

    return this.buildManyRequest({
      pagination,
      ...buildFilter,
      order,
    })
  }

  static getOneRequest(input: QuerySingleDto): SingleRequestType {
    const select = input.selectFields ? input.selectFields.join(' ') : ''
    const query: FilterQuery<any> = {}

    if (input.queries?.length) {
      for (const q of input.queries) {
        Object.assign(query, { [q.fieldName]: q.value })
      }
    }
    return {
      filters: query,
      select,
    }
  }

  static buildDataQuery(input: QueryFilterDto): FilterQuery<any> {
    let query: FilterQuery<any>

    query = {}

    if (input.queries?.length) {
      for (const q of input.queries) {
        Object.assign(query, { [q.fieldName]: q.value })
      }
    }

    if (input.rangeDateFilters) {
      for (const q of input.rangeDateFilters) {
        query = BuildQuery.buildRangeQuery(query, q)
      }
    }

    if (input.rangeNumberFilters) {
      for (const q of input.rangeNumberFilters) {
        query = BuildQuery.buildRangeQuery(query, q)
      }
    }

    if (input.rangeStringFilters) {
      for (const q of input.rangeStringFilters) {
        query = BuildQuery.buildRangeQuery(query, q)
      }
    }

    if (input.searches) {
      for (const q of input.searches) {
        query = BuildQuery.buildSearchQuery(query, q)
      }
    }

    return query
  }

  static buildRangeQuery(
    query: FilterQuery<any>,
    range: RangeDateQueryDto | RangeNumberQueryDto | RangeStringQueryDto,
  ) {
    const operators = {
      eq: '$eq',
      gt: '$gt',
      gte: '$gte',
      in: '$in',
      lt: '$lt',
      lte: '$lte',
      ne: '$ne',
      nin: '$nin',
    } as const

    const rangeQuery = Object.fromEntries(
      Object.entries(range)
        .filter(([key, value]) => key !== 'fieldName' && value !== undefined && key in operators)
        .map(([key, value]) => [operators[key as keyof typeof operators], value]),
    )

    return {
      ...query,
      [range.fieldName]: rangeQuery,
    }
  }

  static buildQuery(query: FilterQuery<any>, where: WhereInputDto) {
    return Object.assign(query, {
      [where.fieldName]: where.value,
    })
  }

  static buildSort(sort: any, sortInput: SortInputDto) {
    return {
      ...sort,
      [sortInput.sortBy]: sortInput.sortType === SortType.Asc ? 1 : -1,
    }
  }

  static buildSearchQuery(query: FilterQuery<any>, searchRequest: SearchInputDto) {
    return Object.assign(query, {
      [searchRequest.fieldName]: {
        $options: 'i',
        $regex: `.*${escapeSpecialChars(searchRequest.keyword)}.*`,
      },
    })
  }

  static buildMultipleSearchQuery(query: FilterQuery<any>, searchRequest: SearchInputDto) {
    query['$and'] = query['$and'] ?? []

    const keywords = searchRequest.keyword
      .split(',')
      .map((kw) => kw.trim())
      .filter(Boolean)

    const orConditions = keywords.map((keyword) => ({
      [searchRequest.fieldName]: isNumberString(keyword)
        ? Number(keyword)
        : { $options: 'i', $regex: `.*${escapeSpecialChars(keyword)}.*` },
    }))

    query['$and'].push({ $or: orConditions })
  }

  static buildRegex(key: string, keyword: string): Record<string, any> {
    return {
      [key]: {
        $options: 'i',
        $regex: `.*${escapeSpecialChars(keyword)}.*`,
      },
    }
  }

  static readonly addDateRangeQuery = (
    queryObject: AnyObject,
    field: string,
    fromDate?: Date,
    toDate?: Date,
  ) => {
    if (fromDate && toDate) {
      if (!queryObject['$and']) {
        queryObject['$and'] = []
      }
      queryObject['$and'].push(
        {
          [field]: {
            $gte: fromDate,
          },
        },
        {
          [field]: {
            $lte: toDate,
          },
        },
      )
    }
  }

  static readonly combineCondition = (query: FilterQuery<any>, addOnQuery: FilterQuery<any>) => {
    const orCondition = query['$or'] ?? []
    orCondition.push(...(addOnQuery['$or'] ?? []))

    const andCondition = query['$and'] ?? []
    andCondition.push(...(addOnQuery['$and'] ?? []))

    const combinedCondition = {
      ...query,
      ...addOnQuery,
    }

    if (orCondition.length > 0) {
      combinedCondition['$or'] = orCondition
    }

    if (andCondition.length > 0) {
      combinedCondition['$and'] = andCondition
    }

    return combinedCondition
  }

  static readonly queryWithSelectedIds = async <T>(
    model: Model<T>,
    input: {
      ids: string[]
      isIgnore: boolean
    },
    payload: ManyRequestType,
  ): Promise<{ updatedPayload: ManyRequestType; selectedItems: T[]; totalIds: number }> => {
    const { ids, isIgnore } = input
    const selectedItems: T[] = []
    let totalIds = 0
    if (isIgnore) {
      // Exclude specified employee IDs
      payload.filters['_id'] = { $nin: ids }
    } else {
      const { limit, offset } = payload
      totalIds = ids.length

      if (offset >= totalIds) {
        // If offset is beyond the specified IDs, only fetch non-specified items
        payload.offset = offset - totalIds
        payload.filters['_id'] = { $nin: ids }
      } else {
        // Handle pagination within specified IDs
        const remainingIds = ids.slice(offset)
        const remainingLimit = Math.min(limit, remainingIds.length)

        if (remainingLimit === limit) {
          // If we can get all requested items from specified IDs
          payload.filters['_id'] = { $in: remainingIds.slice(0, limit) }
        } else {
          // If we need to combine specified and non-specified items
          const selectedIds = remainingIds
          const items = await model.find({
            _id: { $in: selectedIds },
          })
          selectedItems.push(...items)

          // Adjust pagination for remaining non-specified items
          payload.offset = 0
          payload.limit = limit - remainingLimit
          payload.filters['_id'] = { $nin: ids }
        }
      }
    }
    return { selectedItems, totalIds, updatedPayload: payload }
  }
}
