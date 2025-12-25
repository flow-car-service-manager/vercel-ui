'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Wrench, Car, User, Calendar, DollarSign, Edit, Package, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import CompletedServicesReport from '../../../components/CompletedServicesReport'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ServiceDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const serviceId = params.id

  useEffect(() => {
    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  const fetchService = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/service-records/${serviceId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Servis kaydı bulunamadı')
        }
        throw new Error('Servis bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      setService(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching service:', err)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'in_progress':
        return 'Devam Ediyor'
      case 'pending':
        return 'Bekliyor'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
              onClick={fetchService}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Servis kaydı bulunamadı</h3>
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

  const laborCost = service.totalCost - (service.serviceComponents?.reduce((total, sc) => total + sc.cost, 0) || 0)

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
              <h1 className="text-3xl font-bold text-gray-900">{service.description}</h1>
              <p className="mt-1 text-gray-600">
                Servis #{service.id} • {formatDate(service.serviceDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
              {getStatusIcon(service.status)}
              <span className="ml-2">{getStatusText(service.status)}</span>
            </span>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Rapor
            </button>
            <button
              onClick={() => router.push(`/services/${serviceId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Service Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Service Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Servis Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Servis Tarihi:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(service.serviceDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Durum:</span>
                <span className={`text-sm font-medium ${getStatusColor(service.status)} px-2 py-1 rounded`}>
                  {getStatusText(service.status)}
                </span>
              </div>
              {service.currentKm && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mevcut KM:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.currentKm.toLocaleString('tr-TR')} km
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Oluşturulma:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(service.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {service.vehicle && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                Araç Bilgisi
              </h2>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Araç:</span>
                  <span
                    className="ml-2 font-medium text-gray-900 hover:text-green-600 cursor-pointer"
                    onClick={() => router.push(`/vehicles/${service.vehicle.id}`)}
                  >
                    {service.vehicle.brand} {service.vehicle.model} ({service.vehicle.year})
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Plaka:</span>
                  <span className="ml-2 font-medium text-gray-900 font-mono">
                    {service.vehicle.plateNo}
                  </span>
                </div>
                {service.vehicle.vin && (
                  <div className="text-sm">
                    <span className="text-gray-600">Şasi No:</span>
                    <span className="ml-2 font-medium text-gray-900 font-mono">
                      {service.vehicle.vin}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {service.customer && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Müşteri Bilgisi
              </h2>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Müşteri:</span>
                  <span
                    className="ml-2 font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                    onClick={() => router.push(`/customers/${service.customer.id}`)}
                  >
                    {service.customer.name}
                  </span>
                </div>
                {service.customer.phone && (
                  <div className="text-sm">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {service.customer.phone}
                    </span>
                  </div>
                )}
                {service.customer.email && (
                  <div className="text-sm">
                    <span className="text-gray-600">E-posta:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {service.customer.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technician Information */}
          {service.technician && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                Teknisyen Bilgisi
              </h2>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Teknisyen:</span>
                  <span
                    className="ml-2 font-medium text-gray-900 hover:text-orange-600 cursor-pointer"
                    onClick={() => router.push(`/technicians/${service.technician.id}`)}
                  >
                    {service.technician.name}
                  </span>
                </div>
                {service.technician.specialization && (
                  <div className="text-sm">
                    <span className="text-gray-600">Uzmanlık:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {service.technician.specialization}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Service Components and Cost Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Description */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Servis Açıklaması</h2>
            <p className="text-gray-700">{service.description}</p>
          </div>

          {/* Service Components */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Kullanılan Parçalar ({service.serviceComponents?.length || 0})
              </h2>

              {service.serviceComponents && service.serviceComponents.length > 0 ? (
                <div className="space-y-3">
                  {service.serviceComponents.map((sc) => (
                    <div key={sc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/inventory/${sc.component.id}`)}>
                      <div className="flex items-center">
                        <Package className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 hover:text-purple-600">
                            {sc.component.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {sc.quantity} adet × {formatCurrency(sc.component.price)} = {formatCurrency(sc.cost)}
                          </p>
                          {sc.component.partNumber && (
                            <p className="text-xs text-gray-400 font-mono mt-1">
                              Parça No: {sc.component.partNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sc.cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Bu serviste parça kullanılmamış</p>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Maliyet Dağılımı</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Parça Maliyeti:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(service.serviceComponents?.reduce((total, sc) => total + sc.cost, 0) || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">İşçilik Maliyeti:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(laborCost)}
                </span>
              </div>
              {service.technicianEarnings && (
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-sm text-gray-600">
                    Teknisyen Kazancı ({service.technician?.earningsPercentage || 30}%):
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatCurrency(service.technicianEarnings)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Toplam:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(service.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CompletedServicesReport
              serviceId={serviceId}
              onClose={() => setShowReportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
