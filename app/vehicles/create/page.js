'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Car, User, Calendar, Hash } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import SearchableSelect from '../../../components/SearchableSelect'
import { useSearchParams } from "next/navigation";

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function CreateVehiclePageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams();
  const customerId = searchParams.get("c_id");

  // Form state - companyId will be set to 1 since we only have one company
  const [formData, setFormData] = useState({
    plateNo: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    customerId: customerId && !isNaN(Number(customerId)) ? parseInt(customerId, 10) : '',
    companyId: 1 // Always use company ID 1
  })
  const [plateNumberError, setPlateNumberError] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/customers`)

      if (!response.ok) {
        throw new Error('Müşteriler yüklenirken hata oluştu')
      }

      const data = await response.json()
      console.log("data: ", data);
      setCustomers(data.data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkPlateNumberExists = async (plateNo) => {
    if (!plateNo.trim()) {
      setPlateNumberError('')
      return false
    }

    try {
      const response = await fetch(`${API_BASE}/vehicles?plateNo=${encodeURIComponent(plateNo)}`)
      if (response.ok) {
        const vehicles = await response.json()
        // Check if any vehicle has this plate number
        const exists = vehicles.some(vehicle => vehicle.plateNo === plateNo)
        if (exists) {
          setPlateNumberError('Bu plaka numarası zaten kayıtlı')
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === "string" && !isNaN(Number(value))
        ? parseInt(value, 10)   // convert string numbers to int
        : value                 // keep as-is if not a number
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.plateNo.trim()) {
      setError('Plaka numarası zorunludur')
      return
    }

    // Check if plate number is unique
    const plateExists = await checkPlateNumberExists(formData.plateNo)
    if (plateExists) {
      setError('Bu plaka numarası zaten kayıtlı. Lütfen farklı bir plaka numarası girin.')
      return
    }

    if (!formData.brand.trim()) {
      setError('Marka zorunludur')
      return
    }

    if (!formData.model.trim()) {
      setError('Model zorunludur')
      return
    }

    if (!formData.customerId) {
      setError('Müşteri seçimi zorunludur')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Araç oluşturulurken hata oluştu')
      }

      // Redirect to vehicles page after successful creation
      router.push('/vehicles')

    } catch (err) {
      setError(err.message)
      console.error('Error creating vehicle:', err)
    } finally {
      setSaving(false)
    }
  }

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i)

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900">Yeni Araç Ekle</h1>
              <p className="mt-1 text-gray-600">
                Yeni araç bilgilerini girin
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

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plate Number */}
              <div>
                <label htmlFor="plateNo" className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  Plaka No *
                </label>
                <input
                  type="text"
                  id="plateNo"
                  value={formData.plateNo}
                  onChange={(e) => handleInputChange('plateNo', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${plateNumberError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="34 ABC 123"
                  required
                />
                {plateNumberError && (
                  <p className="mt-1 text-sm text-red-600">{plateNumberError}</p>
                )}
              </div>

              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Müşteri *
                </label>
                <SearchableSelect
                  options={customers}
                  value={formData.customerId}
                  onChange={(value) => handleInputChange('customerId', parseInt(value))}
                  placeholder="Müşteri seçin..."
                  required
                  getOptionLabel={(customer) => `${customer.name} - ${customer.phone || 'Telefon yok'}`}
                  getOptionValue={(customer) => customer.id}
                />
              </div>

              {/* Brand */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2" />
                  Marka *
                </label>
                <input
                  type="text"
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Örn: Toyota, BMW, Mercedes"
                  required
                />
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2" />
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Örn: Corolla, 3 Serisi, C Serisi"
                  required
                />
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Yıl *
                </label>
                <select
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* VIN */}
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  Şasi No (VIN)
                </label>
                <input
                  type="text"
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Şasi numarası (opsiyonel)"
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

export default function CreateVehiclePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    }>
      <CreateVehiclePageContent />
    </Suspense>
  )
}
