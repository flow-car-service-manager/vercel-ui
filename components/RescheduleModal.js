'use client'

import { useState } from 'react'
import { Calendar, X, Save, Clock } from 'lucide-react'

export default function RescheduleModal({ 
  isOpen, 
  onClose, 
  onReschedule, 
  service 
}) {
  const [formData, setFormData] = useState({
    plannedDate: service?.plannedDate ? new Date(service.plannedDate).toISOString().split('T')[0] : '',
    plannedTime: service?.plannedDate ? new Date(service.plannedDate).toTimeString().slice(0,5) : '09:00',
    duration: service?.duration || 60,
    serviceType: service?.serviceType || '',
    notes: service?.notes || ''
  })
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.plannedDate || !formData.serviceType) {
      alert('Lütfen tarih ve servis tipini girin')
      return
    }

    setLoading(true)
    try {
      // Combine date and time into a single datetime string
      const plannedDateTime = formData.plannedDate && formData.plannedTime 
        ? `${formData.plannedDate}T${formData.plannedTime}:00`
        : formData.plannedDate;

      await onReschedule({
        ...formData,
        plannedDate: plannedDateTime,
        duration: formData.duration ? parseInt(formData.duration) : 60
      })
      onClose()
    } catch (error) {
      console.error('Reschedule error:', error)
      alert('Yeniden planlama sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Servisi Yeniden Planla
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vehicle Info */}
          {service?.vehicle && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Araç:</p>
              <p className="font-medium">
                {service.vehicle.brand} {service.vehicle.model} - {service.vehicle.plateNo}
              </p>
            </div>
          )}

          {/* Planned Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Yeni Planlanan Tarih *
              </label>
              <input
                type="date"
                name="plannedDate"
                value={formData.plannedDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Yeni Planlanan Saat *
              </label>
              <input
                type="time"
                name="plannedTime"
                value={formData.plannedTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-1" />
              Tahmini Süre (dakika)
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servis Tipi *
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Servis hakkında ek notlar..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Planlanıyor...' : 'Yeniden Planla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
