'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calendar, Car, Gauge, Clock } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import { themeHelpers } from '../../../lib/theme'
import SearchableSelect from '../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CreateUpcomingServicePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    vehicleId: '',
    plannedDate: '',
    plannedTime: '09:00',
    duration: 60,
    serviceType: '',
    nextKm: '',
    notes: ''
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const serviceTypes = [
    'Genel Bakım',
    'Motor Ayarı',
    'Fren Servisi',
    'Şanzıman Servisi',
    'Yağ Değişimi',
    'Filtre Değişimi',
    'Balans Ayarı',
    'Akü Değişimi',
    'Klima Bakımı',
    'Egzoz Kontrolü',
    'Lastik Değişimi',
    'Aydınlatma Kontrolü'
  ]

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/vehicles`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (err) {
      setError('Araçlar yüklenirken hata oluştu')
      console.error('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.vehicleId) {
      setError('Araç seçimi zorunludur')
      return
    }

    if (!formData.plannedDate) {
      setError('Planlanan tarih zorunludur')
      return
    }

    if (!formData.serviceType) {
      setError('Servis tipi zorunludur')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId))

      // Combine date and time into a single datetime string
      const plannedDateTime = formData.plannedDate && formData.plannedTime
        ? `${formData.plannedDate}T${formData.plannedTime}:00`
        : formData.plannedDate;

      const requestData = {
        vehicleId: parseInt(formData.vehicleId),
        companyId: selectedVehicle.companyId,
        plannedDate: plannedDateTime,
        duration: formData.duration ? parseInt(formData.duration) : 60,
        serviceType: formData.serviceType,
        nextKm: formData.nextKm ? parseInt(formData.nextKm) : null,
        notes: formData.notes,
        status: 'scheduled'
      }

      const response = await fetch(`${API_BASE}/upcoming-services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Servis planlanırken hata oluştu')
      }

      // Redirect to upcoming services page after successful creation
      router.push('/upcoming')

    } catch (err) {
      setError(err.message)
      console.error('Error creating upcoming service:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Servis Planı</h1>
            <p className="mt-1 text-gray-600">
              Yaklaşan bir servis planı oluşturun
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="h-4 w-4 inline mr-2" />
                Araç *
              </label>
              <SearchableSelect
                options={vehicles}
                value={formData.vehicleId}
                onChange={(value) => handleInputChange('vehicleId', value)}
                placeholder="Araç seçin..."
                getOptionLabel={(vehicle) => `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNo}`}
                getOptionValue={(vehicle) => vehicle.id}
                required
              />
            </div>

            {/* Planned Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plannedDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Planlanan Tarih *
                </label>
                <input
                  type="date"
                  id="plannedDate"
                  value={formData.plannedDate}
                  onChange={(e) => handleInputChange('plannedDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={themeHelpers.form.input('service')}
                  required
                />
              </div>

              <div>
                <label htmlFor="plannedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Planlanan Saat *
                </label>
                <input
                  type="time"
                  id="plannedTime"
                  value={formData.plannedTime}
                  onChange={(e) => handleInputChange('plannedTime', e.target.value)}
                  className={themeHelpers.form.input('service')}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Tahmini Süre (dakika)
              </label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className={themeHelpers.form.select('service')}
              >
                <option value="30">30 dakika</option>
                <option value="60">1 saat</option>
                <option value="90">1.5 saat</option>
                <option value="120">2 saat</option>
                <option value="180">3 saat</option>
                <option value="240">4 saat</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Servisin tahmini tamamlanma süresi
              </p>
            </div>

            {/* Next Kilometers */}
            <div>
              <label htmlFor="nextKm" className="block text-sm font-medium text-gray-700 mb-2">
                <Gauge className="h-4 w-4 inline mr-2" />
                Sonraki Servis Kilometresi
              </label>
              <input
                type="number"
                id="nextKm"
                value={formData.nextKm}
                onChange={(e) => handleInputChange('nextKm', e.target.value)}
                min="0"
                className={themeHelpers.form.input('service')}
                placeholder="Örn: 15000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Aracın bir sonraki servise kadar kaç kilometre yapması gerektiğini belirtin
              </p>
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                Servis Tipi *
              </label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                className={themeHelpers.form.select('service')}
                required
              >
                <option value="">Servis tipi seçin</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className={themeHelpers.form.textarea('service')}
                placeholder="Servis hakkında ek notlar..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Planlanıyor...' : 'Planı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
