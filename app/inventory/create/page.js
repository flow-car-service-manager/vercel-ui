'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, DollarSign, Hash, ArrowLeft } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CreateComponentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    price: '',
    stockCount: 0,
    reorderLevel: 5,
    companyId: ''
  })
  const [partNumberError, setPartNumberError] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/companies`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        // Auto-select first company if available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Check for duplicate part number when partNumber changes
    if (name === 'partNumber' && value && formData.companyId) {
      checkPartNumberAvailability(value)
    }
  }

  const checkPartNumberAvailability = async (partNumber) => {
    try {
      // Check if part number exists for this company
      const response = await fetch(`${API_BASE}/components?companyId=${formData.companyId}`)
      if (response.ok) {
        const components = await response.json()
        const exists = components.some(component =>
          component.partNumber === partNumber
        )

        if (exists) {
          setPartNumberError('Bu parça numarası zaten bu şirket için kayıtlı')
        } else {
          setPartNumberError('')
        }
      }
    } catch (error) {
      console.error('Error checking part number:', error)
    }
  }

  const handleCompanyChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      companyId: value
    }))

    // Check part number again when company changes
    if (formData.partNumber && value) {
      checkPartNumberAvailability(formData.partNumber)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.companyId) {
        throw new Error('Şirket seçilmelidir')
      }

      // Check for duplicate part number before submission
      if (formData.partNumber && partNumberError) {
        throw new Error('Lütfen benzersiz bir parça numarası girin')
      }

      const response = await fetch(`${API_BASE}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockCount: parseInt(formData.stockCount),
          reorderLevel: parseInt(formData.reorderLevel)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Parça eklenirken hata oluştu')
      }

      // Redirect to inventory list on success
      router.push('/inventory')
      router.refresh()

    } catch (err) {
      setError(err.message)
      console.error('Error creating component:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
        </button>

        <div className="flex items-center">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('inventory.addComponent')}</h1>
            <p className="mt-1 text-gray-600">
              Yeni stok parçası bilgilerini ekleyin
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Company */}
              <div className="sm:col-span-2">
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket *
                </label>
                <select
                  id="companyId"
                  name="companyId"
                  required
                  value={formData.companyId}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Şirket seçin</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Parça Adı *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Parça adı"
                  />
                </div>
              </div>

              {/* Part Number */}
              <div className="sm:col-span-2">
                <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Parça Numarası
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="partNumber"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${partNumberError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Örn: ABC-123"
                  />
                </div>
                {partNumberError && (
                  <p className="mt-1 text-sm text-red-600">{partNumberError}</p>
                )}
              </div>


            </div>
          </div>

          {/* Pricing and Stock */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fiyat ve Stok Bilgileri</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (₺) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock Count */}
              <div>
                <label htmlFor="stockCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Stok
                </label>
                <input
                  type="number"
                  id="stockCount"
                  name="stockCount"
                  min="0"
                  value={formData.stockCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0"
                />
              </div>

              {/* Reorder Level */}
              <div>
                <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeniden Sipariş Seviyesi
                </label>
                <input
                  type="number"
                  id="reorderLevel"
                  name="reorderLevel"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Stok bu seviyenin altına düştüğünde uyarı verilir
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {t('inventory.addComponent')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
