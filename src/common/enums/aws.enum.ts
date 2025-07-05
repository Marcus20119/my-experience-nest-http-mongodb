/* eslint-disable perfectionist/sort-enums */
export enum BucketType {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum FileCategory {
  AVATAR = 'avatar',
  ICON = 'icon',
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum ResizeLevel {
  LARGE = 1024,
  MEDIUM = 512,
  SMALL = 256,
}

export enum MimeType {
  // Images
  GIF = 'image/gif',
  HEIC = 'image/heic',
  HEIF = 'image/heif',
  IEF = 'image/ief',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  SVG = 'image/svg+xml',
  WEBP = 'image/webp',

  // Documents
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // Video
  AVI = 'video/x-msvideo',
  FLV = 'video/x-flv',
  MP4 = 'video/mp4',
  M3U8 = 'application/x-mpegURL',
  TS = 'video/MP2T',
  V3GP = 'video/3gpp',
  MOV = 'video/quicktime',
  WMV = 'video/x-ms-wmv',
}
