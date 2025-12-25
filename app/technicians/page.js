'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Phone, Calendar, User, Star, Search, Settings } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function TechniciansPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTechnicians()
  }, [])

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/technicians`)

      if (!response.ok) {
        throw new Error('Teknisyenler yüklenirken hata oluştu')
      }

      const data = await response.json()
      setTechnicians(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching technicians:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTechnicians = technicians.filter(technician =>
    technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.technicianSpecializations?.some(ts =>
      ts.specialization.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const activeTechnicians = technicians.filter(t => t.active).length

  const handleViewTechnician = (technicianId) => {
    router.push(`/technicians/${technicianId}`)
  }

  const handleEditTechnician = (technicianId) => {
    router.push(`/technicians/${technicianId}/edit`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
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
            onClick={fetchTechnicians}
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
            <h1 className="text-3xl font-bold text-gray-900">{t('technicians.title')}</h1>
            <p className="mt-2 text-gray-600">
              {activeTechnicians} aktif teknisyen
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/technicians/specializations')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              Uzmanlık Alanları
            </button>
            <button
              onClick={() => router.push('/technicians/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Wrench className="h-4 w-4 mr-2" />
              {t('technicians.addTechnician')}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Teknisyen adı veya uzmanlık alanı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <div key={technician.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Technician Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{technician.name}</h3>
                    <div className="flex items-center mt-1">
                      {technician.active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('technicians.active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('technicians.inactive')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {technician.technicianSpecializations && technician.technicianSpecializations.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Star className="h-4 w-4 mr-2 text-orange-400" />
                    Uzmanlık Alanları
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {technician.technicianSpecializations.map(ts => (
                      <span
                        key={ts.specialization.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {ts.specialization.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                {technician.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {technician.phone}
                  </div>
                )}

                {technician.hireDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    İşe başlama: {formatDate(technician.hireDate)}
                  </div>
                )}
              </div>

              {/* Service Statistics */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tamamlanan servisler:</span>
                  <span className="font-semibold text-gray-900">
                    {technician.serviceRecords?.length || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleViewTechnician(technician.id)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('common.view')}
                </button>
                <button
                  onClick={() => handleEditTechnician(technician.id)}
                  className="flex-1 bg-orange-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  {t('common.edit')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz teknisyen kaydı bulunmuyor'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk teknisyeninizi ekleyerek başlayın'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{technicians.length}</div>
          <div className="text-sm text-gray-600">Toplam Teknisyen</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{activeTechnicians}</div>
          <div className="text-sm text-gray-600">Aktif Teknisyen</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {[...new Set(technicians.flatMap(t =>
              t.technicianSpecializations?.map(ts => ts.specialization.name) || []
            ))].length}
          </div>
          <div className="text-sm text-gray-600">Farklı Uzmanlık</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {technicians.reduce((total, tech) => total + (tech.serviceRecords?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Toplam Servis</div>
        </div>
      </div>
    </div>
  )
}