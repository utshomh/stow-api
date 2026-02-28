/**
 * Maps MIME types to file type categories used in subscription packages
 * Subscription packages store types like "Image", "Video", "PDF", "Audio"
 * but files have MIME types like "image/jpeg", "video/mp4", etc.
 */

const MIME_TYPE_MAP: Record<string, string> = {
  // Images
  "image/jpeg": "Image",
  "image/jpg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "image/svg+xml": "Image",
  "image/bmp": "Image",
  "image/tiff": "Image",
  "image/x-icon": "Image",

  // Videos
  "video/mp4": "Video",
  "video/mpeg": "Video",
  "video/quicktime": "Video",
  "video/x-msvideo": "Video",
  "video/x-ms-wmv": "Video",
  "video/webm": "Video",
  "video/ogg": "Video",
  "video/x-matroska": "Video",
  "video/3gpp": "Video",

  // Audio
  "audio/mpeg": "Audio",
  "audio/mp3": "Audio",
  "audio/wav": "Audio",
  "audio/wave": "Audio",
  "audio/x-wav": "Audio",
  "audio/ogg": "Audio",
  "audio/webm": "Audio",
  "audio/aac": "Audio",
  "audio/flac": "Audio",
  "audio/x-m4a": "Audio",
  "audio/opus": "Audio",

  // PDF
  "application/pdf": "PDF",
};

/**
 * Converts a MIME type to a file type category
 * @param mimetype - The MIME type (e.g., "image/jpeg")
 * @returns The file type category (e.g., "Image") or null if not recognized
 */
export function getFileTypeFromMimeType(mimetype: string): string | null {
  return MIME_TYPE_MAP[mimetype.toLowerCase()] || null;
}

/**
 * Checks if a MIME type is allowed based on subscription package file types
 * @param mimetype - The MIME type to check
 * @param allowedTypes - Array of allowed file type categories (e.g., ["Image", "Video"])
 * @returns true if the file type is allowed
 */
export function isFileTypeAllowed(
  mimetype: string,
  allowedTypes: string[],
): boolean {
  const fileType = getFileTypeFromMimeType(mimetype);
  if (!fileType) return false;
  return allowedTypes.includes(fileType);
}

