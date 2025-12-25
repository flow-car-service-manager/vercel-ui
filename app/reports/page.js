'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Calendar, BarChart3, Search, Filter, Plus, CheckCircle } from 'lucide-react'
import CompletedServicesReport from '../../components/CompletedServicesReport'
import { useTranslation } from '../../lib/i18n'
import SearchableSelect from '../../components/SearchableSelect'

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ReportsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCompletedServicesModal, setShowCompletedServicesModal] = useState(false)
  const [showServiceRecordModal, setShowServiceRecordModal] = useState(false)
  const [reportType, setReportType] = useState('service')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [companies, setCompanies] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [serviceRecords, setServiceRecords] = useState([])
  const [selectedService, setSelectedService] = useState('')

  useEffect(() => {
    fetchReports()
    fetchCompanies()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/reports`)

      if (!response.ok) {
        throw new Error('Raporlar yüklenirken hata oluştu')
      }

      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reports:', err)
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

  const fetchServiceRecords = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE}/service-records?vehicleId=${vehicleId}`)
      if (response.ok) {
        const data = await response.json()
        setServiceRecords(data)
      }
    } catch (err) {
      console.error('Error fetching service records:', err)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const generatePDFReport = async () => {
    try {
      setGeneratingReport(true)

      let url = ''
      const params = new URLSearchParams()

      if (companyId) params.append('companyId', companyId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      if (reportType === 'service') {
        url = `${API_BASE}/reports/pdf/service?${params.toString()}`
      } else if (reportType === 'inventory') {
        url = `${API_BASE}/reports/pdf/inventory?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('PDF oluşturulurken hata oluştu')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${reportType}-raporu-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      setShowGenerateModal(false)
      // Reset form
      setStartDate('')
      setEndDate('')
      setCompanyId('')

    } catch (err) {
      setError(err.message)
      console.error('Error generating PDF:', err)
    } finally {
      setGeneratingReport(false)
    }
  }

  const openGenerateModal = () => {
    setShowGenerateModal(true)
    setError(null)
  }

  const closeGenerateModal = () => {
    setShowGenerateModal(false)
    setError(null)
    setStartDate('')
    setEndDate('')
    setCompanyId('')
  }



  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || report.reportType === typeFilter

    return matchesSearch && matchesType
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReportTypeText = (type) => {
    return t(`reports.reportTypes.${type}`) || type
  }

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800'
      case 'stock':
        return 'bg-green-100 text-green-800'
      case 'vehicle':
        return 'bg-purple-100 text-purple-800'
      case 'technician':
        return 'bg-orange-100 text-orange-800'
      case 'customer':
        return 'bg-indigo-100 text-indigo-800'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReportDetails = (report) => {
    if (report.reportType === 'service' && report.reportServiceDetails && report.reportServiceDetails.length > 0) {
      const detail = report.reportServiceDetails[0]
      return {
        title: 'Servis Raporu Detayları',
        items: [
          { label: 'Toplam Maliyet', value: `${detail.totalCost} ₺` },
          { label: 'Kullanılan Parçalar', value: detail.partsUsed },
          { label: 'Teknisyen', value: detail.technicianName },
          { label: 'Araç Plakası', value: detail.vehiclePlate }
        ]
      }
    } else if (report.reportType === 'stock' && report.reportStockDetails && report.reportStockDetails.length > 0) {
      const detail = report.reportStockDetails[0]
      return {
        title: 'Stok Raporu Detayları',
        items: [
          { label: 'Toplam Ürün', value: detail.totalItems },
          { label: 'Toplam Değer', value: `${detail.totalValue} ₺` },
          { label: 'Düşük Stok Ürünleri', value: detail.lowStockItems }
        ]
      }
    }
    return null
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
            onClick={fetchReports}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
            <p className="mt-2 text-gray-600">
              Toplam {reports.length} rapor
            </p>
          </div>
          <button
            onClick={openGenerateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('reports.generateReport')}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rapor özeti veya türü ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <SearchableSelect
              options={[
                { value: 'all', label: 'Tüm Raporlar' },
                { value: 'service', label: 'Servis Raporları' },
                { value: 'stock', label: 'Stok Raporları' },
                { value: 'vehicle', label: 'Araç Raporları' },
                { value: 'technician', label: 'Teknisyen Raporları' },
                { value: 'customer', label: 'Müşteri Raporları' },
                { value: 'upcoming', label: 'Yaklaşan Servisler' }
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Rapor türü seçin..."
              searchable={false}
              className="pl-10"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>
        </div>
      </div>

      {/* Quick Report Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Record Report Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Servis Kaydı Raporu</h3>
            </div>
            <button
              onClick={() => setShowServiceRecordModal(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Oluştur
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Belirli bir araç ve servis kaydı için detaylı rapor oluşturun.
          </p>
        </div>

      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => {
          const reportDetails = getReportDetails(report)

          return (
            <div key={report.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Report Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.summary || `${getReportTypeText(report.reportType)} Raporu`}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getReportTypeColor(report.reportType)}`}>
                        {getReportTypeText(report.reportType)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Report Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    Oluşturulma: {formatDate(report.generatedAt)}
                  </div>

                  {report.company && (
                    <div className="text-sm text-gray-600">
                      Şirket: <span className="font-medium text-gray-900">{report.company.name}</span>
                    </div>
                  )}
                </div>

                {/* Report Details */}
                {reportDetails && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{reportDetails.title}</h4>
                    <div className="space-y-2">
                      {reportDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.label}:</span>
                          <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Path */}
                {report.filePath && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Dosya:</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {report.filePath}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('common.view')}
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.export')}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || typeFilter !== 'all' ? 'Arama sonucu bulunamadı' : 'Henüz rapor bulunmuyor'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' ? 'Farklı bir arama terimi veya filtre deneyin' : 'İlk raporunuzu oluşturarak başlayın'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-sm text-gray-600">Toplam Rapor</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.reportType === 'service').length}
          </div>
          <div className="text-sm text-gray-600">Servis Raporu</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {reports.filter(r => r.reportType === 'stock').length}
          </div>
          <div className="text-sm text-gray-600">Stok Raporu</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {[...new Set(reports.map(r => r.reportType))].length}
          </div>
          <div className="text-sm text-gray-600">Farklı Rapor Türü</div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rapor Oluştur</h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rapor Türü
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="service">Servis Raporu</option>
                    <option value="inventory">Stok Raporu</option>
                  </select>
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket (Opsiyonel)
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tüm Şirketler</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range (for service reports) */}
                {reportType === 'service' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlangıç Tarihi (Opsiyonel)
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bitiş Tarihi (Opsiyonel)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeGenerateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={generatingReport}
                >
                  İptal
                </button>
                <button
                  onClick={generatePDFReport}
                  disabled={generatingReport}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {generatingReport ? 'Oluşturuluyor...' : 'PDF Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Record Report Modal */}
      {showServiceRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Servis Kaydı Raporu Oluştur</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Araç Seçin
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => {
                      setSelectedVehicle(e.target.value)
                      if (e.target.value) {
                        fetchServiceRecords(e.target.value)
                      } else {
                        setServiceRecords([])
                        setSelectedService('')
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Araç seçin...</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plateNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servis Kaydı Seçin
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    disabled={!selectedVehicle || serviceRecords.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">Servis kaydı seçin...</option>
                    {serviceRecords.map(service => (
                      <option key={service.id} value={service.id}>
                        {formatDate(service.serviceDate)} - {service.description}
                      </option>
                    ))}
                  </select>
                  {selectedVehicle && serviceRecords.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">Bu araç için servis kaydı bulunamadı.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowServiceRecordModal(false)
                    setSelectedVehicle('')
                    setSelectedService('')
                    setServiceRecords([])
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (selectedService) {
                      setShowServiceRecordModal(false)
                      // Show the report in a new modal
                      setTimeout(() => {
                        setShowCompletedServicesModal(true)
                      }, 100)
                    }
                  }}
                  disabled={!selectedService}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Raporu Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Services Report Modal */}
      {showCompletedServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CompletedServicesReport
              serviceId={selectedService}
              onClose={() => {
                setShowCompletedServicesModal(false)
                setSelectedVehicle('')
                setSelectedService('')
                setServiceRecords([])
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}