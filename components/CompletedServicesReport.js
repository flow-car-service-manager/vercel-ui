'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, FileText, Calendar, Car, User, Building, Gauge } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CompletedServicesReport({ serviceId = null, onClose = null }) {
    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchReportData = async () => {
        try {
            setLoading(true)

            const url = `${API_BASE}/service-records/completed-report?serviceId=${serviceId}`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Servis raporu alınamadı')
            }

            const data = await response.json()
            // Since we're fetching by serviceId, we should get only one item
            setReportData(data[0] || null)
        } catch (error) {
            console.error('Error fetching service report:', error)
            alert('Servis raporu yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (serviceId) {
            fetchReportData()
        }
    }, [serviceId])

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

            const fileName = `servis-raporu-${serviceId}-${new Date().toISOString().split('T')[0]}.pdf`
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

    return (
        <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b-4 border-blue-600">
                <div className="flex space-x-3 justify-end">
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
            <div ref={reportRef}>
                {/* Company Header */}
                {reportData?.company && (
                    <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 border-b-4 border-blue-600">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportData.company.name}</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div>
                                        <p className="font-semibold">Adres:</p>
                                        <p>{reportData.company.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">İletişim:</p>
                                        <p>📞 {reportData.company.phone}</p>
                                        {reportData.company.email && <p>✉️ {reportData.company.email}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right bg-white p-4 rounded-lg shadow-sm border">
                                <p className="text-xl font-bold text-blue-600">SERVİS RAPORU</p>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <p><span className="font-semibold">Rapor Tarihi:</span> {formatDate(new Date().toISOString())}</p>
                                    <p><span className="font-semibold">Servis No:</span> #{serviceId}</p>
                                    <p><span className="font-semibold">Müşteri:</span> {reportData.customer?.name}</p>
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
                                Servis Raporu
                            </h2>
                            <p className="text-gray-600">
                                Servis #{serviceId} - Detaylı Bilgiler
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg text-gray-600">Rapor yükleniyor...</div>
                        </div>
                    ) : !reportData ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg text-gray-600">Servis raporu bulunamadı.</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border border-gray-200 rounded-lg p-6">
                                {/* Service Record Info */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                            Servis Bilgileri
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Servis Tarihi:</span>
                                                <span className="text-sm font-medium">{formatDate(reportData.serviceRecord.serviceDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Açıklama:</span>
                                                <span className="text-sm font-medium text-right">{reportData.serviceRecord.description}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Toplam Maliyet:</span>
                                                <span className="text-sm font-medium">{formatCurrency(reportData.serviceRecord.totalCost)}</span>
                                            </div>
                                            {reportData.serviceRecord.currentKm && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Mevcut KM:</span>
                                                    <span className="text-sm font-medium">{reportData.serviceRecord.currentKm.toLocaleString('tr-TR')} km</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Car className="h-5 w-5 mr-2 text-green-600" />
                                            Araç ve Müşteri Bilgileri
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Araç:</span>
                                                <span className="text-sm font-medium">
                                                    {reportData.vehicle?.brand} {reportData.vehicle?.model} - {reportData.vehicle?.plateNo}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Müşteri:</span>
                                                <span className="text-sm font-medium">{reportData.customer?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Teknisyen:</span>
                                                <span className="text-sm font-medium">{reportData.technician?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Service Info */}
                                {reportData.upcomingService && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                                            Sonraki Servis Planı
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Planlanan Tarih:</span>
                                                <span className="text-sm font-medium">{formatDate(reportData.upcomingService.plannedDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Servis Tipi:</span>
                                                <span className="text-sm font-medium">{reportData.upcomingService.serviceType}</span>
                                            </div>
                                            {reportData.upcomingService.nextKm && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Sonraki KM:</span>
                                                    <span className="text-sm font-medium">{reportData.upcomingService.nextKm.toLocaleString('tr-TR')} km</span>
                                                </div>
                                            )}
                                            {reportData.upcomingService.notes && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Notlar:</span>
                                                    <span className="text-sm font-medium text-right">{reportData.upcomingService.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Service Components */}
                                {reportData.serviceComponents && reportData.serviceComponents.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Kullanılan Parçalar</h3>
                                        <div className="space-y-2">
                                            {reportData.serviceComponents.map((component, compIndex) => (
                                                <div key={compIndex} className="flex justify-between text-sm">
                                                    <span>{component.component?.name} x {component.quantity}</span>
                                                    <span>{formatCurrency(component.cost)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Labor Cost and Final Summary */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Maliyet Özeti</h3>
                                    <div className="space-y-2">
                                        {/* Parts Cost */}
                                        {reportData.serviceComponents && reportData.serviceComponents.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>Parça Maliyeti:</span>
                                                <span>{formatCurrency(reportData.serviceComponents.reduce((sum, component) => sum + component.cost, 0))}</span>
                                            </div>
                                        )}

                                        {/* Labor Cost - Calculate if not available */}
                                        <div className="flex justify-between text-sm">
                                            <span>İşçilik Maliyeti:</span>
                                            <span>
                                                {formatCurrency(
                                                    reportData.serviceRecord.laborCost ||
                                                    (reportData.serviceRecord.totalCost -
                                                        (reportData.serviceComponents?.reduce((sum, component) => sum + component.cost, 0) || 0))
                                                )}
                                            </span>
                                        </div>

                                        {/* Final Total */}
                                        <div className="flex justify-between text-base font-semibold border-t border-gray-300 pt-2 mt-2">
                                            <span>Toplam Maliyet:</span>
                                            <span>{formatCurrency(reportData.serviceRecord.totalCost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Footer */}
                {reportData?.company && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200 mt-8">
                        <div className="text-center text-sm text-gray-600">
                            <p>Bu rapor {reportData.company.name} tarafından otomatik olarak oluşturulmuştur.</p>
                            <p className="mt-1">Rapor Tarihi: {formatDate(new Date().toISOString())}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
