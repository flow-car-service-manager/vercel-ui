'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, User, Phone, Calendar, ArrowLeft } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CreateTechnicianPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specializationIds: [],
    hireDate: '',
    earningsPercentage: 30,
    active: true
  })

  const [specializations, setSpecializations] = useState([])

  useEffect(() => {
    fetchSpecializations()
  }, [])

  const fetchSpecializations = async () => {
    try {
      const response = await fetch(`${API_BASE}/specializations`)
      if (response.ok) {
        const data = await response.json()
        setSpecializations(data)
      }
    } catch (error) {
      console.error('Error fetching specializations:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSpecializationChange = (specId) => {
    setFormData(prev => {
      const currentIds = prev.specializationIds || []
      const newIds = currentIds.includes(specId)
        ? currentIds.filter(id => id !== specId)
        : [...currentIds, specId]

      return {
        ...prev,
        specializationIds: newIds
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get company ID (for now using first company, in real app you might have company selection)
      const companiesResponse = await fetch(`${API_BASE}/companies`)
      const companies = await companiesResponse.json()
      const companyId = companies[0]?.id

      if (!companyId) {
        throw new Error('Şirket bulunamadı')
      }

      const response = await fetch(`${API_BASE}/technicians`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyId: companyId,
          hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teknisyen eklenirken hata oluştu')
      }

      // Redirect to technicians list on success
      router.push('/technicians')
      router.refresh()

    } catch (err) {
      setError(err.message)
      console.error('Error creating technician:', err)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
        </button>

        <div className="flex items-center">
          <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
            <Wrench className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('technicians.addTechnician')}</h1>
            <p className="mt-1 text-gray-600">
              Yeni teknisyen bilgilerini ekleyin
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Teknisyen adı ve soyadı"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+90 (5__) ___ __ __"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Uzmanlık Alanları
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {specializations.map(spec => (
                    <div key={spec.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`spec-${spec.id}`}
                        checked={formData.specializationIds.includes(spec.id)}
                        onChange={() => handleSpecializationChange(spec.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`spec-${spec.id}`} className="ml-2 block text-sm text-gray-700">
                        {spec.name}
                        {spec.description && (
                          <span className="text-xs text-gray-500 block"> - {spec.description}</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.specializationIds.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    {formData.specializationIds.length} uzmanlık seçildi
                  </p>
                )}
              </div>

              {/* Hire Date */}
              <div className="sm:col-span-2">
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                  İşe Başlama Tarihi
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Earnings Percentage */}
              <div className="sm:col-span-2">
                <label htmlFor="earningsPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                  Kazanç Yüzdesi (%)
                </label>
                <input
                  type="number"
                  id="earningsPercentage"
                  name="earningsPercentage"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.earningsPercentage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="30"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Teknisyenin işçilik ücretinden alacağı yüzde (varsayılan: 30%)
                </p>
              </div>

              {/* Active Status */}
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Aktif teknisyen
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Aktif olmayan teknisyenler yeni servislere atanamaz
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  {t('technicians.addTechnician')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
