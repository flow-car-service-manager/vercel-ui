'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, DollarSign, AlertTriangle, Search, Filter, TrendingUp, BarChart3 } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import SearchableSelect from '../../components/SearchableSelect'
import InventoryReport from '../../components/InventoryReport'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function InventoryPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [selectedComponentId, setSelectedComponentId] = useState(null)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/components`)

      if (!response.ok) {
        throw new Error('Stok parçaları yüklenirken hata oluştu')
      }

      const data = await response.json()
      setComponents(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching components:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredComponents = components.filter(component => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && component.stockCount <= component.reorderLevel) ||
      (stockFilter === 'out' && component.stockCount === 0) ||
      (stockFilter === 'in' && component.stockCount > component.reorderLevel)

    return matchesSearch && matchesStock
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const getStockStatus = (component) => {
    if (component.stockCount === 0) {
      return { text: t('inventory.outOfStock'), color: 'bg-red-100 text-red-800' }
    } else if (component.stockCount <= component.reorderLevel) {
      return { text: t('inventory.lowStock'), color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: t('inventory.inStock'), color: 'bg-green-100 text-green-800' }
    }
  }

  const lowStockComponents = components.filter(c => c.stockCount <= c.reorderLevel && c.stockCount > 0)
  const outOfStockComponents = components.filter(c => c.stockCount === 0)
  const totalInventoryValue = components.reduce((total, component) => total + (component.price * component.stockCount), 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchComponents}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
            <p className="mt-2 text-gray-600">
              Toplam {components.length} stok parçası
            </p>
          </div>
          <button
            onClick={() => router.push('/inventory/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Package className="h-4 w-4 mr-2" />
            {t('inventory.addComponent')}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Parça adı veya parça numarası ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <SearchableSelect
              options={[
                { value: 'all', label: 'Tüm Stoklar' },
                { value: 'in', label: 'Stokta Var' },
                { value: 'low', label: 'Düşük Stok' },
                { value: 'out', label: 'Stokta Yok' }
              ]}
              value={stockFilter}
              onChange={setStockFilter}
              placeholder="Stok durumu seçin..."
              searchable={false}
              className="pl-10"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockComponents.length > 0 || outOfStockComponents.length > 0) && (
        <div className="mb-6 space-y-3">
          {outOfStockComponents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800 font-medium">
                  {outOfStockComponents.length} parça stokta yok
                </span>
              </div>
            </div>
          )}
          {lowStockComponents.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-800 font-medium">
                  {lowStockComponents.length} parça düşük stokta
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => {
          const stockStatus = getStockStatus(component)
          const totalValue = component.price * component.stockCount

          return (
            <div key={component.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Component Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>

                {/* Part Number */}
                {component.partNumber && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">Parça No:</div>
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {component.partNumber}
                    </div>
                  </div>
                )}

                {/* Stock Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Mevcut Stok</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {component.stockCount} adet
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Birim Fiyat</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(component.price)}
                    </div>
                  </div>
                </div>

                {/* Reorder Level */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Yeniden Sipariş Seviyesi:</span>
                    <span className="font-medium text-gray-900">{component.reorderLevel}</span>
                  </div>
                </div>

                {/* Total Value */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Değer:</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>

                {/* Usage Stats */}
                {component.serviceComponents && component.serviceComponents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {component.serviceComponents.length} serviste kullanıldı
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex space-x-2">
                  <button
                    onClick={() => router.push(`/inventory/${component.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {t('common.view')}
                  </button>
                  <button
                    onClick={() => router.push(`/inventory/${component.id}/edit`)}
                    className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedComponentId(component.id)
                      setShowReport(true)
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    title="Kullanım Raporu"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || stockFilter !== 'all' ? 'Arama sonucu bulunamadı' : 'Henüz stok parçası bulunmuyor'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || stockFilter !== 'all' ? 'Farklı bir arama terimi veya filtre deneyin' : 'İlk stok parçanızı ekleyerek başlayın'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{components.length}</div>
          <div className="text-sm text-gray-600">Toplam Parça</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {components.filter(c => c.stockCount > c.reorderLevel).length}
          </div>
          <div className="text-sm text-gray-600">Yeterli Stok</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{lowStockComponents.length}</div>
          <div className="text-sm text-gray-600">Düşük Stok</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(totalInventoryValue)}
          </div>
          <div className="text-sm text-gray-600">Toplam Stok Değeri</div>
        </div>
      </div>

      {/* Inventory Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InventoryReport
              componentId={selectedComponentId}
              onClose={() => {
                setShowReport(false)
                setSelectedComponentId(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}