export const API_VERSION = 'v1'

export const defaultTimezone = 'Asia/Ho_Chi_Minh'

export const ORDER_PARAM_REGEX = /^[a-zA-Z0-9.]+:(asc|desc)$/

export const APP_ENV = {
  LOCAL: 'local',
  RELEASE: 'release',
  STAGING: 'staging',
  TEST: 'test',
  UAT: 'uat',
}

export const QUEUE_KEY = {
  EMAIL_QUEUE: 'email-queue',
}

export const PHONE_NUMBER_REGEX = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/

export const bcrypt = {
  salt: Number.parseInt(process.env.SALT_ROUND as string) || 5,
}

export const ID_START_NUMBER = 100_000

export const LOGIN_URL = 'https://admin.taxiloyal.com/login'

export const FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/gif']

export enum S3FolderPrefix {
  ATTACHMENT = 'attachments',
  AVATAR = 'avatars',
  BANNER = 'banners',
  EXCEL = 'excels',
}

export const DATE_TIME_FORMAT = 'DD/MM/YYYY, HH:mm'
