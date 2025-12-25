'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, Car, Wrench, Calendar, Edit } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CustomerDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const customerId = params.id

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
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

  const totalServicesCost = customer.serviceRecords?.reduce((total, service) => total + service.totalCost, 0) || 0

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
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="mt-1 text-gray-600">
                Müşteri #{customer.id} • {formatDate(customer.createdAt)} tarihinde oluşturuldu
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/customers/${customerId}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}

              {customer.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </div>



          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Araç:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {customer.vehicles?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Servis:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {customer.serviceRecords?.length || 0}
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

        {/* Right Column - Vehicles and Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicles */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-600" />
                  Araçlar ({customer.vehicles?.length || 0})
                </h2>
                {customer.vehicles && customer.vehicles.length > 5 && (
                  <button
                    onClick={() => router.push('/vehicles')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Gör →
                  </button>
                )}
              </div>

              {customer.vehicles && customer.vehicles.length > 0 ? (
                <div className="space-y-4">
                  {customer.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
                      <div className="flex items-center">
                        <Car className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </h3>
                          <p className="text-sm text-gray-500 font-mono">{vehicle.plateNo}</p>
                          {vehicle.vin && (
                            <p className="text-xs text-gray-400 font-mono mt-1">{vehicle.vin}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {vehicle.serviceRecords?.length || 0} servis
                        </div>
                        {vehicle.upcomingServices && vehicle.upcomingServices.length > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            {vehicle.upcomingServices.length} yaklaşan servis
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz araç kaydı bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Recent Services */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                  Son Servisler
                </h2>
                {customer.serviceRecords && customer.serviceRecords.length > 5 && (
                  <button
                    onClick={() => router.push('/services')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Gör →
                  </button>
                )}
              </div>

              {customer.serviceRecords && customer.serviceRecords.length > 0 ? (
                <div className="space-y-3">
                  {customer.serviceRecords
                    .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/services/${service.id}`)}>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {service.description}
                            </h3>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(service.totalCost)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(service.serviceDate)}
                            {service.vehicle && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="hover:text-blue-600" onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/${service.vehicle.id}`); }}>
                                  {service.vehicle.brand} {service.vehicle.model} - {service.vehicle.plateNo}
                                </span>
                              </>
                            )}
                            {service.technician && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="hover:text-orange-600" onClick={(e) => { e.stopPropagation(); router.push(`/technicians/${service.technician.id}`); }}>
                                  {service.technician.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz servis kaydı bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}