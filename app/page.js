'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Users, Car, Wrench, Calendar, Package, AlertTriangle, Clock, CheckCircle, XCircle, Car as CarIcon } from 'lucide-react'
import { useTranslation } from '../lib/i18n'
import { API_BASE } from '../lib/api'

export default function Dashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [stats, setStats] = useState({
    companies: 0,
    customers: 0,
    vehicles: 0,
    technicians: 0,
    activeServices: 0,
    upcomingServices: 0,
    lowStockAlerts: 0
  })
  const [recentServices, setRecentServices] = useState([])
  const [upcomingServices, setUpcomingServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/dashboard/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent services
      const servicesResponse = await fetch(`${API_BASE}/service-records?limit=100`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        // Handle both old array format and new paginated format
        const services = servicesData.data || servicesData
        // Get last 5 services, sorted by date
        const recent = services
          .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
          .slice(0, 5)
        setRecentServices(recent)
      }

      // Fetch upcoming services
      const upcomingResponse = await fetch(`${API_BASE}/upcoming-services?limit=100`)
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        // Handle both old array format and new paginated format
        const upcomingServices = upcomingData.data || upcomingData
        // Get upcoming services for today and next 7 days, sorted by date
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        
        const upcoming = upcomingServices
          .filter(service => {
            const serviceDate = new Date(service.plannedDate)
            return serviceDate >= today && serviceDate <= nextWeek
          })
          .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate))
          .slice(0, 5)
        setUpcomingServices(upcoming)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: t('dashboard.stats.customers'),
      value: stats.customers,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      path: '/customers'
    },
    {
      title: t('dashboard.stats.vehicles'),
      value: stats.vehicles,
      icon: Car,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      path: '/vehicles'
    },
    {
      title: t('dashboard.stats.technicians'),
      value: stats.technicians,
      icon: Wrench,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      path: '/technicians'
    },
    {
      title: t('dashboard.stats.activeServices'),
      value: stats.activeServices,
      icon: Wrench,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      path: '/services'
    },
    {
      title: t('dashboard.stats.upcomingServices'),
      value: stats.upcomingServices,
      icon: Calendar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      path: '/upcoming'
    },
    {
      title: t('dashboard.stats.lowStockAlerts'),
      value: stats.lowStockAlerts,
      icon: AlertTriangle,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      path: '/inventory'
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} ${t('dates.hoursAgo')}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} ${t('dates.dayAgo')}`
    }
  }

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((date - now) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('dates.today')
    if (diffInDays === 1) return t('dates.tomorrow')
    return `${diffInDays} ${t('dates.days')}`
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'customer_arrived':
        return 'bg-blue-100 text-blue-800'
      case 'no_show':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default: // scheduled
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'customer_arrived':
        return <CarIcon className="h-4 w-4" />
      case 'no_show':
        return <XCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default: // scheduled
        return <Clock className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('dashboard.welcomeMessage')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(stat.path)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd>
                      <div className={`text-lg font-semibold ${stat.textColor}`}>
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={() => router.push('/customers')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('dashboard.actions.addCustomer')}
          </button>
          <button 
            onClick={() => router.push('/vehicles')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Car className="h-4 w-4 mr-2" />
            {t('dashboard.actions.registerVehicle')}
          </button>
          <button 
            onClick={() => router.push('/services')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Wrench className="h-4 w-4 mr-2" />
            {t('dashboard.actions.createService')}
          </button>
          <button 
            onClick={() => router.push('/inventory')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Package className="h-4 w-4 mr-2" />
            {t('dashboard.actions.manageInventory')}
          </button>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Services */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentActivity')}</h2>
            {recentServices.length > 0 && (
              <button 
                onClick={() => router.push('/services')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t('common.viewAll')} →
              </button>
            )}
          </div>
          <div className="space-y-4">
            {recentServices.length > 0 ? (
              recentServices.map((service) => (
                <div 
                  key={service.id} 
                  className="flex items-center justify-between py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer rounded px-2"
                  onClick={() => router.push(`/services/${service.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {service.description || service.serviceType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.vehicle?.brand} {service.vehicle?.model} - {service.vehicle?.plateNo}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {getTimeAgo(service.serviceDate)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">{t('messages.noData')}</p>
            )}
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.upcomingServices')}</h2>
            <div className="flex items-center space-x-2">
              {upcomingServices.length > 0 && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Bu hafta
                </span>
              )}
              <button 
                onClick={() => router.push('/upcoming')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {t('common.viewAll')}
                <Calendar className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {upcomingServices.length > 0 ? (
              upcomingServices.map((service) => (
                <div 
                  key={service.id} 
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/upcoming?highlight=${service.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {service.vehicle?.brand} {service.vehicle?.model}
                        </span>
                        {service.vehicle?.plateNo && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                            {service.vehicle.plateNo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {service.serviceType}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{getStatusText(service.status)}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {getDaysUntil(service.plannedDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(service.plannedDate)}
                      </span>
                      {service.duration && (
                        <span className="flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          {service.duration}dk
                        </span>
                      )}
                      {service.nextKm && (
                        <span className="flex items-center">
                          <Car className="h-3 w-3 mr-1" />
                          {service.nextKm.toLocaleString('tr-TR')}km
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {service.vehicle?.customer && (
                        <span className="text-xs text-gray-600">
                          {service.vehicle.customer.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Bu hafta için servis bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}