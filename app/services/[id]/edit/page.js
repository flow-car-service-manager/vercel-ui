'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Wrench, Car, User, Calendar, DollarSign, Building, Plus, Gauge, FileText } from 'lucide-react'
import { useTranslation } from '../../../../lib/i18n'
import { themeHelpers } from '../../../../lib/theme'
import SearchableSelect from '../../../../components/SearchableSelect'
import NextServiceModal from '../../../../components/NextServiceModal'
import CompletedServicesReport from '../../../../components/CompletedServicesReport'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ServiceEditPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState(null)
  const [companies, setCompanies] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [components, setComponents] = useState([])
  const [availableComponents, setAvailableComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showNextServiceModal, setShowNextServiceModal] = useState(false)
  const [pendingServiceUpdate, setPendingServiceUpdate] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const serviceId = params.id

  useEffect(() => {
    if (serviceId) {
      // First fetch available components, then fetch service data
      const loadData = async () => {
        await fetchAvailableComponents()
        await fetchService() // This will only set components if they're empty
      }
      loadData()
      fetchCompanies()
      fetchVehicles()
      fetchCustomers()
      fetchTechnicians()
    }
  }, [serviceId])

  const fetchService = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/service-records/${serviceId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Servis kaydı bulunamadı')
        }
        throw new Error('Servis bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()

      // Calculate labor cost from total cost and components cost
      const componentsCost = (data.serviceComponents || []).reduce((total, sc) => total + sc.cost, 0)
      const laborCost = data.totalCost - componentsCost

      setService({
        ...data,
        laborCost: laborCost > 0 ? laborCost : 0
      })

      // Only set components on initial load (when components array is empty)
      // This prevents resetting custom prices when service data is refetched
      if (components.length === 0) {
        // Set service components with ACTUAL custom prices from the database
        const serviceComponents = data.serviceComponents || []
        const componentsWithCustomPrices = serviceComponents.map(sc => {
          // Find the full component data from availableComponents
          const fullComponent = availableComponents.find(ac => ac.id === sc.componentId)

          // Calculate the ACTUAL unit price from cost and quantity
          // This preserves any custom pricing that was applied
          const actualUnitPrice = sc.cost / sc.quantity

          return {
            id: sc.id,
            componentId: sc.componentId,
            quantity: sc.quantity,
            unitPrice: actualUnitPrice, // Use the ACTUAL custom price from the database
            component: fullComponent || sc.component
          }
        })
        setComponents(componentsWithCustomPrices)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching service:', err)
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

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
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

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_BASE}/technicians`)
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data)
      }
    } catch (err) {
      console.error('Error fetching technicians:', err)
    }
  }

  const fetchAvailableComponents = async () => {
    try {
      const response = await fetch(`${API_BASE}/components`)
      if (response.ok) {
        const data = await response.json()
        setAvailableComponents(data)
      }
    } catch (err) {
      console.error('Error fetching components:', err)
    }
  }

  const addComponent = () => {
    setComponents(prev => [...prev, {
      id: `new-${Date.now()}`,
      componentId: '',
      quantity: 1,
      unitPrice: 0,
      component: null
    }])
  }

  const updateComponent = (index, field, value) => {
    setComponents(prev => {
      const updated = [...prev]
      const currentComponent = updated[index]

      if (field === 'componentId' && value) {
        const selectedComponent = availableComponents.find(c => c.id === parseInt(value))
        if (selectedComponent) {
          // Always set the component object
          updated[index].component = selectedComponent

          // Only set default price for NEW components (no componentId set)
          // Preserve custom prices for existing components
          const isNewComponent = !currentComponent.componentId
          const isSameComponent = currentComponent.componentId === parseInt(value)

          if (isNewComponent) {
            // New component - use default price
            updated[index].unitPrice = selectedComponent.price
          } else if (!isSameComponent) {
            // Different component selected - use default price
            updated[index].unitPrice = selectedComponent.price
          }
          // If same component is selected again, keep the current price (custom or default)

          // Update componentId
          updated[index].componentId = parseInt(value)
        }
      } else {
        // For other fields, just update the value
        updated[index] = { ...currentComponent, [field]: value }
      }

      return updated
    })
  }

  const removeComponent = async (index, componentId) => {
    // If it's an existing component (has database ID), delete from backend
    if (componentId && typeof componentId === 'number') {
      try {
        await fetch(`${API_BASE}/service-components/${componentId}`, {
          method: 'DELETE'
        })
      } catch (err) {
        console.error('Error deleting component:', err)
        return // Don't remove from UI if deletion failed
      }
    }

    // Remove from UI
    setComponents(prev => prev.filter((_, i) => i !== index))
  }

  const calculateLaborCost = () => {
    return parseFloat(service?.laborCost || 0)
  }

  const calculateTechnicianEarnings = () => {
    const laborCost = calculateLaborCost()
    if (laborCost <= 0 || !service.technicianId) return 0

    const selectedTechnician = technicians.find(t => t.id === service.technicianId)
    const earningsPercentage = selectedTechnician?.earningsPercentage || 30
    const earnings = (laborCost * earningsPercentage) / 100
    return Math.round(earnings * 100) / 100 // Round to 2 decimal places
  }

  const calculateTotalCost = () => {
    const componentsCost = components.reduce((total, comp) => {
      return total + (comp.quantity * comp.unitPrice)
    }, 0)
    const laborCost = calculateLaborCost()
    const total = laborCost + componentsCost
    return Math.round(total * 100) / 100 // Round to 2 decimal places
  }

  const handleInputChange = (field, value) => {
    setService(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateNextService = async (nextServiceData) => {
    try {
      // If we have pendingServiceUpdate (from modal flow), use it
      // Otherwise, we're in direct call from form submission
      let updateData, preservedComponents

      if (pendingServiceUpdate) {
        const { components: preservedComps, nextServiceData: formNextServiceData, ...updateDataFromPending } = pendingServiceUpdate
        updateData = updateDataFromPending
        preservedComponents = preservedComps
      } else {
        // Create update data from current state for direct call
        updateData = {
          description: service.description,
          serviceDate: service.serviceDate,
          totalCost: calculateTotalCost(),
          status: 'completed',
          companyId: service.companyId,
          vehicleId: service.vehicleId,
          customerId: service.customerId,
          technicianId: service.technicianId,
          technicianEarnings: service.technicianId ? calculateTechnicianEarnings() : null,
          currentKm: service.currentKm || null
        }
        preservedComponents = components
      }

      const finalUpdateData = {
        ...updateData,
        status: 'completed'
      }

      // Use the next service data from the parameter
      const finalNextServiceData = nextServiceData

      // Update the service record
      const response = await fetch(`${API_BASE}/service-records/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalUpdateData)
      })

      if (!response.ok) {
        throw new Error('Servis kaydı güncellenirken hata oluştu')
      }

      // Handle service components using the preserved components (with custom prices)
      const componentsToSave = preservedComponents || components
      for (const component of componentsToSave) {
        const componentCost = component.quantity * component.unitPrice
        const componentData = {
          serviceRecordId: parseInt(serviceId),
          componentId: parseInt(component.componentId),
          quantity: parseInt(component.quantity),
          unitPrice: parseFloat(component.unitPrice), // Save the custom unit price
          cost: parseFloat(componentCost)
        }

        if (component.id && typeof component.id === 'number') {
          // Update existing component
          await fetch(`${API_BASE}/service-components/${component.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(componentData)
          })
        } else {
          // Create new component
          await fetch(`${API_BASE}/service-components`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(componentData)
          })
        }
      }

      // Create the next service if we have the data
      if (finalNextServiceData && finalNextServiceData.plannedDate && finalNextServiceData.serviceType) {
        // Convert date string to ISO DateTime
        const plannedDateTime = new Date(finalNextServiceData.plannedDate + 'T00:00:00.000Z').toISOString()

        const nextServiceRequestData = {
          vehicleId: parseInt(service.vehicleId),
          companyId: parseInt(service.companyId),
          plannedDate: plannedDateTime,
          serviceType: finalNextServiceData.serviceType,
          nextKm: finalNextServiceData.nextKm || null,
          notes: finalNextServiceData.notes || '',
          status: 'scheduled'
        }

        const nextServiceResponse = await fetch(`${API_BASE}/upcoming-services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextServiceRequestData)
        })

        if (!nextServiceResponse.ok) {
          const errorData = await nextServiceResponse.json()
          throw new Error(`Sonraki servis planı oluşturulurken hata: ${errorData.error || 'Bilinmeyen hata'}`)
        }
      }

      // Redirect to upcoming services page after successful update
      router.push('/upcoming')

    } catch (err) {
      setError(err.message)
      console.error('Error updating service:', err)
      throw err
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!service.description?.trim()) {
      setError('Servis açıklaması zorunludur')
      return
    }

    if (!service.serviceDate) {
      setError('Servis tarihi zorunludur')
      return
    }

    if (!service.vehicleId) {
      setError('Araç seçimi zorunludur')
      return
    }

    if (!service.customerId) {
      setError('Müşteri seçimi zorunludur')
      return
    }

    if (!service.laborCost && service.laborCost !== 0) {
      setError('İşçilik maliyeti zorunludur')
      return
    }

    if (service.laborCost < 0) {
      setError('İşçilik maliyeti negatif olamaz')
      return
    }

    // Validate next service plan if status is completed
    if (service.status === 'completed') {
      const nextServiceDate = document.getElementById('nextServiceDate')?.value
      const nextServiceType = document.getElementById('nextServiceType')?.value

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

      const updateData = {
        description: service.description,
        serviceDate: service.serviceDate,
        totalCost: calculateTotalCost(),
        status: service.status,
        companyId: service.companyId,
        vehicleId: service.vehicleId,
        customerId: service.customerId,
        technicianId: service.technicianId,
        technicianEarnings: service.technicianId ? calculateTechnicianEarnings() : null,
        currentKm: service.currentKm || null
      }

      // Check if status is being changed to "completed"
      if (service.status === 'completed') {
        // Collect next service plan data from form
        const nextServiceDate = document.getElementById('nextServiceDate')?.value
        const nextServiceType = document.getElementById('nextServiceType')?.value
        const nextServiceKm = document.getElementById('nextServiceKm')?.value
        const nextServiceNotes = document.getElementById('nextServiceNotes')?.value

        // If we have the required next service data from the form, proceed directly
        if (nextServiceDate && nextServiceType) {
          // Create the next service immediately without showing modal
          const nextServiceData = {
            plannedDate: nextServiceDate,
            serviceType: nextServiceType,
            nextKm: nextServiceKm ? parseInt(nextServiceKm) : null,
            notes: nextServiceNotes
          }

          // Update service record and create next service in one go
          await handleCreateNextService(nextServiceData)
          return // Return here since handleCreateNextService handles everything
        } else {
          // If form data is incomplete, show the modal for user to complete
          setPendingServiceUpdate({
            ...updateData,
            components: components, // Preserve the current component state with custom prices
            nextServiceData: {
              plannedDate: nextServiceDate,
              serviceType: nextServiceType,
              nextKm: nextServiceKm ? parseInt(nextServiceKm) : null,
              notes: nextServiceNotes
            }
          })
          setShowNextServiceModal(true)
          setSaving(false)
          return
        }
      }

      // For other status changes, proceed with normal update
      const response = await fetch(`${API_BASE}/service-records/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Servis kaydı güncellenirken hata oluştu')
      }

      // Handle service components
      for (const component of components) {
        const componentCost = component.quantity * component.unitPrice
        const componentData = {
          serviceRecordId: parseInt(serviceId),
          componentId: parseInt(component.componentId),
          quantity: parseInt(component.quantity),
          unitPrice: parseFloat(component.unitPrice), // Save the custom unit price
          cost: parseFloat(componentCost)
        }

        if (component.id && typeof component.id === 'number') {
          // Update existing component
          await fetch(`${API_BASE}/service-components/${component.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(componentData)
          })
        } else {
          // Create new component
          await fetch(`${API_BASE}/service-components`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(componentData)
          })
        }
      }

      // Redirect to service detail page after successful update
      router.push(`/services/${serviceId}`)

    } catch (err) {
      setError(err.message)
      console.error('Error updating service:', err)
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

  if (error && !service) {
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
              onClick={fetchService}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Servis kaydı bulunamadı</h3>
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

  if (!service) {
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
              <h1 className="text-3xl font-bold text-gray-900">Servis Düzenle</h1>
              <p className="mt-1 text-gray-600">
                {service.description} • Servis #{service.id}
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
            {/* Service Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <Wrench className="h-4 w-4 inline mr-2" />
                Servis Açıklaması *
              </label>
              <textarea
                id="description"
                value={service.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={themeHelpers.form.textarea('service')}
                placeholder="Servis açıklamasını girin"
                required
              />
            </div>

            {/* Service Date, Status and KM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Servis Tarihi *
                </label>
                <input
                  type="date"
                  id="serviceDate"
                  value={service.serviceDate ? new Date(service.serviceDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  className={themeHelpers.form.input('service')}
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Durum *
                </label>
                <select
                  id="status"
                  value={service.status || 'pending'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={themeHelpers.form.select('service')}
                  required
                >
                  <option value="pending">Bekliyor</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div>
                <label htmlFor="currentKm" className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="h-4 w-4 inline mr-2" />
                  Mevcut KM
                </label>
                <input
                  type="number"
                  id="currentKm"
                  min="0"
                  value={service.currentKm || ''}
                  onChange={(e) => handleInputChange('currentKm', parseInt(e.target.value) || null)}
                  className={themeHelpers.form.input('service')}
                  placeholder="Aracın mevcut kilometresi"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Servis sırasındaki araç kilometresi
                </p>
              </div>
            </div>

            {/* Next Service Plan - Show only when status is completed */}
            {service.status === 'completed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Sonraki Servis Planı
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Bu servis tamamlandığı için bir sonraki servis planını oluşturun.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nextServiceDate" className="block text-sm font-medium text-blue-700 mb-2">
                      Planlanan Tarih *
                    </label>
                    <input
                      type="date"
                      id="nextServiceDate"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="nextServiceKm" className="block text-sm font-medium text-blue-700 mb-2">
                      Sonraki KM
                    </label>
                    <input
                      type="number"
                      id="nextServiceKm"
                      min="0"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Örn: 15000"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor="nextServiceType" className="block text-sm font-medium text-blue-700 mb-2">
                    Servis Tipi *
                  </label>
                  <select
                    id="nextServiceType"
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
                  <label htmlFor="nextServiceNotes" className="block text-sm font-medium text-blue-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    id="nextServiceNotes"
                    rows={2}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sonraki servis için notlar..."
                  />
                </div>
              </div>
            )}

            {/* Labor Cost (Configurable) */}
            <div>
              <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                İşçilik Maliyeti *
              </label>
              <input
                type="number"
                id="laborCost"
                step="0.01"
                min="0"
                value={service.laborCost || ''}
                onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                className={themeHelpers.form.input('service')}
                placeholder="İşçilik maliyetini girin"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                İşçilik maliyetini manuel olarak ayarlayın
              </p>
            </div>

            {/* Technician Earnings (Calculated) */}
            {service.technicianId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Teknisyen Kazancı
                </label>
                <input
                  type="text"
                  value={`${calculateTechnicianEarnings().toFixed(2)} TL`}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(() => {
                    const selectedTechnician = technicians.find(t => t.id === service.technicianId)
                    const percentage = selectedTechnician?.earningsPercentage || 30
                    return `İşçilik maliyetinin %${percentage}'i (${selectedTechnician?.name || 'Teknisyen'})`
                  })()}
                </p>
              </div>
            )}

            {/* Service Components */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Kullanılan Parçalar
                </label>
                <button
                  type="button"
                  onClick={addComponent}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                >
                  + Parça Ekle
                </button>
              </div>

              {components.length === 0 ? (
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm">Henüz parça eklenmemiş</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((component, index) => (
                    <div key={component.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      {/* Component Selection - Searchable */}
                      <div className="flex-1">
                        <SearchableSelect
                          options={availableComponents}
                          value={component.componentId || ''}
                          onChange={(value) => updateComponent(index, 'componentId', value)}
                          placeholder="Parça ara veya seçin..."
                          getOptionLabel={(comp) => `${comp.name} ${comp.partNumber ? `(${comp.partNumber})` : ''} - ${comp.price} TL`}
                          getOptionValue={(comp) => comp.id}
                          required
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={component.quantity || 1}
                          onChange={(e) => updateComponent(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Adet"
                          required
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-40">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={component.unitPrice || 0}
                            onChange={(e) => updateComponent(index, 'unitPrice', parseFloat(e.target.value))}
                            className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${component.component && component.unitPrice !== component.component.price
                              ? 'border-orange-300 bg-orange-50' // Custom price
                              : 'border-gray-300' // Default price
                              }`}
                            placeholder="Birim Fiyat"
                            required
                          />
                          {component.component && component.unitPrice !== component.component.price && (
                            <>
                              <div className="absolute -top-2 -right-2">
                                <span className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded" title="Özel fiyat">
                                  Ö
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateComponent(index, 'unitPrice', component.component.price)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                title="Varsayılan fiyata dön"
                              >
                                ↶
                              </button>
                            </>
                          )}
                        </div>
                        {component.component && (
                          <p className="text-xs text-gray-500 mt-1">
                            Varsayılan: {component.component.price} TL
                          </p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="w-24 text-sm font-medium text-gray-700">
                        {((component.quantity * component.unitPrice) || 0).toFixed(2)} TL
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeComponent(index, component.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Components Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Parçalar Toplamı:</span>
                    <span className="font-bold text-lg">
                      {components.reduce((total, comp) => total + ((comp.quantity || 0) * (comp.unitPrice || 0)), 0).toFixed(2)} TL
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Cost (Read-only, calculated from components) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Toplam Maliyet
              </label>
              <input
                type="text"
                value={`${calculateTotalCost().toFixed(2)} TL`}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                Toplam maliyet parçaların toplamından otomatik hesaplanır
              </p>
            </div>

            {/* Company and Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Şirket
                </label>
                <SearchableSelect
                  options={companies}
                  value={service.companyId || ''}
                  onChange={(value) => handleInputChange('companyId', parseInt(value))}
                  placeholder="Şirket seçin..."
                  getOptionLabel={(company) => company.name}
                  getOptionValue={(company) => company.id}
                />
              </div>
              <div>
                <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2" />
                  Araç *
                </label>
                <SearchableSelect
                  options={vehicles}
                  value={service.vehicleId || ''}
                  onChange={(value) => handleInputChange('vehicleId', parseInt(value))}
                  placeholder="Araç seçin..."
                  required
                  getOptionLabel={(vehicle) => `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNo}`}
                  getOptionValue={(vehicle) => vehicle.id}
                />
              </div>
            </div>

            {/* Customer and Technician */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Müşteri *
                </label>
                <SearchableSelect
                  options={customers}
                  value={service.customerId || ''}
                  onChange={(value) => handleInputChange('customerId', parseInt(value))}
                  placeholder="Müşteri seçin..."
                  required
                  getOptionLabel={(customer) => customer.name}
                  getOptionValue={(customer) => customer.id}
                />
              </div>
              <div>
                <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-2">
                  <Wrench className="h-4 w-4 inline mr-2" />
                  Teknisyen
                </label>
                <SearchableSelect
                  options={technicians}
                  value={service.technicianId || ''}
                  onChange={(value) => handleInputChange('technicianId', parseInt(value))}
                  placeholder="Teknisyen seçin..."
                  getOptionLabel={(technician) => technician.name}
                  getOptionValue={(technician) => technician.id}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                Rapor
              </button>
              <div className="flex space-x-3">
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
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${themeHelpers.button.primary('service')}`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Next Service Modal */}
      <NextServiceModal
        isOpen={showNextServiceModal}
        onClose={() => {
          setShowNextServiceModal(false)
          setPendingServiceUpdate(null)
        }}
        onCreateNextService={handleCreateNextService}
        vehicle={service?.vehicle}
        nextServiceData={pendingServiceUpdate?.nextServiceData}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CompletedServicesReport
              serviceId={serviceId}
              onClose={() => setShowReportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
