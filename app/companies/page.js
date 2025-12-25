'use client'

import { useState, useEffect } from 'react'
import { Building, Phone, Mail, MapPin, Users, Car, Wrench, Search } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/companies`)

      if (!response.ok) {
        throw new Error('Şirket bilgileri yüklenirken hata oluştu')
      }

      const data = await response.json()
      // Since we have only one company, take the first one
      if (data.length > 0) {
        setCompany(data[0])
        setFormData({
          name: data[0].name || '',
          address: data[0].address || '',
          phone: data[0].phone || '',
          email: data[0].email || ''
        })
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching company:', err)
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

  const handleSave = async () => {
    try {
      setLoading(true)
      let response

      if (company) {
        // Update existing company
        response = await fetch(`${API_BASE}/companies/${company.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new company
        response = await fetch(`${API_BASE}/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        throw new Error('Şirket bilgileri kaydedilirken hata oluştu')
      }

      const savedCompany = await response.json()
      setCompany(savedCompany)
      setIsEditing(false)
      alert('Şirket bilgileri başarıyla kaydedildi')
    } catch (err) {
      setError(err.message)
      console.error('Error saving company:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || ''
      })
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: ''
      })
    }
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchCompany}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Şirket Bilgileri</h1>
            <p className="mt-2 text-gray-600">
              Raporlarda kullanılacak şirket bilgilerini yönetin
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Building className="h-4 w-4 mr-2" />
              {company ? t('common.edit') : t('companies.addCompany')}
            </button>
          ) : null}
        </div>
      </div>

      {/* Company Information Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            // Edit Form
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Şirket adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Şirket adresini girin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Telefon numarasını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E-posta adresini girin"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : t('common.save')}
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              {/* Company Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {company?.name || 'Şirket bilgisi bulunamadı'}
                    </h3>
                    {company?.createdAt && (
                      <div className="text-sm text-gray-500">
                        {formatDate(company.createdAt)} tarihinde oluşturuldu
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <span>{company?.address || 'Adres bilgisi girilmemiş'}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  {company?.phone || 'Telefon bilgisi girilmemiş'}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{company?.email || 'E-posta bilgisi girilmemiş'}</span>
                </div>
              </div>

              {/* Information Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Building className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Şirket Bilgileri
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Bu bilgiler raporların başlık ve alt bilgi kısımlarında kullanılacaktır.
                        Şirket bilgilerini güncellemek için "Düzenle" butonuna tıklayın.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}