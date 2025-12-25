'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Calendar, Package, TrendingUp, Clock, DollarSign } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function InventoryReport({ componentId = null, onClose = null }) {
    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    const fetchReportData = async () => {
        if (!componentId) return

        try {
            setLoading(true)

            const url = `${API_BASE}/components/${componentId}/usage-report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Envanter raporu alınamadı')
            }

            const data = await response.json()
            setReportData(data)
        } catch (error) {
            console.error('Error fetching inventory report:', error)
            alert('Envanter raporu yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (componentId) {
            fetchReportData()
        }
    }, [componentId, dateRange])

    const reportRef = useRef(null)

    const generatePDF = async () => {
        if (!reportRef.current) return

        try {
            setLoading(true)

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgWidth = 210 // A4 width in mm
            const pageHeight = 295 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            const fileName = `envanter-raporu-${componentId}-${new Date().toISOString().split('T')[0]}.pdf`
            pdf.save(fileName)

        } catch (error) {
            console.error('PDF oluşturulurken hata:', error)
            alert('PDF oluşturulurken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR')
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount)
    }

    const calculateUsageStats = (data) => {
        if (!data || !data.usageHistory) return null

        const totalDays = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))
        const totalMonths = totalDays / 30
        const totalWeeks = totalDays / 7

        return {
            totalUsage: data.usageHistory.length,
            totalQuantity: data.usageHistory.reduce((sum, usage) => sum + usage.quantity, 0),
            totalCost: data.usageHistory.reduce((sum, usage) => sum + usage.cost, 0),
            averagePerMonth: data.usageHistory.length / (totalMonths || 1),
            averagePerWeek: data.usageHistory.length / (totalWeeks || 1),
            averageQuantityPerMonth: data.usageHistory.reduce((sum, usage) => sum + usage.quantity, 0) / (totalMonths || 1),
            averageCostPerMonth: data.usageHistory.reduce((sum, usage) => sum + usage.cost, 0) / (totalMonths || 1)
        }
    }

    const usageStats = calculateUsageStats(reportData)

    return (
        <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b-4 border-blue-600">
                <div className="flex space-x-3 justify-end">
                    <div className="flex space-x-3">
                        <button
                            onClick={generatePDF}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Kapat
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div ref={reportRef}>
                {/* Company Header */}
                {reportData?.component?.company && (
                    <div className="bg-gradient-to-r from-green-50 to-gray-50 p-6 border-b-4 border-green-600">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportData.component.company.name}</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div>
                                        <p className="font-semibold">Adres:</p>
                                        <p>{reportData.component.company.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">İletişim:</p>
                                        <p>📞 {reportData.component.company.phone}</p>
                                        {reportData.component.company.email && <p>✉️ {reportData.component.company.email}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right bg-white p-4 rounded-lg shadow-sm border">
                                <p className="text-xl font-bold text-green-600">ENVANTER RAPORU</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <p><span className="font-semibold">Rapor Tarihi:</span> {formatDate(new Date().toISOString())}</p>
                                    <p><span className="font-semibold">Parça No:</span> #{componentId}</p>
                                    <p><span className="font-semibold">Parça Adı:</span> {reportData.component?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Envanter Kullanım Raporu
                            </h2>
                            <p className="text-gray-600">
                                Parça #{componentId} - Kullanım İstatistikleri
                            </p>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Başlangıç Tarihi
                            </label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchReportData}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                Raporu Güncelle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-6" ref={reportRef}>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg text-gray-600">Rapor yükleniyor...</div>
                        </div>
                    ) : !reportData ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg text-gray-600">Envanter raporu bulunamadı.</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Component Info */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                                    Parça Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Parça Adı:</span>
                                        <p className="text-sm font-medium">{reportData.component?.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Parça Numarası:</span>
                                        <p className="text-sm font-medium">{reportData.component?.partNumber || 'Belirtilmemiş'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Mevcut Fiyat:</span>
                                        <p className="text-sm font-medium">{formatCurrency(reportData.component?.price || 0)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Stok Miktarı:</span>
                                        <p className="text-sm font-medium">{reportData.component?.stockCount || 0} adet</p>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            {usageStats && (
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                                        Kullanım İstatistikleri
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                                <Package className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{usageStats.totalUsage}</p>
                                            <p className="text-sm text-gray-600">Toplam Kullanım</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                                <Clock className="h-6 w-6 text-green-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{usageStats.averagePerMonth.toFixed(1)}</p>
                                            <p className="text-sm text-gray-600">Aylık Ortalama</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                                <TrendingUp className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{usageStats.averagePerWeek.toFixed(1)}</p>
                                            <p className="text-sm text-gray-600">Haftalık Ortalama</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                                <DollarSign className="h-6 w-6 text-red-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(usageStats.totalCost)}</p>
                                            <p className="text-sm text-gray-600">Toplam Maliyet</p>
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Miktar İstatistikleri</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Toplam Kullanılan Miktar:</span>
                                                    <span className="font-medium">{usageStats.totalQuantity} adet</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Aylık Ortalama Miktar:</span>
                                                    <span className="font-medium">{usageStats.averageQuantityPerMonth.toFixed(1)} adet</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Maliyet İstatistikleri</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Toplam Maliyet:</span>
                                                    <span className="font-medium">{formatCurrency(usageStats.totalCost)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Aylık Ortalama Maliyet:</span>
                                                    <span className="font-medium">{formatCurrency(usageStats.averageCostPerMonth)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Usage History */}
                            {reportData.usageHistory && reportData.usageHistory.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanım Geçmişi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Servis Tarihi
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Araç Plakası
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Miktar
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Birim Fiyat
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Toplam Maliyet
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reportData.usageHistory.map((usage, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(usage.serviceDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {usage.vehiclePlateNo}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {usage.quantity} adet
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(usage.unitPrice)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(usage.cost)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Price History */}
                            {reportData.priceHistory && reportData.priceHistory.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Geçmişi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Değişim Tarihi
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Eski Fiyat
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Yeni Fiyat
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Değişim Nedeni
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reportData.priceHistory.map((price, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(price.changeDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(price.oldPrice)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(price.newPrice)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {price.reason || 'Belirtilmemiş'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Report Footer */}
                {reportData?.component?.company && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200 mt-8">
                        <div className="text-center text-sm text-gray-600">
                            <p>Bu rapor {reportData.component.company.name} tarafından otomatik olarak oluşturulmuştur.</p>
                            <p className="mt-1">Rapor Tarihi: {formatDate(new Date().toISOString())} | Tarih Aralığı: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}