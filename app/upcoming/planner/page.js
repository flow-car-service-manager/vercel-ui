'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import WeeklyPlanner from '../../../components/WeeklyPlanner'

export default function WeeklyPlannerPage() {
  const router = useRouter()

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
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
              <h1 className="text-3xl font-bold text-gray-900">Haftalık Planlayıcı</h1>
              <p className="mt-2 text-gray-600">
                Yaklaşan servislerin haftalık görünümü
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/upcoming')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Liste Görünümü
          </button>
        </div>
      </div>

      {/* Weekly Planner Component */}
      <WeeklyPlanner />
    </div>
  )
}
