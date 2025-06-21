import { Model } from 'mongoose'

import { BaseEntity } from '@/db/base'

import { ManyRequestType, SingleRequestType } from '../types/query.type'

interface IFilterDataOutput<T> {
  items: T[]
  total: number
}

export default class DBCommand {
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves multiple documents from the database based on the specified filters and pagination options.
   *
   * @template T - A type extending BaseEntity, representing the entity model.
   * @param {Model<T>} db - The Mongoose model to query.
   * @param {ManyRequestType} payload - An object containing filters, pagination, and sorting options.
   * @returns {Promise<IFilterDataOutput<T>>} A promise that resolves to an object containing the retrieved items and the total count.
   */

  /*******  82679287-510d-42c8-a292-66dde69d541a  *******/ static async runGetMany<
    T extends BaseEntity,
  >(db: Model<T>, payload: ManyRequestType): Promise<IFilterDataOutput<T>> {
    const { filters, limit, offset, select, sort } = payload
    if (filters.id) {
      Object.assign(filters, { _id: filters.id })
    }

    const [items, total]: [T[], number] = await Promise.all([
      db
        .find({ ...filters })
        .select(select ?? [])
        .sort(sort)
        .limit(limit)
        .skip(offset),
      db.countDocuments(filters),
    ])

    return {
      items,
      total,
    }
  }

  static async runGetOne<T>(db: Model<T>, payload: SingleRequestType): Promise<null | T> {
    const { filters, select } = payload
    if (filters.id) {
      Object.assign(filters, { _id: filters.id })
    }
    delete filters.id
    return db.findOne(filters, select)
  }
}
