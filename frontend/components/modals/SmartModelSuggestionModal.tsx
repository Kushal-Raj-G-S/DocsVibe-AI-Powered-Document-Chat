"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Suggestion,
  getSuggestionIcon,
  getSuggestionColors,
  getActionButtonVariant,
  formatDetailsText,
} from '@/utils/fileRouter/suggestionFormatter';

interface SmartModelSuggestionModalProps {
  isOpen: boolean;
  suggestion: Suggestion;
  onClose: () => void;
  onAction: (action: string, modelId?: string) => void;
}

export default function SmartModelSuggestionModal({
  isOpen,
  suggestion,
  onClose,
  onAction,
}: SmartModelSuggestionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const colors = getSuggestionColors(suggestion.type);
  const icon = getSuggestionIcon(suggestion.type);
  const buttonVariant = getActionButtonVariant(suggestion.action);
  const detailsLines = formatDetailsText(suggestion.details);

  const handleAction = async () => {
    if (!suggestion.action) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      await onAction(suggestion.action, suggestion.recommendedModel || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full max-w-md rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 shadow-2xl`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${colors.text}`}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon and Title */}
            <div className="mb-4 flex items-start gap-3">
              <div className="text-4xl">{icon}</div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${colors.text}`}>
                  {suggestion.title}
                </h3>
                <p className={`mt-2 text-sm ${colors.text}`}>
                  {suggestion.message}
                </p>
              </div>
            </div>

            {/* Details */}
            {detailsLines.length > 0 && (
              <div
                className={`mb-4 rounded-lg border ${colors.border} bg-white/50 p-4 dark:bg-black/20`}
              >
                {detailsLines.map((line, index) => (
                  <p
                    key={index}
                    className={`text-sm ${colors.text} ${
                      index > 0 ? 'mt-1' : ''
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Compatible Models (if any) */}
            {suggestion.compatibleModels &&
              suggestion.compatibleModels.length > 0 && (
                <div className="mb-4">
                  <p className={`text-xs font-semibold uppercase ${colors.text} mb-2`}>
                    Compatible Models:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.compatibleModels.map((model) => (
                      <span
                        key={model}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* File Count Info */}
            {suggestion.maxFiles !== undefined &&
              suggestion.currentCount !== undefined && (
                <div className="mb-4">
                  <p className={`text-xs ${colors.text}`}>
                    Current: {suggestion.currentCount} / {suggestion.maxFiles}{' '}
                    files
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        suggestion.currentCount > suggestion.maxFiles
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (suggestion.currentCount / suggestion.maxFiles) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {suggestion.action && (
                <Button
                  onClick={handleAction}
                  disabled={isProcessing}
                  variant={buttonVariant}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : suggestion.actionText}
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                {suggestion.action ? 'Cancel' : 'Close'}
              </Button>
            </div>

            {/* Severity Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full ${
                    i <
                    (suggestion.severity === 'high'
                      ? 3
                      : suggestion.severity === 'medium'
                      ? 2
                      : 1)
                      ? suggestion.type === 'error'
                        ? 'bg-red-500'
                        : suggestion.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
