'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, DollarSign, Building } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import { themeHelpers } from '../../../../lib/theme'
import SearchableSelect from '../../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ComponentEditPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [component, setComponent] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [priceChangeReason, setPriceChangeReason] = useState('')

  const componentId = params.id

  useEffect(() => {
    if (componentId) {
      fetchComponent()
      fetchCompanies()
    }
  }, [componentId])

  const fetchComponent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/components/${componentId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Stok parçası bulunamadı')
        }
        throw new Error('Stok parçası bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      setComponent(data)
      setOriginalPrice(data.price)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching component:', err)
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
    setComponent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!component.name?.trim()) {
      setError('Parça adı zorunludur')
      return
    }

    if (!component.price || component.price < 0) {
      setError('Geçerli bir fiyat giriniz')
      return
    }

    if (component.stockCount === undefined || component.stockCount < 0) {
      setError('Geçerli bir stok miktarı giriniz')
      return
    }

    if (component.reorderLevel === undefined || component.reorderLevel < 0) {
      setError('Geçerli bir yeniden sipariş seviyesi giriniz')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updateData = {
        name: component.name,
        partNumber: component.partNumber,
        price: parseFloat(component.price),
        stockCount: parseInt(component.stockCount),
        reorderLevel: parseInt(component.reorderLevel),
        companyId: component.companyId
      }

      // Add price change reason if price has changed
      if (component.price !== originalPrice && priceChangeReason) {
        updateData.priceChangeReason = priceChangeReason
      }

      const response = await fetch(`${API_BASE}/components/${componentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Stok parçası güncellenirken hata oluştu')
      }

      // Redirect to component detail page after successful update
      router.push(`/inventory/${componentId}`)

    } catch (err) {
      setError(err.message)
      console.error('Error updating component:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error && !component) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              onClick={fetchComponent}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!component) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Stok parçası bulunamadı</h3>
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

  if (!component) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Stok Parçası Düzenle</h1>
              <p className="mt-1 text-gray-600">
                {component.name} • Parça #{component.id}
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
            {/* Component Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-2" />
                Parça Adı *
              </label>
              <input
                type="text"
                id="name"
                value={component.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={themeHelpers.form.input('component')}
                placeholder="Parça adını girin"
                required
              />
            </div>

            {/* Part Number */}
            <div>
              <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Parça Numarası
              </label>
              <input
                type="text"
                id="partNumber"
                value={component.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                className={`${themeHelpers.form.input('component')} font-mono`}
                placeholder="Parça numarasını girin"
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
                value={component.companyId || ''}
                onChange={(value) => handleInputChange('companyId', parseInt(value))}
                placeholder="Şirket seçin..."
                getOptionLabel={(company) => company.name}
                getOptionValue={(company) => company.id}
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Birim Fiyat *
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={component.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className={themeHelpers.form.input('component')}
                  placeholder="0.00"
                  required
                />
                {component.price !== originalPrice && (
                  <p className="mt-1 text-sm text-blue-600">
                    Fiyat değişti: {originalPrice} → {component.price}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="stockCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Stok *
                </label>
                <input
                  type="number"
                  id="stockCount"
                  min="0"
                  value={component.stockCount || ''}
                  onChange={(e) => handleInputChange('stockCount', parseInt(e.target.value))}
                  className={themeHelpers.form.input('component')}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Price Change Reason (only show if price changed) */}
            {component.price !== originalPrice && (
              <div>
                <label htmlFor="priceChangeReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat Değişikliği Nedeni
                </label>
                <SearchableSelect
                  options={[
                    { value: 'inflation', label: 'Enflasyon' },
                    { value: 'market_price', label: 'Piyasa Fiyatı' },
                    { value: 'supplier_change', label: 'Tedarikçi Değişimi' },
                    { value: 'discount', label: 'İndirim' },
                    { value: 'exchange_rate', label: 'Kur Değişimi' },
                    { value: 'price_adjustment', label: 'Fiyat Ayarlaması' },
                    { value: 'other', label: 'Diğer' }
                  ]}
                  value={priceChangeReason}
                  onChange={setPriceChangeReason}
                  placeholder="Neden seçin..."
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Fiyat değişikliğinin nedenini belirtin. Bu bilgi stok raporlarında kullanılacaktır.
                </p>
              </div>
            )}

            {/* Reorder Level */}
            <div>
              <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Yeniden Sipariş Seviyesi *
              </label>
              <input
                type="number"
                id="reorderLevel"
                min="0"
                value={component.reorderLevel || ''}
                onChange={(e) => handleInputChange('reorderLevel', parseInt(e.target.value))}
                className={themeHelpers.form.input('component')}
                placeholder="Minimum stok seviyesi"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Stok bu seviyenin altına düştüğünde yeniden sipariş verilmesi önerilir.
              </p>
            </div>

            {/* Stock Status Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Stok Durumu Önizleme</h3>
              <div className="text-sm text-gray-600">
                {component.stockCount === 0 ? (
                  <span className="text-red-600 font-medium">⚠️ Stokta Yok</span>
                ) : component.stockCount <= component.reorderLevel ? (
                  <span className="text-yellow-600 font-medium">⚠️ Düşük Stok ({component.stockCount} adet)</span>
                ) : (
                  <span className="text-green-600 font-medium">✓ Yeterli Stok ({component.stockCount} adet)</span>
                )}
              </div>
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
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${themeHelpers.button.primary('component')}`}
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
