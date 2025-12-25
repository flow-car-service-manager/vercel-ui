'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Phone, Wrench, Calendar, Building, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import { themeHelpers } from '../../../../lib/theme'
import SearchableSelect from '../../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function TechnicianEditPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [technician, setTechnician] = useState(null)
  const [companies, setCompanies] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const technicianId = params.id

  useEffect(() => {
    if (technicianId) {
      fetchTechnician()
      fetchCompanies()
      fetchSpecializations()
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

      // Transform the data to include specializationIds array
      const transformedData = {
        ...data,
        specializationIds: data.technicianSpecializations?.map(ts => ts.specialization.id) || []
      }

      setTechnician(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching technician:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/companies`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
    }
  }

  const fetchSpecializations = async () => {
    try {
      const response = await fetch(`${API_BASE}/specializations`)
      if (response.ok) {
        const data = await response.json()
        setSpecializations(data)
      }
    } catch (err) {
      console.error('Error fetching specializations:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setTechnician(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecializationChange = (specId) => {
    setTechnician(prev => {
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

    if (!technician.name?.trim()) {
      setError('Teknisyen adı zorunludur')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE}/technicians/${technicianId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: technician.name,
          phone: technician.phone,
          specializationIds: technician.specializationIds || [],
          hireDate: technician.hireDate,
          active: technician.active,
          companyId: technician.companyId,
          earningsPercentage: technician.earningsPercentage
        })
      })

      if (!response.ok) {
        throw new Error('Teknisyen güncellenirken hata oluştu')
      }

      // Redirect to technician detail page after successful update
      router.push(`/technicians/${technicianId}`)

    } catch (err) {
      setError(err.message)
      console.error('Error updating technician:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error && !technician) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

  if (!technician) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Teknisyen Düzenle</h1>
              <p className="mt-1 text-gray-600">
                {technician.name} • Teknisyen #{technician.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Technician Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Teknisyen Adı *
              </label>
              <input
                type="text"
                id="name"
                value={technician.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={themeHelpers.form.input('technician')}
                placeholder="Teknisyen adını girin"
                required
              />
            </div>

            {/* Company Selection */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-2" />
                Şirket
              </label>
              <SearchableSelect
                options={companies}
                value={technician.companyId || ''}
                onChange={(value) => handleInputChange('companyId', parseInt(value))}
                placeholder="Şirket seçin..."
                getOptionLabel={(company) => company.name}
                getOptionValue={(company) => company.id}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                value={technician.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={themeHelpers.form.input('technician')}
                placeholder="+90 (XXX) XXX XX XX"
              />
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Wrench className="h-4 w-4 inline mr-2" />
                Uzmanlık Alanları
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {specializations.map(spec => (
                  <div key={spec.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`spec-${spec.id}`}
                      checked={(technician.specializationIds || []).includes(spec.id)}
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
              {(technician.specializationIds || []).length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  {(technician.specializationIds || []).length} uzmanlık seçildi
                </p>
              )}
            </div>

            {/* Earnings Percentage */}
            <div>
              <label htmlFor="earningsPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Kazanç Yüzdesi (%)
              </label>
              <input
                type="number"
                id="earningsPercentage"
                step="0.1"
                min="0"
                max="100"
                value={technician.earningsPercentage || 30}
                onChange={(e) => handleInputChange('earningsPercentage', parseFloat(e.target.value))}
                className={themeHelpers.form.input('technician')}
                placeholder="30"
              />
              <p className="mt-1 text-sm text-gray-500">
                Teknisyenin işçilik maliyetinden alacağı yüzde (sadece işçilik üzerinden hesaplanır)
              </p>
            </div>

            {/* Hire Date */}
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                İşe Başlama Tarihi
              </label>
              <input
                type="date"
                id="hireDate"
                value={technician.hireDate ? new Date(technician.hireDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('hireDate', e.target.value)}
                className={themeHelpers.form.input('technician')}
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={technician.active === true}
                    onChange={() => handleInputChange('active', true)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Aktif
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={technician.active === false}
                    onChange={() => handleInputChange('active', false)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />
                    Pasif
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${themeHelpers.button.primary('technician')}`}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
