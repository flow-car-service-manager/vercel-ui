'use client'

import './globals.css'
import { I18nProvider, useTranslation } from '../lib/i18n'
import { useState, useEffect } from 'react'
import {
  Settings,
  Building,
  ChevronDown,
  Car,
  Users,
  Wrench,
  Package,
  BarChart3,
  Calendar,
  UserCog,
  Menu,
  X
} from 'lucide-react'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <I18nProvider>
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}

// Header component with language switcher
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      {/* Logo and Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center py-3 mr-8">

          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Flow Car Service
                </h1>
                <p className="text-xs text-gray-500">Professional Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Navigation />
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <SettingsDropdown />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-primary-600 p-2 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 pt-4 pb-6">
            <MobileNavigation onNavigate={() => setIsMobileMenuOpen(false)} />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Desktop Navigation component
function Navigation() {
  const { t } = useTranslation()
  const [activePath, setActivePath] = useState('/')

  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  const navItems = [
    { href: '/', label: t('navigation.dashboard'), icon: BarChart3 },
    { href: '/customers', label: t('navigation.customers'), icon: Users },
    { href: '/vehicles', label: t('navigation.vehicles'), icon: Car },
    { href: '/technicians', label: t('navigation.technicians'), icon: UserCog },
    { href: '/services', label: t('navigation.services'), icon: Wrench },
    { href: '/upcoming', label: t('upcomingServices.title'), icon: Calendar },
    { href: '/inventory', label: t('navigation.inventory'), icon: Package },
    { href: '/reports', label: t('navigation.reports'), icon: BarChart3 },
  ]

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePath === item.href

        return (
          <a
            key={item.href}
            href={item.href}
            className={`
              flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

// Mobile Navigation component
function MobileNavigation({ onNavigate }) {
  const { t } = useTranslation()
  const [activePath, setActivePath] = useState('/')

  useEffect(() => {
    setActivePath(window.location.pathname)
  }, [])

  const navItems = [
    { href: '/', label: t('navigation.dashboard'), icon: BarChart3 },
    { href: '/customers', label: t('navigation.customers'), icon: Users },
    { href: '/vehicles', label: t('navigation.vehicles'), icon: Car },
    { href: '/technicians', label: t('navigation.technicians'), icon: UserCog },
    { href: '/services', label: t('navigation.services'), icon: Wrench },
    { href: '/upcoming', label: t('upcomingServices.title'), icon: Calendar },
    { href: '/inventory', label: t('navigation.inventory'), icon: Package },
    { href: '/reports', label: t('navigation.reports'), icon: BarChart3 },
  ]

  return (
    <nav className="grid grid-cols-2 gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePath === item.href

        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`
              flex items-center space-x-2 p-3 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs">{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

// Language switcher component
function LanguageSwitcher() {
  const { language, changeLanguage, t } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 hidden sm:inline">{t('common.language')}:</span>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
      >
        <option value="tr">🇹🇷 Türkçe</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  )
}

// Settings dropdown component
function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.settings-dropdown')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="settings-dropdown relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
      >
        <Settings className="h-4 w-4" />
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('navigation.settings')}
            </div>
            <a
              href="/companies"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <Building className="h-4 w-4 text-gray-400" />
              <span>{t('companies.title')}</span>
            </a>
            <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="px-3 py-2 text-xs text-gray-500">
                {t('common.appName')} v1.0
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Footer component
function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Flow Car Service</h3>
                <p className="text-gray-400 text-sm">Professional Vehicle Service Management</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Comprehensive solution for managing your car service operations with efficiency and precision.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/services" className="text-gray-400 hover:text-white transition-colors">{t('navigation.services')}</a></li>
              <li><a href="/customers" className="text-gray-400 hover:text-white transition-colors">{t('navigation.customers')}</a></li>
              <li><a href="/reports" className="text-gray-400 hover:text-white transition-colors">{t('navigation.reports')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Flow Car Service Manager. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}