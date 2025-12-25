'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Wrench, User, Calendar, Phone, Edit, Car, DollarSign } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function TechnicianDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [technician, setTechnician] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const technicianId = params.id

  useEffect(() => {
    if (technicianId) {
      fetchTechnician()
    }
  }, [technicianId])

  const fetchTechnician = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/technicians/${technicianId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Teknisyen bulunamadı')
        }
        throw new Error('Teknisyen bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      setTechnician(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching technician:', err)
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
              onClick={fetchTechnician}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Teknisyen bulunamadı</h3>
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

  const totalServicesRevenue = technician.serviceRecords?.reduce((total, service) => total + service.totalCost, 0) || 0
  const totalEarnings = technician.serviceRecords?.reduce((total, service) => total + (service.technicianEarnings || 0), 0) || 0
  const uniqueCustomers = [...new Set(technician.serviceRecords?.map(service => service.customer?.id).filter(Boolean))].length
  const uniqueVehicles = [...new Set(technician.serviceRecords?.map(service => service.vehicle?.id).filter(Boolean))].length

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
              <h1 className="text-3xl font-bold text-gray-900">{technician.name}</h1>
              <p className="mt-1 text-gray-600">
                Teknisyen #{technician.id} • {technician.active ? 'Aktif' : 'Pasif'}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/technicians/${technicianId}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Technician Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h2>
            <div className="space-y-3">
              {technician.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{technician.phone}</span>
                </div>
              )}

              {technician.specialization && (
                <div className="flex items-center text-sm text-gray-600">
                  <Wrench className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium text-gray-900">{technician.specialization}</span>
                </div>
              )}

              {technician.hireDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>İşe başlama: {formatDate(technician.hireDate)}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                <span>Oluşturulma: {formatDate(technician.createdAt)}</span>
              </div>
            </div>
          </div>



          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Servis:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {technician.serviceRecords?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Farklı Müşteri:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {uniqueCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Farklı Araç:</span>
                <span className="text-sm font-semibold text-green-600">
                  {uniqueVehicles}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Gelir:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(totalServicesRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kazanç Yüzdesi:</span>
                <span className="text-sm font-semibold text-purple-600">
                  %{technician.earningsPercentage || 30}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Kazanç:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(totalEarnings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Service History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Services */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                  Son Servisler ({technician.serviceRecords?.length || 0})
                </h2>
                {technician.serviceRecords && technician.serviceRecords.length > 10 && (
                  <button
                    onClick={() => router.push('/services')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Gör →
                  </button>
                )}
              </div>

              {technician.serviceRecords && technician.serviceRecords.length > 0 ? (
                <div className="space-y-4">
                  {technician.serviceRecords
                    .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
                    .slice(0, 10)
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
                          {service.vehicle && (
                            <>
                              <span className="mx-2">•</span>
                              <Car className="h-3 w-3 mr-1" />
                              <span className="hover:text-green-600" onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/${service.vehicle.id}`); }}>
                                {service.vehicle.brand} {service.vehicle.model} - {service.vehicle.plateNo}
                              </span>
                            </>
                          )}
                          {service.customer && (
                            <>
                              <span className="mx-2">•</span>
                              <User className="h-3 w-3 mr-1" />
                              <span className="hover:text-blue-600" onClick={(e) => { e.stopPropagation(); router.push(`/customers/${service.customer.id}`); }}>
                                {service.customer.name}
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
        </div>
      </div>
    </div>
  )
}