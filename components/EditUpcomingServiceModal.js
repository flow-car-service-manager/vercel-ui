'use client'

import { useState, useEffect } from 'react'
import { Calendar, X, Save, Clock } from 'lucide-react'

export default function EditUpcomingServiceModal({ 
  isOpen, 
  onClose, 
  onUpdate, 
  service 
}) {
  const [formData, setFormData] = useState({
    plannedDate: '',
    plannedTime: '09:00',
    duration: 60
  })
  const [loading, setLoading] = useState(false)

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      const serviceDate = new Date(service.plannedDate)
      setFormData({
        plannedDate: serviceDate.toISOString().split('T')[0],
        plannedTime: serviceDate.toTimeString().slice(0,5),
        duration: service.duration || 60
      })
    }
  }, [service])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.plannedDate) {
      alert('Lütfen tarih girin')
      return
    }

    setLoading(true)
    try {
      // Combine date and time into a single datetime string
      const plannedDateTime = formData.plannedDate && formData.plannedTime 
        ? `${formData.plannedDate}T${formData.plannedTime}:00`
        : formData.plannedDate;

      await onUpdate({
        plannedDate: plannedDateTime,
        duration: formData.duration ? parseInt(formData.duration) : 60
      })
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      alert('Servis güncellenirken hata oluştu')
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
            Servis Tarih ve Saatini Düzenle
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
              <p className="text-sm text-gray-600 mt-1">Servis Tipi:</p>
              <p className="font-medium">{service.serviceType}</p>
            </div>
          )}

          {/* Planned Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Planlanan Tarih *
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
                Planlanan Saat *
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

          {/* Current Information */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">Mevcut Bilgiler:</p>
            <p className="text-xs text-blue-700">
              Tarih: {service?.plannedDate ? new Date(service.plannedDate).toLocaleDateString('tr-TR') : '-'}
            </p>
            <p className="text-xs text-blue-700">
              Saat: {service?.plannedDate ? new Date(service.plannedDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </p>
            <p className="text-xs text-blue-700">
              Süre: {service?.duration || 60} dakika
            </p>
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
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
