'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Car, Clock, MapPin, User, Edit } from 'lucide-react'
import EditUpcomingServiceModal from './EditUpcomingServiceModal'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function WeeklyPlanner() {
    const [upcomingServices, setUpcomingServices] = useState([])
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [editModal, setEditModal] = useState({
        isOpen: false,
        service: null
    })

    // Get the start and end of the current week
    const getWeekRange = (date) => {
        const start = new Date(date)
        start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1)) // Start from Monday

        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        return { start, end }
    }

    // Generate days of the week
    const getWeekDays = (startDate) => {
        const days = []
        const current = new Date(startDate)

        for (let i = 0; i < 7; i++) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }

        return days
    }

    const fetchUpcomingServices = async () => {
        try {
            setLoading(true)
            const { start, end } = getWeekRange(currentWeek)

            // Format dates as YYYY-MM-DD for the API
            const startDate = start.toISOString().split('T')[0]
            const endDate = end.toISOString().split('T')[0]

            const response = await fetch(
                `${API_BASE}/upcoming-services?startDate=${startDate}&endDate=${endDate}`
            )

            if (!response.ok) {
                throw new Error('Yaklaşan servisler yüklenirken hata oluştu')
            }

            const data = await response.json()
            // Handle both old array format and new paginated format
            setUpcomingServices(data.data || data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching upcoming services:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUpcomingServices()
    }, [currentWeek])

    const { start: weekStart, end: weekEnd } = getWeekRange(currentWeek)
    const weekDays = getWeekDays(weekStart)

    const navigateWeek = (direction) => {
        const newDate = new Date(currentWeek)
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        setCurrentWeek(newDate)
    }

    const goToToday = () => {
        setCurrentWeek(new Date())
    }

    const handleUpdateService = async (serviceId, updateData) => {
        try {
            const response = await fetch(`${API_BASE}/upcoming-services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            })

            if (!response.ok) {
                throw new Error('Servis güncellenirken hata oluştu')
            }

            // Refresh the list
            fetchUpcomingServices()
        } catch (err) {
            setError(err.message)
            console.error('Error updating service:', err)
        }
    }

    const openEditModal = (service) => {
        setEditModal({
            isOpen: true,
            service: service
        })
    }

    const closeEditModal = () => {
        setEditModal({
            isOpen: false,
            service: null
        })
    }

    const getServicesForDay = (day) => {
        return upcomingServices.filter(service => {
            const serviceDate = new Date(service.plannedDate)
            return serviceDate.toDateString() === day.toDateString()
        })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('tr-TR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const isToday = (date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'customer_arrived':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'no_show':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default: // scheduled
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed':
                return 'Onaylandı'
            case 'customer_arrived':
                return 'Müşteri Geldi'
            case 'no_show':
                return 'Gelmedi'
            case 'cancelled':
                return 'İptal'
            default: // scheduled
                return 'Planlandı'
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Haftalık Planlayıcı</h2>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Bugün
                            </button>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => navigateWeek('prev')}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-700 min-w-32 text-center">
                                    {weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} -{' '}
                                    {weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => navigateWeek('next')}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Weekly Calendar */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg text-gray-600">Planlayıcı yükleniyor...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-4">
                            {/* Day Headers */}
                            {weekDays.map((day, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-sm font-medium mb-2 ${isToday(day) ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                        {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
                                    </div>
                                    <div className={`text-lg font-semibold ${isToday(day)
                                        ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                                        : 'text-gray-900'
                                        }`}>
                                        {day.getDate()}
                                    </div>
                                </div>
                            ))}

                            {/* Day Columns */}
                            {weekDays.map((day, dayIndex) => {
                                const dayServices = getServicesForDay(day)

                                return (
                                    <div key={dayIndex} className="min-h-32 border border-gray-200 rounded-lg p-3">
                                        {dayServices.length === 0 ? (
                                            <div className="text-center text-gray-400 text-sm h-full flex items-center justify-center">
                                                Servis yok
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {dayServices.map((service, serviceIndex) => (
                                                    <div
                                                        key={serviceIndex}
                                                        className={`p-2 rounded-md border text-xs ${getStatusColor(service.status)}`}
                                                    >
                                                        <div className="font-medium mb-1 flex items-center justify-between">
                                                            <span className="truncate">{service.vehicle?.brand} {service.vehicle?.model}</span>
                                                            <Clock className="h-3 w-3 ml-1" />
                                                        </div>
                                                        <div className="text-xs opacity-75 mb-1 flex items-center justify-between">
                                                            <span>{formatTime(service.plannedDate)}</span>
                                                            {service.duration && (
                                                                <span className="text-xs bg-gray-100 px-1 rounded">
                                                                    {service.duration}dk
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs opacity-75 mb-1 truncate">
                                                            {service.serviceType}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium">
                                                                {getStatusText(service.status)}
                                                            </span>
                                                            {service.status !== 'customer_arrived' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        openEditModal(service)
                                                                    }}
                                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="text-xs opacity-75 mb-1 truncate">
                                                            {service.nextKm && (
                                                                <span className="text-xs opacity-75">
                                                                    {service.nextKm.toLocaleString('tr-TR')}km
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                            <span>Planlandı</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
                            <span>Onaylandı</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2"></div>
                            <span>Müşteri Geldi</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
                            <span>Gelmedi</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
                            <span>İptal</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditUpcomingServiceModal
                isOpen={editModal.isOpen}
                onClose={closeEditModal}
                onUpdate={(updateData) => handleUpdateService(editModal.service.id, updateData)}
                service={editModal.service}
            />
        </>
    )
}
