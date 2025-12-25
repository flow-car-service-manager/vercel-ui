'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Wrench, Car, User, Calendar, DollarSign, Package, Plus, Trash2, Gauge, Clock } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'
import SearchableSelect from '../../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function CreateServicePageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Get vehicleId and customerId from URL query parameters
  const vehicleIdFromUrl = searchParams.get('vehicleId')
  const customerIdFromUrl = searchParams.get('customerId')

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    serviceDate: new Date().toISOString().split('T')[0],
    totalCost: 0,
    status: 'pending',
    vehicleId: vehicleIdFromUrl || '',
    customerId: customerIdFromUrl || '',
    technicianId: ''
  })

  // Options for dropdowns
  const [companies, setCompanies] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [components, setComponents] = useState([])

  // Service components
  const [serviceComponents, setServiceComponents] = useState([])
  const [selectedComponent, setSelectedComponent] = useState('')
  const [componentQuantity, setComponentQuantity] = useState(1)

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, customersRes, techniciansRes, componentsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles`),
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/technicians`),
        fetch(`${API_BASE}/components`)
      ])

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json()
        setVehicles(vehiclesData)
        setFilteredVehicles(vehiclesData)
      }
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (techniciansRes.ok) setTechnicians(await techniciansRes.json())
      if (componentsRes.ok) setComponents(await componentsRes.json())
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu')
      console.error('Error fetching options:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerChange = (customerId) => {
    setFormData(prev => ({
      ...prev,
      customerId: customerId,
      vehicleId: '' // Reset vehicle when customer changes
    }))

    // Filter vehicles by selected customer
    if (customerId) {
      const customerVehicles = vehicles.filter(vehicle => vehicle.customerId === parseInt(customerId))
      setFilteredVehicles(customerVehicles)
    } else {
      setFilteredVehicles(vehicles)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addServiceComponent = () => {
    if (!selectedComponent || componentQuantity < 1) return

    const component = components.find(c => c.id === parseInt(selectedComponent))
    if (!component) return

    const existingIndex = serviceComponents.findIndex(sc => sc.componentId === component.id)

    if (existingIndex >= 0) {
      // Update existing component quantity
      const updatedComponents = [...serviceComponents]
      updatedComponents[existingIndex].quantity += parseInt(componentQuantity)
      setServiceComponents(updatedComponents)
    } else {
      // Add new component
      setServiceComponents(prev => [...prev, {
        componentId: component.id,
        componentName: component.name,
        quantity: parseInt(componentQuantity),
        unitPrice: component.price
      }])
    }

    setSelectedComponent('')
    setComponentQuantity(1)
  }

  const removeServiceComponent = (index) => {
    setServiceComponents(prev => prev.filter((_, i) => i !== index))
  }

  const calculateTotalCost = () => {
    const componentsCost = serviceComponents.reduce((total, sc) => total + (sc.quantity * sc.unitPrice), 0)
    return componentsCost + parseFloat(formData.totalCost || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.vehicleId || !formData.customerId || !formData.technicianId) {
      setError('Lütfen araç, müşteri ve teknisyen seçin')
      return
    }

    // Validate next service plan if status is completed
    if (formData.status === 'completed') {
      const nextServiceDate = e.target.nextServiceDate?.value
      const nextServiceType = e.target.nextServiceType?.value

      if (!nextServiceDate) {
        setError('Sonraki servis planı için tarih zorunludur')
        return
      }

      if (!nextServiceType) {
        setError('Sonraki servis planı için servis tipi zorunludur')
        return
      }
    }

    try {
      setSaving(true)
      setError(null)

      const serviceData = {
        ...formData,
        totalCost: calculateTotalCost(),
        serviceComponents: serviceComponents.map(sc => ({
          componentId: sc.componentId,
          quantity: sc.quantity
        }))
      }

      const response = await fetch(`${API_BASE}/service-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      })

      if (!response.ok) {
        throw new Error('Servis kaydı oluşturulurken hata oluştu')
      }

      const createdService = await response.json()

      // If status is completed, create next service plan
      if (formData.status === 'completed') {
        const nextServiceDate = e.target.nextServiceDate?.value
        const nextServiceTime = e.target.nextServiceTime?.value || '09:00'
        const nextServiceType = e.target.nextServiceType?.value
        const nextServiceKm = e.target.nextServiceKm?.value
        const nextServiceDuration = e.target.nextServiceDuration?.value || '60'
        const nextServiceNotes = e.target.nextServiceNotes?.value

        if (nextServiceDate && nextServiceType) {
          // Combine date and time into a single datetime string
          const plannedDateTime = nextServiceDate && nextServiceTime
            ? `${nextServiceDate}T${nextServiceTime}:00`
            : nextServiceDate;

          const nextServiceData = {
            vehicleId: parseInt(formData.vehicleId),
            companyId: parseInt(formData.companyId),
            plannedDate: plannedDateTime,
            duration: nextServiceDuration ? parseInt(nextServiceDuration) : 60,
            serviceType: nextServiceType,
            nextKm: nextServiceKm ? parseInt(nextServiceKm) : null,
            notes: nextServiceNotes,
            status: 'scheduled'
          }

          const nextServiceResponse = await fetch(`${API_BASE}/upcoming-services`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nextServiceData)
          })

          if (!nextServiceResponse.ok) {
            const errorData = await nextServiceResponse.json()
            throw new Error(`Sonraki servis planı oluşturulurken hata: ${errorData.error || 'Bilinmeyen hata'}`)
          }
        }
      }

      router.push(`/services/${createdService.id}`)
    } catch (err) {
      setError(err.message)
      console.error('Error creating service:', err)
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

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Servis Kaydı</h1>
              <p className="mt-2 text-gray-600">
                Yeni bir servis kaydı oluşturun
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Service Form */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Wrench className="h-5 w-5 inline mr-2" />
                Servis Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Servis açıklamasını girin..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Servis Tarihi
                      </label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durum
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="in_progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal Edildi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Gauge className="h-4 w-4 inline mr-1" />
                        Mevcut KM
                      </label>
                      <input
                        type="number"
                        name="currentKm"
                        min="0"
                        value={formData.currentKm || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Araç kilometresi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Entities */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                İlgili Kayıtlar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Car className="h-4 w-4 inline mr-1" />
                    Araç
                  </label>
                  {vehicleIdFromUrl ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {vehicles.find(v => v.id === parseInt(vehicleIdFromUrl))?.brand + ' ' + vehicles.find(v => v.id === parseInt(vehicleIdFromUrl))?.model + ' - ' + vehicles.find(v => v.id === parseInt(vehicleIdFromUrl))?.plateNo || 'Araç yükleniyor...'}
                    </div>
                  ) : (
                    <SearchableSelect
                      options={filteredVehicles}
                      value={formData.vehicleId}
                      onChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
                      placeholder="Araç seçin..."
                      required
                      getOptionLabel={(vehicle) => `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNo}`}
                      getOptionValue={(vehicle) => vehicle.id}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Müşteri
                  </label>
                  {customerIdFromUrl ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {customers.find(c => c.id === parseInt(customerIdFromUrl))?.name || 'Müşteri yükleniyor...'}
                    </div>
                  ) : (
                    <SearchableSelect
                      options={customers}
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      placeholder="Müşteri seçin..."
                      required
                      getOptionLabel={(customer) => `${customer.name} - ${customer.phone || 'Telefon yok'}`}
                      getOptionValue={(customer) => customer.id}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Teknisyen
                  </label>
                  <SearchableSelect
                    options={technicians}
                    value={formData.technicianId}
                    onChange={(value) => setFormData(prev => ({ ...prev, technicianId: value }))}
                    placeholder="Teknisyen seçin..."
                    required
                    getOptionLabel={(technician) => technician.name}
                    getOptionValue={(technician) => technician.id}
                  />
                </div>
              </div>
            </div>

            {/* Service Components */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Package className="h-5 w-5 inline mr-2" />
                Kullanılan Parçalar
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parça
                    </label>
                    <SearchableSelect
                      options={components}
                      value={selectedComponent}
                      onChange={setSelectedComponent}
                      placeholder="Parça seçin..."
                      getOptionLabel={(component) => `${component.name} - ${component.price} ₺`}
                      getOptionValue={(component) => component.id}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miktar
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={componentQuantity}
                      onChange={(e) => setComponentQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addServiceComponent}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Components List */}
                {serviceComponents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Eklenen Parçalar:</h4>
                    {serviceComponents.map((sc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <span className="font-medium">{sc.componentName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {sc.quantity} adet × {sc.unitPrice} ₺ = {sc.quantity * sc.unitPrice} ₺
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeServiceComponent(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Costs */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <DollarSign className="h-5 w-5 inline mr-2" />
                Ek Maliyetler
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İşçilik ve Diğer Maliyetler (₺)
                </label>
                <input
                  type="number"
                  name="totalCost"
                  value={formData.totalCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Next Service Plan - Show only when status is completed */}
            {formData.status === 'completed' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Sonraki Servis Planı
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-4">
                    Bu servis tamamlandığı için bir sonraki servis planını oluşturun.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Planlanan Tarih *
                      </label>
                      <input
                        type="date"
                        name="nextServiceDate"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Planlanan Saat *
                      </label>
                      <input
                        type="time"
                        name="nextServiceTime"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Sonraki KM
                      </label>
                      <input
                        type="number"
                        name="nextServiceKm"
                        min="0"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: 15000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Tahmini Süre (dakika)
                      </label>
                      <select
                        name="nextServiceDuration"
                        defaultValue="60"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="30">30 dakika</option>
                        <option value="60">1 saat</option>
                        <option value="90">1.5 saat</option>
                        <option value="120">2 saat</option>
                        <option value="180">3 saat</option>
                        <option value="240">4 saat</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Servis Tipi *
                    </label>
                    <select
                      name="nextServiceType"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Servis tipi seçin</option>
                      <option value="Genel Bakım">Genel Bakım</option>
                      <option value="Motor Ayarı">Motor Ayarı</option>
                      <option value="Fren Servisi">Fren Servisi</option>
                      <option value="Şanzıman Servisi">Şanzıman Servisi</option>
                      <option value="Yağ Değişimi">Yağ Değişimi</option>
                      <option value="Filtre Değişimi">Filtre Değişimi</option>
                      <option value="Balans Ayarı">Balans Ayarı</option>
                      <option value="Akü Değişimi">Akü Değişimi</option>
                      <option value="Klima Bakımı">Klima Bakımı</option>
                      <option value="Egzoz Kontrolü">Egzoz Kontrolü</option>
                      <option value="Lastik Değişimi">Lastik Değişimi</option>
                      <option value="Aydınlatma Kontrolü">Aydınlatma Kontrolü</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      name="nextServiceNotes"
                      rows={2}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sonraki servis için notlar..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Total Cost Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-blue-900">Toplam Maliyet:</span>
                <span className="text-2xl font-bold text-blue-900">
                  {calculateTotalCost().toFixed(2)} ₺
                </span>
              </div>
              <div className="text-sm text-blue-700 mt-2">
                • Parça maliyeti: {serviceComponents.reduce((total, sc) => total + (sc.quantity * sc.unitPrice), 0).toFixed(2)} ₺
                <br />
                • İşçilik ve diğer: {parseFloat(formData.totalCost || 0).toFixed(2)} ₺
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Servis Kaydını Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateServicePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    }>
      <CreateServicePageContent />
    </Suspense>
  )
}