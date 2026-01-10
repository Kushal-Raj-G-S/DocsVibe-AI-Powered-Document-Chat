/**
 * File Analyzer - Frontend utility for file type detection
 * Mirrors backend FileAnalyzer logic for client-side validation
 */

export interface FileAnalysis {
  filename: string;
  fileSize: number;
  fileSizeMB: number;
  fileExtension: string;
  fileType: 'pdf' | 'image' | 'docx' | 'pptx' | null;
  category: 'document' | 'image' | 'unknown';
  isSupported: boolean;
}

export interface FileCategory {
  extensions: string[];
  mimeTypes: string[];
  category: 'document' | 'image';
  requiresExtraction: boolean;
  supportsNative: boolean;
}

const FILE_CATEGORIES: Record<string, FileCategory> = {
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    category: 'document',
    requiresExtraction: true,
    supportsNative: true,
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
    category: 'image',
    requiresExtraction: false,
    supportsNative: true,
  },
  docx: {
    extensions: ['.doc', '.docx'],
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    category: 'document',
    requiresExtraction: true,
    supportsNative: false,
  },
  pptx: {
    extensions: ['.ppt', '.pptx'],
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    category: 'document',
    requiresExtraction: true,
    supportsNative: false,
  },
};

/**
 * Analyze a file and return detailed metadata
 */
export function analyzeFile(file: File): FileAnalysis {
  const fileExtension = getFileExtension(file.name);
  const fileType = detectFileType(fileExtension, file.type);
  const fileInfo = fileType ? FILE_CATEGORIES[fileType] : null;

  return {
    filename: file.name,
    fileSize: file.size,
    fileSizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
    fileExtension,
    fileType,
    category: fileInfo?.category || 'unknown',
    isSupported: fileType !== null,
  };
}

/**
 * Detect file type based on extension and MIME type
 */
function detectFileType(
  extension: string,
  mimeType: string
): 'pdf' | 'image' | 'docx' | 'pptx' | null {
  for (const [fileType, info] of Object.entries(FILE_CATEGORIES)) {
    if (info.extensions.includes(extension)) {
      return fileType as any;
    }
    if (info.mimeTypes.includes(mimeType)) {
      return fileType as any;
    }
  }
  return null;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSizeMB: number,
  maxSizeMB: number = 50
): { isValid: boolean; error?: string } {
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `File too large (${fileSizeMB}MB). Maximum: ${maxSizeMB}MB`,
    };
  }
  return { isValid: true };
}

/**
 * Get file category (quick helper)
 */
export function getFileCategory(filename: string): 'document' | 'image' | 'unknown' {
  const extension = getFileExtension(filename);
  const fileType = detectFileType(extension, '');
  
  if (fileType && FILE_CATEGORIES[fileType]) {
    return FILE_CATEGORIES[fileType].category;
  }
  return 'unknown';
}

/**
 * Check if file is supported
 */
export function isFileSupported(filename: string): boolean {
  const extension = getFileExtension(filename);
  const fileType = detectFileType(extension, '');
  return fileType !== null;
}

/**
 * Get supported file extensions as array
 */
export function getSupportedExtensions(): string[] {
  const extensions: string[] = [];
  Object.values(FILE_CATEGORIES).forEach(category => {
    extensions.push(...category.extensions);
  });
  return extensions;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
