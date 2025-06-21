import { IPaginatedResponse } from '../types'

export default class PaginationHelper {
  static pagination<T>({
    items,
    limit,
    offset,
    totalItems,
  }: {
    limit: number
    offset: number
    totalItems: number
    items: T[]
  }): IPaginatedResponse<T> {
    return {
      items,
      meta: {
        limit,
        offset,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  }
}
