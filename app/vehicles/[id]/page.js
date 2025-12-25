'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Car, User, Calendar, Wrench, Edit, MapPin, Phone } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function VehicleDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const vehicleId = params.id

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId])

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Araç bulunamadı')
        }
        throw new Error('Araç bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      setVehicle(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching vehicle:', err)
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
              onClick={fetchVehicle}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Araç bulunamadı</h3>
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

  const totalServicesCost = vehicle.serviceRecords?.reduce((total, service) => total + service.totalCost, 0) || 0

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
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h1>
              <p className="mt-1 text-gray-600">
                Plaka: {vehicle.plateNo} • Araç #{vehicle.id}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/services/create?vehicleId=${vehicleId}&customerId=${vehicle.customerId}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Hemen Servis Ekle
            </button>
            <button
              onClick={() => router.push(`/upcoming/create?vehicleId=${vehicleId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Servis Planla
            </button>
            <button
              onClick={() => router.push(`/vehicles/${vehicleId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Araç Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Marka:</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Model:</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yıl:</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plaka:</span>
                <span className="text-sm font-medium text-gray-900 font-mono">{vehicle.plateNo}</span>
              </div>
              {vehicle.vin && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Şasi No:</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{vehicle.vin}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Oluşturulma:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(vehicle.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {vehicle.customer && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Müşteri Bilgisi
              </h2>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Adı:</span>
                  <span
                    className="ml-2 font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                    onClick={() => router.push(`/customers/${vehicle.customer.id}`)}
                  >
                    {vehicle.customer.name}
                  </span>
                </div>
                {vehicle.customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {vehicle.customer.phone}
                  </div>
                )}
                {vehicle.customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{vehicle.customer.email}</span>
                  </div>
                )}
                {vehicle.customer.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-2">{vehicle.customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Servis:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {vehicle.serviceRecords?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yaklaşan Servis:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {vehicle.upcomingServices?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Harcama:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(totalServicesCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service History */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                Servis Geçmişi ({vehicle.serviceRecords?.length || 0})
              </h2>

              {vehicle.serviceRecords && vehicle.serviceRecords.length > 0 ? (
                <div className="space-y-4">
                  {vehicle.serviceRecords
                    .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
                    .map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/services/${service.id}`)}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {service.description}
                          </h3>
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(service.totalCost)}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(service.serviceDate)}
                          {service.technician && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="hover:text-orange-600" onClick={(e) => { e.stopPropagation(); router.push(`/technicians/${service.technician.id}`); }}>
                                Teknisyen: {service.technician.name}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Service Components */}
                        {service.serviceComponents && service.serviceComponents.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">Kullanılan Parçalar:</h4>
                            <div className="space-y-1">
                              {service.serviceComponents.map((sc) => (
                                <div key={sc.id} className="flex justify-between text-xs">
                                  <span
                                    className="text-gray-600 hover:text-purple-600 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); router.push(`/inventory/${sc.component.id}`); }}
                                  >
                                    {sc.component.name} x {sc.quantity}
                                  </span>
                                  <span className="text-gray-900">
                                    {formatCurrency(sc.cost)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz servis kaydı bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Upcoming Services */}
          {vehicle.upcomingServices && vehicle.upcomingServices.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                  Yaklaşan Servisler ({vehicle.upcomingServices.length})
                </h2>

                <div className="space-y-3">
                  {vehicle.upcomingServices
                    .filter(service => service.status === 'pending')
                    .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {service.serviceType}
                          </h3>
                          {service.notes && (
                            <p className="text-xs text-gray-600 mt-1">{service.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(service.plannedDate)}
                          </div>
                          <div className="text-xs text-yellow-600">
                            {service.reminderSent ? 'Hatırlatma gönderildi' : 'Hatırlatma bekleniyor'}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}