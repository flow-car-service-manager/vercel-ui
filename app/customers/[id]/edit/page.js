'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Building } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import { themeHelpers } from '../../../../lib/theme'
import SearchableSelect from '../../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CustomerEditPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const customerId = params.id

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
      fetchCompanies()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/customers/${customerId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Müşteri bulunamadı')
        }
        throw new Error('Müşteri bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      setCustomer(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customer:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/companies`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!customer.name.trim()) {
      setError('Müşteri adı zorunludur')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          companyId: customer.companyId
        })
      })

      if (!response.ok) {
        throw new Error('Müşteri güncellenirken hata oluştu')
      }

      // Redirect to customer detail page after successful update
      router.push(`/customers/${customerId}`)

    } catch (err) {
      setError(err.message)
      console.error('Error updating customer:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error && !customer) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Geri Dön
            </button>
            <button
              onClick={fetchCustomer}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Müşteri bulunamadı</h3>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Müşteri Düzenle</h1>
              <p className="mt-1 text-gray-600">
                {customer.name} • Müşteri #{customer.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Müşteri Adı *
              </label>
              <input
                type="text"
                id="name"
                value={customer.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={themeHelpers.form.input('customer')}
                placeholder="Müşteri adını girin"
                required
              />
            </div>

            {/* Company Selection */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-2" />
                Şirket
              </label>
              <SearchableSelect
                options={companies}
                value={customer.companyId || ''}
                onChange={(value) => handleInputChange('companyId', parseInt(value))}
                placeholder="Şirket seçin..."
                getOptionLabel={(company) => company.name}
                getOptionValue={(company) => company.id}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                value={customer.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={themeHelpers.form.input('customer')}
                placeholder="+90 (XXX) XXX XX XX"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                E-posta
              </label>
              <input
                type="email"
                id="email"
                value={customer.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={themeHelpers.form.input('customer')}
                placeholder="musteri@example.com"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Adres
              </label>
              <textarea
                id="address"
                value={customer.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={themeHelpers.form.textarea('customer')}
                placeholder="Müşteri adresini girin"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${themeHelpers.button.primary('customer')}`}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}