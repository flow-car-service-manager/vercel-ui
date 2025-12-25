'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Car, User, CheckCircle, XCircle, Clock, AlertCircle, Plus, Search, Filter, RotateCcw, Grid, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import SearchableSelect from '../../components/SearchableSelect'
import RescheduleModal from '../../components/RescheduleModal'
import EditUpcomingServiceModal from '../../components/EditUpcomingServiceModal'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper functions for date filtering
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const isThisWeek = (date) => {
  const today = new Date()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() + 6))
  return date >= startOfWeek && date <= endOfWeek
}

const isThisMonth = (date) => {
  const today = new Date()
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

function UpcomingServicesPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [upcomingServices, setUpcomingServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [highlightedService, setHighlightedService] = useState(null)
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    service: null
  })
  const [editModal, setEditModal] = useState({
    isOpen: false,
    service: null
  })
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
    fetchUpcomingServices(1)

    // Check for highlight parameter in URL
    const highlightId = searchParams.get('highlight')
    if (highlightId) {
      setHighlightedService(parseInt(highlightId))
    }
  }, [searchParams, debouncedSearchTerm, statusFilter, dateFilter])

  const fetchUpcomingServices = async (page = 1) => {
    try {
      setLoading(true)

      // Calculate date range based on dateFilter
      let startDate = ''
      let endDate = ''

      if (dateFilter !== 'all') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (dateFilter) {
          case 'today':
            startDate = today.toISOString().split('T')[0]
            endDate = today.toISOString().split('T')[0]
            break
          case 'thisWeek':
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)

            startDate = startOfWeek.toISOString().split('T')[0]
            endDate = endOfWeek.toISOString().split('T')[0]
            break
          case 'thisMonth':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

            startDate = startOfMonth.toISOString().split('T')[0]
            endDate = endOfMonth.toISOString().split('T')[0]
            break
          default:
            break
        }
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(startDate && { startDate: startDate }),
        ...(endDate && { endDate: endDate })
      })

      const response = await fetch(`${API_BASE}/upcoming-services?${params}`)

      if (!response.ok) {
        throw new Error('Yaklaşan servisler yüklenirken hata oluştu')
      }

      const data = await response.json()
      setUpcomingServices(data.data || [])
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching upcoming services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUpcomingServices(newPage)
    }
  }

  const clearHighlight = () => {
    setHighlightedService(null)
    // Remove highlight parameter from URL without refreshing
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('highlight')
    window.history.replaceState({}, '', newUrl.toString())
  }

  const filteredServices = upcomingServices.filter(service => {
    // If a service is highlighted, show only that service
    if (highlightedService) {
      return service.id === highlightedService
    }

    const matchesSearch =
      service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle?.plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || service.status === statusFilter

    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && isToday(new Date(service.plannedDate))) ||
      (dateFilter === 'week' && isThisWeek(new Date(service.plannedDate))) ||
      (dateFilter === 'month' && isThisMonth(new Date(service.plannedDate)))

    return matchesSearch && matchesStatus && matchesDate
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'customer_arrived':
        return <User className="h-4 w-4" />
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'customer_arrived':
        return 'bg-purple-100 text-purple-800'
      case 'no_show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı'
      case 'confirmed':
        return 'Onaylandı'
      case 'cancelled':
        return 'İptal Edildi'
      case 'customer_arrived':
        return 'Müşteri Geldi'
      case 'no_show':
        return 'Gelmedi'
      default:
        return status
    }
  }

  const updateServiceStatus = async (serviceId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/upcoming-services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Durum güncellenirken hata oluştu')
      }

      const result = await response.json()

      // If status changed to 'customer_arrived', redirect to the created service record
      if (newStatus === 'customer_arrived' && result.serviceRecord) {
        router.push(`/services/${result.serviceRecord.id}`)
        return
      }

      // Refresh the list for other status changes
      fetchUpcomingServices()
    } catch (err) {
      setError(err.message)
      console.error('Error updating service status:', err)
    }
  }

  const handleReschedule = async (serviceId, rescheduleData) => {
    try {
      const response = await fetch(`${API_BASE}/upcoming-services/${serviceId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rescheduleData)
      })

      if (!response.ok) {
        throw new Error('Yeniden planlama sırasında hata oluştu')
      }

      // Refresh the list
      fetchUpcomingServices()
    } catch (err) {
      setError(err.message)
      console.error('Error rescheduling service:', err)
    }
  }

  const handleUpdateService = async (serviceId, updateData) => {
    try {
      const response = await fetch(`${API_BASE}/upcoming-services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Servis güncellenirken hata oluştu')
      }

      // Refresh the list
      fetchUpcomingServices()
    } catch (err) {
      setError(err.message)
      console.error('Error updating service:', err)
    }
  }

  const openRescheduleModal = (service) => {
    setRescheduleModal({
      isOpen: true,
      service: service
    })
  }

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      service: null
    })
  }

  const openEditModal = (service) => {
    setEditModal({
      isOpen: true,
      service: service
    })
  }

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      service: null
    })
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
            onClick={fetchUpcomingServices}
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
            <h1 className="text-3xl font-bold text-gray-900">Yaklaşan Servisler</h1>
            <p className="mt-2 text-gray-600">
              Toplam {pagination.totalCount} planlanmış servis • Sayfa {pagination.currentPage}/{pagination.totalPages}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/upcoming/planner')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Grid className="h-4 w-4 mr-2" />
              Haftalık Planlayıcı
            </button>
            <button
              onClick={() => router.push('/upcoming/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Servis Planla
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Servis tipi, plaka, marka veya model ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <SearchableSelect
              options={[
                { value: 'all', label: 'Tüm Durumlar' },
                { value: 'scheduled', label: 'Planlandı' },
                { value: 'confirmed', label: 'Onaylandı' },
                { value: 'cancelled', label: 'İptal Edildi' },
                { value: 'customer_arrived', label: 'Müşteri Geldi' },
                { value: 'no_show', label: 'Gelmedi' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Durum seçin..."
              searchable={false}
              className="pl-10"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Tüm Tarihler</option>
            <option value="today">Bugün</option>
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.serviceType}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.notes}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1">{getStatusText(service.status)}</span>
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center mb-3">
                <Car className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {service.vehicle?.brand} {service.vehicle?.model}
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    {service.vehicle?.plateNo}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center mb-4">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div className="text-sm text-gray-600">
                  {formatDate(service.plannedDate)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {/* Edit button for all statuses except customer_arrived */}
                {(service.status !== 'customer_arrived') && (
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Tarih/Saat Düzenle
                  </button>
                )}

                {service.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => updateServiceStatus(service.id, 'confirmed')}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => updateServiceStatus(service.id, 'customer_arrived')}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Müşteri Geldi
                    </button>
                    <button
                      onClick={() => updateServiceStatus(service.id, 'cancelled')}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal Et
                    </button>
                  </>
                )}
                {service.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => updateServiceStatus(service.id, 'customer_arrived')}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Müşteri Geldi
                    </button>
                    <button
                      onClick={() => updateServiceStatus(service.id, 'cancelled')}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal Et
                    </button>
                  </>
                )}
                {(service.status === 'scheduled' || service.status === 'confirmed') && (
                  <button
                    onClick={() => updateServiceStatus(service.id, 'no_show')}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Gelmedi
                  </button>
                )}
                {(service.status === 'cancelled' || service.status === 'no_show') && (
                  <button
                    onClick={() => openRescheduleModal(service)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Tekrar Planla
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {upcomingServices.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'Arama sonucu bulunamadı' : 'Henüz planlanmış servis bulunmuyor'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'Farklı bir arama terimi veya filtre deneyin' : 'İlk servis planınızı oluşturarak başlayın'}
          </p>
          {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/upcoming/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Servis Planla
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
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

      {/* Summary Stats with Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {upcomingServices.filter(s => s.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Planlandı</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {upcomingServices.filter(s => s.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Onaylandı</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {upcomingServices.filter(s => s.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">İptal Edildi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {upcomingServices.filter(s => s.status === 'no_show').length}
          </div>
          <div className="text-sm text-gray-600">Gelmedi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {upcomingServices.filter(s => s.status === 'customer_arrived').length}
          </div>
          <div className="text-sm text-gray-600">Müşteri Geldi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-center items-center">
          <button
            onClick={() => router.push('/upcoming/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Servis Planla
          </button>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Hızlı servis planlama
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onReschedule={(rescheduleData) => handleReschedule(rescheduleModal.service.id, rescheduleData)}
        service={rescheduleModal.service}
      />

      {/* Edit Modal */}
      <EditUpcomingServiceModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onUpdate={(updateData) => handleUpdateService(editModal.service.id, updateData)}
        service={editModal.service}
      />
    </div>
  )
}

export default function UpcomingServicesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    }>
      <UpcomingServicesPageContent />
    </Suspense>
  )
}
