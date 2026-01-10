/**
 * useSTT Hook (Speech-to-Text)
 * Manages Web Speech API for voice input functionality
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseSTTOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
  lang?: string
}

export function useSTT(options: UseSTTOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const optionsRef = useRef(options)
  
  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Check browser support for Web Speech API (only once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        
        // Configure recognition
        recognitionRef.current.continuous = true  // Changed to true for continuous recording
        recognitionRef.current.interimResults = optionsRef.current.interimResults ?? true
        recognitionRef.current.lang = optionsRef.current.lang ?? 'en-US'

        // Handle results
        recognitionRef.current.onresult = (event: any) => {
          let interimText = ''
          let finalText = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalText += result[0].transcript
            } else {
              interimText += result[0].transcript
            }
          }

          if (finalText) {
            setTranscript(prev => prev + finalText)
            optionsRef.current.onResult?.(finalText.trim())
          }
          setInterimTranscript(interimText)
        }

        // Handle errors
        recognitionRef.current.onerror = (event: any) => {
          // Ignore abort errors (they're intentional)
          if (event.error === 'aborted') {
            return
          }
          const errorMessage = `Speech recognition error: ${event.error}`
          setError(errorMessage)
          optionsRef.current.onError?.(errorMessage)
          setIsListening(false)
        }

        // Handle end
        recognitionRef.current.onend = () => {
          setIsListening(false)
          setInterimTranscript('')
        }
      } else {
        setIsSupported(false)
        setError('Speech recognition is not supported in this browser')
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])  // Empty dependency array - only run once

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported')
      return
    }

    try {
      setError(null)
      setTranscript('')
      setInterimTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err) {
      setError('Failed to start speech recognition')
      console.error(err)
    }
  }, [isSupported])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (err) {
        // Ignore errors when stopping
        console.error('Error stopping recognition:', err)
        setIsListening(false)
      }
    }
  }, [isListening])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  }
}
