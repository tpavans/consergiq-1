import React from 'react'
import { MapPin, Utensils, Sparkles, BedDouble, Calendar, CheckCircle2, Circle, ShieldCheck, Star } from 'lucide-react'

interface Activity {
  id?: number
  time: string
  name: string
  type: string // 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'LEISURE'
  status?: string
}

interface TimelineProps {
  activities?: Activity[]
  onToggleStatus?: (activityId: number, currentStatus: string) => void
}

export default function Timeline({ activities = [], onToggleStatus }: TimelineProps) {

  const getActivityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOTEL': return <BedDouble size={16} />
      case 'RESTAURANT': return <Utensils size={16} />
      case 'EVENT': return <Sparkles size={16} />
      case 'ATTRACTION': return <MapPin size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getThemeColors = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOTEL': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
      case 'RESTAURANT': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      case 'EVENT': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'ATTRACTION': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      default: return 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
    }
  }

  const defaultActivities: Activity[] = [
    { id: 1, time: '09:00 AM', name: 'Breakfast at Hotel Shelton Fine Dining', type: 'HOTEL', status: 'COMPLETED' },
    { id: 2, time: '10:30 AM', name: 'Godavari Arch Bridge & Pushkar Ghat Walk', type: 'ATTRACTION', status: 'COMPLETED' },
    { id: 3, time: '01:00 PM', name: 'Traditional Andhra Meals at Sri Kanya Comfort', type: 'RESTAURANT', status: 'PLANNED' },
    { id: 4, time: '03:30 PM', name: 'Kadiyapulanka Flora Nursery Tour', type: 'ATTRACTION', status: 'PLANNED' },
    { id: 5, time: '06:30 PM', name: 'Godavari River Sunset Boat Cruise', type: 'EVENT', status: 'PLANNED' },
    { id: 6, time: '08:30 PM', name: 'Movie at Sree Satyadeva Multiplex', type: 'EVENT', status: 'PLANNED' }
  ]

  const items = activities.length > 0 ? activities : defaultActivities

  // Calculate To-Do Progress Percentage
  const completedCount = items.filter(a => (a.status || 'PLANNED').toUpperCase() === 'COMPLETED').length
  const progressPercent = Math.round((completedCount / (items.length || 1)) * 100)

  return (
    <div className="flex flex-col gap-5">
      {/* Real-time To-Do List Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-xl p-4 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-500" />
            To-Do Itinerary Progress
          </span>
          <span className="font-extrabold text-indigo-600 dark:text-brand-400">
            {completedCount} of {items.length} Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Hourly Timeline List */}
      <div className="relative border-l-2 border-indigo-100 dark:border-zinc-800 ml-4 pl-6 space-y-6 py-1">
        {items.map((activity, index) => {
          const actId = activity.id || (activity as any).id || (index + 1)
          const name = activity.name || (activity as any).activityName || 'Activity'
          const time = activity.time || (activity as any).scheduledTime || '12:00 PM'
          const type = activity.type || (activity as any).activityType || 'ATTRACTION'
          const status = (activity.status || (activity as any).status || 'PLANNED').toUpperCase()
          const isCompleted = status === 'COMPLETED'

          return (
            <div key={index} className="relative group">
              {/* Bullet Pin */}
              <div className={`absolute left-[-35px] top-2 p-2 rounded-full border-2 border-white dark:border-darkBg shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${getThemeColors(type)}`}>
                {getActivityIcon(type)}
              </div>

              {/* Time & Title Container */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border ${
                isCompleted 
                  ? 'border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10' 
                  : 'border-gray-200 dark:border-darkBorder'
              } p-4 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
                
                <div className="flex items-start gap-3">
                  {/* Interactive Checkbox Button */}
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(actId, status)}
                    className="mt-0.5 text-gray-300 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400 transition-colors"
                    title={isCompleted ? "Mark as Planned" : "Mark as Completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-brand-400 tracking-wider">
                        {time}
                      </span>
                      {type.toUpperCase() === 'HOTEL' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck size={11} /> 9.8 Safety Score
                        </span>
                      )}
                      {type.toUpperCase() === 'RESTAURANT' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> 4.9★ Top Rated
                        </span>
                      )}
                    </div>
                    <h4 className={`font-bold text-sm ${
                      isCompleted 
                        ? 'line-through text-gray-400 dark:text-gray-500' 
                        : 'text-gray-800 dark:text-gray-100'
                    }`}>
                      {name}
                    </h4>
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-gray-400">
                      {type.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 items-center self-end sm:self-center">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(actId, status)}
                    className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-zinc-800 dark:text-indigo-300 dark:border-zinc-700 hover:bg-indigo-100'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Done'}
                  </button>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
