'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Phone, Mail, MapPin, Car, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CustomersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
    fetchCustomers(1) // Reset to page 1 when filters change
  }, [debouncedSearchTerm])

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // 3x3 grid
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      })

      const response = await fetch(`${API_BASE}/customers?${params}`)

      if (!response.ok) {
        throw new Error('Müşteriler yüklenirken hata oluştu')
      }

      const data = await response.json()
      setCustomers(data.data || [])
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCustomers(newPage)
    }
  }

  const handleViewCustomer = (customerId) => {
    router.push(`/customers/${customerId}`)
  }

  const handleEditCustomer = (customerId) => {
    router.push(`/customers/${customerId}/edit`)
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
            onClick={fetchCustomers}
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
            <h1 className="text-3xl font-bold text-gray-900">{t('customers.title')}</h1>
            <p className="mt-2 text-gray-600">
              Toplam {pagination.totalCount} müşteri • Sayfa {pagination.currentPage}/{pagination.totalPages}
            </p>
          </div>
          <button
            onClick={() => router.push('/customers/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('customers.addCustomer')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Müşteri ara (isim, telefon, email, adres)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {pagination.totalCount} müşteri bulundu
          </p>
        )}
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Customer Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {customer.vehicles?.length || 0} {t('customers.vehicles')}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.phone}
                  </div>
                )}

                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                )}
              </div>

              {/* Vehicles */}
              {customer.vehicles && customer.vehicles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    {t('customers.vehicles')}
                  </h4>
                  <div className="space-y-2">
                    {customer.vehicles.slice(0, 2).map((vehicle) => (
                      <div key={vehicle.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {vehicle.brand} {vehicle.model}
                        </span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {vehicle.plateNo}
                        </span>
                      </div>
                    ))}
                    {customer.vehicles.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{customer.vehicles.length - 2} {t('common.more')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleViewCustomer(customer.id)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('common.view')}
                </button>
                <button
                  onClick={() => handleEditCustomer(customer.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('common.edit')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                        ? 'bg-blue-600 text-white'
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

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('messages.noData')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Henüz müşteri kaydı bulunmuyor.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/customers/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              {t('customers.addCustomer')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}