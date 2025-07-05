import { BucketType, FileCategory, MimeType } from '@/common/enums'

export const FILE_CATEGORY_CONFIG: Record<
  BucketType,
  Record<
    FileCategory,
    {
      mimeTypes: MimeType[]
      maxSize: number
    }
  >
> = {
  [BucketType.PRIVATE]: {
    [FileCategory.AVATAR]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.ICON]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.IMAGE]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.VIDEO]: {
      maxSize: 50 * 1024 * 1024, // 50MB
      mimeTypes: [
        MimeType.AVI,
        MimeType.FLV,
        MimeType.MP4,
        MimeType.M3U8,
        MimeType.TS,
        MimeType.V3GP,
        MimeType.MOV,
        MimeType.WMV,
      ],
    },
  },
  [BucketType.PUBLIC]: {
    [FileCategory.AVATAR]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.ICON]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.IMAGE]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      mimeTypes: [
        MimeType.GIF,
        MimeType.HEIC,
        MimeType.HEIF,
        MimeType.IEF,
        MimeType.JPEG,
        MimeType.PNG,
        MimeType.SVG,
        MimeType.WEBP,
      ],
    },
    [FileCategory.VIDEO]: {
      maxSize: 50 * 1024 * 1024, // 50MB
      mimeTypes: [
        MimeType.AVI,
        MimeType.FLV,
        MimeType.MP4,
        MimeType.M3U8,
        MimeType.TS,
        MimeType.V3GP,
        MimeType.MOV,
        MimeType.WMV,
      ],
    },
  },
}
