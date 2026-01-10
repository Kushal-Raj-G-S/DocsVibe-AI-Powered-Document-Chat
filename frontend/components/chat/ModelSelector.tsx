/**
 * ModelSelector Component
 * Dropdown pill-style selector for switching between AI models
 * 
 * NOTE: Model configurations are now centralized in config/models.ts
 * Update that file when models change.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Sparkles, Zap, Brain, FileText, Code, Lightbulb } from 'lucide-react'
import { AIModel } from '@/types/chat'
import { AVAILABLE_MODELS, getAllCategories } from '@/config/models'

// Import models from centralized configuration
const availableModels = AVAILABLE_MODELS

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  className?: string
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  className = '',
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = availableModels.find(m => m.id === selectedModel) || availableModels[0]

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />
      case 'brain':
        return <Brain className="w-4 h-4" />
      case 'zap':
        return <Zap className="w-4 h-4" />
      case 'filetext':
        return <FileText className="w-4 h-4" />
      case 'code':
        return <Code className="w-4 h-4" />
      case 'lightbulb':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  // Group models by category
  const modelsByCategory = availableModels.reduce((acc, model) => {
    const category = model.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(model)
    return acc
  }, {} as Record<string, AIModel[]>)

  const categoryOrder = ['PDF Analysis', 'General Chat', 'Reasoning', 'Coding', 'Multimodal', 'Fast Response', 'Other']

  return (
    <div className={`relative z-[100] ${className}`}>
      {/* Selected Model Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2.5 px-4 py-2.5 
          bg-gray-800/95 border border-white/20 hover:border-cyan-500/50 
          rounded-xl transition-all shadow-lg
        "
      >
        {/* Model Icon */}
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
          {getModelIcon(currentModel.icon)}
        </div>

        {/* Model Name */}
        <span className="text-sm font-medium text-white">
          {currentModel.displayName}
        </span>

        {/* Dropdown Arrow */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[150]"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="
                absolute top-full mt-2 right-0 w-80 z-[200]
                bg-gray-900/98 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-2
                shadow-2xl shadow-black/50 max-h-[70vh] overflow-y-auto
              "
            >
              {categoryOrder.map((category) => {
                const models = modelsByCategory[category]
                if (!models || models.length === 0) return null
                
                return (
                  <div key={category} className="mb-3 last:mb-0">
                    {/* Category Header */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    
                    {/* Models in Category */}
                    {models.map((model) => (
                      <ModelOption
                        key={model.id}
                        model={model}
                        isSelected={model.id === selectedModel}
                        onSelect={() => {
                          onModelChange(model.id)
                          setIsOpen(false)
                        }}
                        getModelIcon={getModelIcon}
                      />
                    ))}
                  </div>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * ModelOption Component
 * Individual model option in dropdown
 */
function ModelOption({
  model,
  isSelected,
  onSelect,
  getModelIcon,
}: {
  model: AIModel
  isSelected: boolean
  onSelect: () => void
  getModelIcon: (iconName: string) => React.ReactElement
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onSelect}
      disabled={!model.isAvailable}
      className={`
        w-full flex items-start gap-3 p-3 rounded-xl transition-all
        ${isSelected 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
          : 'hover:bg-white/5'
        }
        ${!model.isAvailable && 'opacity-50 cursor-not-allowed'}
      `}
    >
      {/* Icon */}
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-lg
        ${isSelected 
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
          : 'bg-white/5'
        }
      `}>
        {getModelIcon(model.icon)}
      </div>

      {/* Details */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
            {model.displayName}
          </span>
          {!model.isAvailable && (
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
              Unavailable
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {model.description}
        </p>
      </div>

      {/* Selected Check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <Check className="w-5 h-5 text-cyan-400" />
        </motion.div>
      )}
    </motion.button>
  )
}
