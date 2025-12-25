'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Import translation files
import trTranslations from '../locales/tr.json'
import enTranslations from '../locales/en.json'

const translations = {
  tr: trTranslations,
  en: enTranslations
}

// Default language - Turkish
const defaultLanguage = 'tr'

// Create context
const I18nContext = createContext()

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}

// Translation function
function t(key, language, params = {}) {
  const keys = key.split('.')
  let value = translations[language]
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key // Return the key itself if translation not found
    }
  }
  
  // Replace parameters in the translation string
  if (typeof value === 'string' && params) {
    return value.replace(/{(\w+)}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match
    })
  }
  
  return value
}

// Provider component
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(defaultLanguage)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-language', language)
  }, [language])

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage)
    }
  }

  const translate = (key, params) => t(key, language, params)

  const value = {
    language,
    changeLanguage,
    t: translate,
    availableLanguages: Object.keys(translations)
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Higher-order component for class components (if needed)
export function withTranslation(WrappedComponent) {
  return function WithTranslationComponent(props) {
    const translation = useTranslation()
    return <WrappedComponent {...props} t={translation.t} language={translation.language} />
  }
}