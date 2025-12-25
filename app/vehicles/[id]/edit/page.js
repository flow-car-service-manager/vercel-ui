'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Car, User, Calendar, Building } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import SearchableSelect from '../../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function VehicleEditPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState(null)
  const [companies, setCompanies] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [plateNumberError, setPlateNumberError] = useState('')

  const vehicleId = params.id

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle()
      fetchCompanies()
      fetchCustomers()
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
      // Store original plate number for comparison
      setVehicle({
        ...data,
        originalPlateNo: data.plateNo
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching vehicle:', err)
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/customers`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const checkPlateNumberExists = async (plateNo) => {
    if (!plateNo.trim() || plateNo === vehicle?.plateNo) {
      setPlateNumberError('')
      return false
    }

    try {
      const response = await fetch(`${API_BASE}/vehicles?plateNo=${encodeURIComponent(plateNo)}`)
      if (response.ok) {
        const vehicles = await response.json()
        // Check if any vehicle has this plate number (excluding current vehicle)
        const exists = vehicles.some(v => v.plateNo === plateNo && v.id !== parseInt(vehicleId))
        if (exists) {
          setPlateNumberError('Bu plaka numarası zaten başka bir araçta kayıtlı')
          return true
        } else {
          setPlateNumberError('')
          return false
        }
      }
    } catch (error) {
      console.error('Error checking plate number:', error)
    }
    return false
  }

  const handleInputChange = async (field, value) => {
    setVehicle(prev => ({
      ...prev,
      [field]: value
    }))

    // Check for duplicate plate numbers
    if (field === 'plateNo') {
      await checkPlateNumberExists(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!vehicle.plateNo?.trim()) {
      setError('Plaka numarası zorunludur')
      return
    }

    // Check if plate number is unique (if changed)
    if (vehicle.plateNo !== vehicle.originalPlateNo) {
      const plateExists = await checkPlateNumberExists(vehicle.plateNo)
      if (plateExists) {
        setError('Bu plaka numarası zaten başka bir araçta kayıtlı. Lütfen farklı bir plaka numarası girin.')
        return
      }
    }

    if (!vehicle.brand?.trim()) {
      setError('Marka zorunludur')
      return
    }

    if (!vehicle.model?.trim()) {
      setError('Model zorunludur')
      return
    }

    if (!vehicle.year) {
      setError('Yıl zorunludur')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plateNo: vehicle.plateNo,
          brand: vehicle.brand,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          vin: vehicle.vin,
          companyId: vehicle.companyId,
          customerId: vehicle.customerId
        })
      })

      if (!response.ok) {
        throw new Error('Araç güncellenirken hata oluştu')
      }

      // Redirect to vehicle detail page after successful update
      router.push(`/vehicles/${vehicleId}`)

    } catch (err) {
      setError(err.message)
      console.error('Error updating vehicle:', err)
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

  if (error && !vehicle) {
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
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

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
              <h1 className="text-3xl font-bold text-gray-900">Araç Düzenle</h1>
              <p className="mt-1 text-gray-600">
                {vehicle.brand} {vehicle.model} • Plaka: {vehicle.plateNo}
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
            {/* Plate Number */}
            <div>
              <label htmlFor="plateNo" className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="h-4 w-4 inline mr-2" />
                Plaka No *
              </label>
              <input
                type="text"
                id="plateNo"
                value={vehicle.plateNo || ''}
                onChange={(e) => handleInputChange('plateNo', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono ${plateNumberError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="34 ABC 123"
                required
              />
              {plateNumberError && (
                <p className="mt-1 text-sm text-red-600">{plateNumberError}</p>
              )}
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Marka *
                </label>
                <input
                  type="text"
                  id="brand"
                  value={vehicle.brand || ''}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Toyota"
                  required
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  value={vehicle.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Corolla"
                  required
                />
              </div>
            </div>

            {/* Year and VIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Yıl *
                </label>
                <select
                  id="year"
                  value={vehicle.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Yıl seçin</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                  Şasi No (VIN)
                </label>
                <input
                  type="text"
                  id="vin"
                  value={vehicle.vin || ''}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                  placeholder="1HGCM82633A123456"
                />
              </div>
            </div>

            {/* Company and Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Şirket
                </label>
                <SearchableSelect
                  options={companies}
                  value={vehicle.companyId || ''}
                  onChange={(value) => handleInputChange('companyId', parseInt(value))}
                  placeholder="Şirket seçin..."
                  getOptionLabel={(company) => company.name}
                  getOptionValue={(company) => company.id}
                />
              </div>
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Müşteri *
                </label>
                <SearchableSelect
                  options={customers}
                  value={vehicle.customerId || ''}
                  onChange={(value) => handleInputChange('customerId', parseInt(value))}
                  placeholder="Müşteri seçin..."
                  required
                  getOptionLabel={(customer) => customer.name}
                  getOptionValue={(customer) => customer.id}
                />
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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