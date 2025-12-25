'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Car, User, Calendar, Wrench, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function VehiclesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  // Debounce search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchVehicles(1) // Reset to page 1 when filters change
  }, [debouncedSearchTerm])

  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      })

      const response = await fetch(`${API_BASE}/vehicles?${params}`)

      if (!response.ok) {
        throw new Error('Araçlar yüklenirken hata oluştu')
      }

      const data = await response.json()
      setVehicles(data.data || [])
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVehicles(newPage)
    }
  }

  const handleViewVehicle = (vehicleId) => {
    router.push(`/vehicles/${vehicleId}`)
  }

  const handleEditVehicle = (vehicleId) => {
    router.push(`/vehicles/${vehicleId}/edit`)
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
          <button
            onClick={fetchVehicles}
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
            <h1 className="text-3xl font-bold text-gray-900">{t('vehicles.title')}</h1>
            <p className="mt-2 text-gray-600">
              Toplam {pagination.totalCount} araç • Sayfa {pagination.currentPage}/{pagination.totalPages}
            </p>
          </div>
          <button
            onClick={() => router.push('/vehicles/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <Car className="h-4 w-4 mr-2" />
            {t('vehicles.addVehicle')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Plaka, marka, model veya müşteri adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicles.plateNo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicles.brand')} / {t('vehicles.model')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicles.year')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicles.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicles.serviceHistory')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-mono font-semibold text-gray-900">
                        {vehicle.plateNo}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    {vehicle.vin && (
                      <div className="text-sm text-gray-500 font-mono">
                        {vehicle.vin}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {vehicle.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.customer?.name}
                        </div>
                        {vehicle.customer?.phone && (
                          <div className="text-sm text-gray-500">
                            {vehicle.customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Wrench className="h-4 w-4 mr-1 text-gray-400" />
                      {vehicle.serviceRecords?.length || 0} servis
                    </div>
                    {vehicle.upcomingServices && vehicle.upcomingServices.length > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        {vehicle.upcomingServices.length} yaklaşan servis
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('common.view')}
                      </button>
                      <button
                        onClick={() => handleEditVehicle(vehicle.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => router.push(`/upcoming/create?vehicleId=${vehicle.id}`)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Servis Planla
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz araç kaydı bulunmuyor'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk aracınızı kaydederek başlayın'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vehicles/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <Car className="h-4 w-4 mr-2" />
                  {t('vehicles.addVehicle')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Toplam <span className="font-medium">{pagination.totalCount}</span> kayıt
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md ${pagination.hasPrev
                    ? 'text-gray-700 bg-white hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Önceki
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${pagination.currentPage === pageNum
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md ${pagination.hasNext
                    ? 'text-gray-700 bg-white hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
              >
                Sonraki
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
          <div className="text-sm text-gray-600">Toplam Araç</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {[...new Set(vehicles.map(v => v.brand))].length}
          </div>
          <div className="text-sm text-gray-600">Farklı Marka</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {vehicles.reduce((total, vehicle) => total + (vehicle.serviceRecords?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Toplam Servis</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {vehicles.reduce((total, vehicle) => total + (vehicle.upcomingServices?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Yaklaşan Servis</div>
        </div>
      </div>
    </div>
  )
}