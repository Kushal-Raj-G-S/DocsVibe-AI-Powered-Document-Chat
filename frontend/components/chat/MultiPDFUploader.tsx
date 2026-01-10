/**
 * MultiPDFUploader Component
 * Allows uploading up to 3 PDFs when PDF Analysis models are selected
 * Shows PDF slots, upload progress, and delete functionality
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatFileSize } from '@/utils/helpers'

interface PDFSlot {
  id: string
  filename: string
  size: number
  pageCount?: number
  uploadedAt?: Date
  isUploading?: boolean
}

interface MultiPDFUploaderProps {
  pdfs: PDFSlot[]
  maxPDFs?: number
  onUpload: (file: File) => Promise<void>
  onRemove: (pdfId: string) => void
  isPDFModelSelected: boolean
  disabled?: boolean
  className?: string
}

export function MultiPDFUploader({
  pdfs,
  maxPDFs = 3,
  onUpload,
  onRemove,
  isPDFModelSelected,
  disabled = false,
  className = '',
}: MultiPDFUploaderProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/vnd.ms-powerpoint',
                       'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|pptx?)$/i)) {
      setError('Please upload a PDF, DOCX, or PPTX file')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    try {
      setUploadingIndex(pdfs.length)
      await onUpload(file)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploadingIndex(null)
    }
  }

  const emptySlots = maxPDFs - pdfs.length

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">
            Documents ({pdfs.length}/{maxPDFs})
          </span>
        </div>
        
        {!isPDFModelSelected && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-amber-400">PDF model required for multi-upload</span>
          </div>
        )}
      </div>

      {/* PDF Slots */}
      <div className="space-y-2">
        {/* Uploaded PDFs */}
        <AnimatePresence mode="popLayout">
          {pdfs.map((pdf, index) => (
            <motion.div
              key={pdf.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="glass border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {/* PDF Icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>

                {/* PDF Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {pdf.filename}
                    </p>
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatFileSize(pdf.size)}</span>
                    {pdf.pageCount && (
                      <>
                        <span>•</span>
                        <span>{pdf.pageCount} pages</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onRemove(pdf.id)}
                  disabled={disabled}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Remove document"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty Slots / Upload Areas */}
        {emptySlots > 0 && [...Array(emptySlots)].map((_, index) => {
          const slotIndex = pdfs.length + index
          const isUploading = uploadingIndex === slotIndex

          return (
            <motion.label
              key={`empty-${slotIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                block glass border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer
                ${disabled || !isPDFModelSelected
                  ? 'border-gray-700 opacity-50 cursor-not-allowed'
                  : 'border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file)
                    e.target.value = '' // Reset input
                  }
                }}
                disabled={disabled || !isPDFModelSelected || isUploading}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2 text-center">
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-sm text-cyan-400">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className={`w-6 h-6 ${isPDFModelSelected ? 'text-cyan-400' : 'text-gray-600'}`} />
                    <span className={`text-sm ${isPDFModelSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                      {isPDFModelSelected 
                        ? `Click to upload document ${slotIndex + 1}`
                        : 'Select a PDF Analysis model to upload'
                      }
                    </span>
                    {isPDFModelSelected && (
                      <span className="text-xs text-gray-500">
                        PDF, DOCX, or PPTX • Max 50MB
                      </span>
                    )}
                  </>
                )}
              </div>
            </motion.label>
          )
        })}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Message */}
      {isPDFModelSelected && pdfs.length === 0 && (
        <div className="mt-3 px-3 py-2 glass border border-cyan-500/20 rounded-lg">
          <p className="text-xs text-gray-400">
            💡 <strong className="text-cyan-400">Pro Tip:</strong> Upload up to 3 documents to analyze and compare them together!
          </p>
        </div>
      )}

      {/* Model Requirement Notice */}
      {!isPDFModelSelected && pdfs.length > 0 && (
        <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-400">
            ⚠️ <strong>Note:</strong> Only the first PDF will be used with non-PDF models. Switch to a PDF Analysis model to use all {pdfs.length} documents.
          </p>
        </div>
      )}
    </div>
  )
}
