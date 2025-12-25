'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, TrendingUp, Edit, AlertTriangle, CheckCircle, Building } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ComponentDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [component, setComponent] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const componentId = params.id

  useEffect(() => {
    if (componentId) {
      fetchComponent()
      fetchPriceHistory()
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
    } catch (err) {
      setError(err.message)
      console.error('Error fetching component:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/components/${componentId}/price-history`)
      if (response.ok) {
        const data = await response.json()
        setPriceHistory(data)
      }
    } catch (err) {
      console.error('Error fetching price history:', err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const getStockStatus = () => {
    if (!component) return { text: '', color: '', icon: null }

    if (component.stockCount === 0) {
      return {
        text: 'Stokta Yok',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />
      }
    } else if (component.stockCount <= component.reorderLevel) {
      return {
        text: 'Düşük Stok',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
      }
    } else {
      return {
        text: 'Stokta Var',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      }
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

  if (error) {
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
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

  const stockStatus = getStockStatus()
  const totalValue = component.price * component.stockCount
  const totalUsage = component.serviceComponents?.reduce((total, sc) => total + sc.quantity, 0) || 0
  const totalRevenue = component.serviceComponents?.reduce((total, sc) => total + sc.cost, 0) || 0

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{component.name}</h1>
              <p className="mt-1 text-gray-600">
                Parça #{component.id} • {formatDate(component.createdAt)} tarihinde oluşturuldu
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.icon}
              <span className="ml-2">{stockStatus.text}</span>
            </span>
            <button
              onClick={() => router.push(`/inventory/${componentId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Component Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Component Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parça Bilgileri</h2>
            <div className="space-y-3">
              {component.partNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Parça No:</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {component.partNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Birim Fiyat:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(component.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mevcut Stok:</span>
                <span className="text-sm font-medium text-gray-900">
                  {component.stockCount} adet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yeniden Sipariş Seviyesi:</span>
                <span className="text-sm font-medium text-gray-900">
                  {component.reorderLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Oluşturulma:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(component.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {component.company && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Şirket Bilgisi
              </h2>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Şirket:</span>
                  <span className="ml-2 font-medium text-gray-900">{component.company.name}</span>
                </div>
                {component.company.phone && (
                  <div className="text-sm">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="ml-2 font-medium text-gray-900">{component.company.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Value Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Değer Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Stok Değeri:</span>
                <span className="text-sm font-semibold text-purple-600">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              {component.stockCount > 0 && (
                <div className="text-xs text-gray-500 text-center">
                  {component.stockCount} × {formatCurrency(component.price)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Usage History and Statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{totalUsage}</div>
                <div className="text-sm text-gray-600">Toplam Kullanım</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Toplam Gelir</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {component.serviceComponents?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Servis Sayısı</div>
              </div>
            </div>
          </div>

          {/* Usage History */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Kullanım Geçmişi ({component.serviceComponents?.length || 0})
                </h2>
                {component.serviceComponents && component.serviceComponents.length > 10 && (
                  <button
                    onClick={() => router.push('/services')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Gör →
                  </button>
                )}
              </div>

              {component.serviceComponents && component.serviceComponents.length > 0 ? (
                <div className="space-y-4">
                  {component.serviceComponents
                    .sort((a, b) => new Date(b.serviceRecord.serviceDate) - new Date(a.serviceRecord.serviceDate))
                    .map((sc) => (
                      <div key={sc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/services/${sc.serviceRecord.id}`)}>
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {sc.serviceRecord.description}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(sc.serviceRecord.serviceDate)}
                            </p>
                            {sc.serviceRecord.vehicle && (
                              <p className="text-xs text-gray-400 mt-1">
                                <span className="hover:text-green-600" onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/${sc.serviceRecord.vehicle.id}`); }}>
                                  {sc.serviceRecord.vehicle.brand} {sc.serviceRecord.vehicle.model} - {sc.serviceRecord.vehicle.plateNo}
                                </span>
                              </p>
                            )}
                            {sc.serviceRecord.customer && (
                              <p className="text-xs text-gray-400">
                                <span className="hover:text-blue-600" onClick={(e) => { e.stopPropagation(); router.push(`/customers/${sc.serviceRecord.customer.id}`); }}>
                                  {sc.serviceRecord.customer.name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {sc.quantity} adet
                          </div>
                          <div className="text-sm text-green-600">
                            {formatCurrency(sc.cost)}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz kullanım kaydı bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Price History */}
          {priceHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Fiyat Geçmişi ({priceHistory.length} değişiklik)
                </h2>
                <div className="space-y-3">
                  {priceHistory.map((history, index) => {
                    const priceChange = history.newPrice - history.oldPrice
                    const isIncrease = priceChange > 0
                    const changePercentage = ((Math.abs(priceChange) / history.oldPrice) * 100).toFixed(1)

                    return (
                      <div key={history.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${isIncrease ? 'bg-red-500' : 'bg-green-500'
                            }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(history.oldPrice)} → {formatCurrency(history.newPrice)}
                            </div>
                            <div className={`text-xs ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                              {isIncrease ? '+' : '-'}{formatCurrency(Math.abs(priceChange))} ({changePercentage}%)
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(history.changeDate)}
                              {history.reason && ` • ${getPriceChangeReasonText(history.reason)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stock Alerts */}
          {(component.stockCount === 0 || component.stockCount <= component.reorderLevel) && (
            <div className={`rounded-lg p-4 ${component.stockCount === 0
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
              }`}>
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-2 ${component.stockCount === 0 ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                <div>
                  <h3 className={`text-sm font-medium ${component.stockCount === 0 ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                    {component.stockCount === 0 ? 'Stokta Yok' : 'Düşük Stok Uyarısı'}
                  </h3>
                  <p className={`text-sm ${component.stockCount === 0 ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                    {component.stockCount === 0
                      ? 'Bu parça stokta bulunmuyor. Acil sipariş verilmesi gerekiyor.'
                      : `Stok seviyesi (${component.stockCount}) yeniden sipariş seviyesinin (${component.reorderLevel}) altında.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get price change reason text
function getPriceChangeReasonText(reason) {
  const reasonMap = {
    'inflation': 'Enflasyon',
    'discount': 'İndirim',
    'supplier_change': 'Tedarikçi Değişimi',
    'price_adjustment': 'Fiyat Ayarlaması',
    'initial_price': 'İlk Fiyat',
    'market_price': 'Piyasa Fiyatı',
    'exchange_rate': 'Kur Değişimi'
  }
  return reasonMap[reason] || reason
}
