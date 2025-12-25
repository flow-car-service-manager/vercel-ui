'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useTranslation } from '../../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function SpecializationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchSpecializations()
  }, [])

  const fetchSpecializations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/specializations`)

      if (!response.ok) {
        throw new Error('Uzmanlık alanları yüklenirken hata oluştu')
      }

      const data = await response.json()
      setSpecializations(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching specializations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        // Update existing specialization
        const response = await fetch(`${API_BASE}/specializations/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Güncelleme sırasında hata oluştu')
        }
      } else {
        // Create new specialization
        const response = await fetch(`${API_BASE}/specializations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Ekleme sırasında hata oluştu')
        }
      }

      // Reset form and refresh data
      setFormData({ name: '', description: '' })
      setEditingId(null)
      fetchSpecializations()

    } catch (err) {
      setError(err.message)
      console.error('Error saving specialization:', err)
    }
  }

  const handleEdit = (specialization) => {
    setFormData({
      name: specialization.name,
      description: specialization.description || ''
    })
    setEditingId(specialization.id)
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu uzmanlık alanını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/specializations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme sırasında hata oluştu')
      }

      fetchSpecializations()
    } catch (err) {
      setError(err.message)
      console.error('Error deleting specialization:', err)
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
        <button
          onClick={() => router.push('/technicians')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Teknisyenlere Dön
        </button>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uzmanlık Alanları</h1>
              <p className="mt-1 text-gray-600">
                Teknisyen uzmanlık alanlarını yönetin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Uzmanlık Alanını Düzenle' : 'Yeni Uzmanlık Alanı Ekle'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Uzmanlık Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Örn: Motor Uzmanı"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Uzmanlık alanı hakkında kısa açıklama"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mevcut Uzmanlık Alanları ({specializations.length})
          </h2>

          <div className="space-y-3">
            {specializations.map((spec) => (
              <div key={spec.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{spec.name}</h3>
                  {spec.description && (
                    <p className="text-sm text-gray-500 mt-1">{spec.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(spec)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(spec.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {specializations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Henüz uzmanlık alanı eklenmemiş
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
