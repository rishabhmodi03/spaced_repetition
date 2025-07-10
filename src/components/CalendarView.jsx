import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 7)) // July 2025
  const [selectedDate, setSelectedDate] = useState(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Mock revision data
  const revisionDates = {
    '2025-07-08': [{ topic: 'Interest rate risk management', time: 'July 8th' }],
    '2025-07-09': [{ topic: 'Portfolio management', time: 'July 9th' }],
    '2025-07-10': [{ topic: 'CFA Level 1', time: 'July 10th' }],
    '2025-07-14': [{ topic: 'Advanced Finance', time: 'July 14th' }],
    '2025-07-15': [{ topic: 'Risk Management', time: 'July 15th' }],
    '2025-07-17': [{ topic: 'Investment Analysis', time: 'July 17th' }],
    '2025-07-22': [{ topic: 'Financial Modeling', time: 'July 22nd' }],
    '2025-07-23': [{ topic: 'Corporate Finance', time: 'July 23rd' }],
    '2025-07-27': [{ topic: 'Derivatives', time: 'July 27th' }],
    '2025-07-30': [{ topic: 'Fixed Income', time: 'July 30th' }],
    '2025-07-31': [{ topic: 'Equity Analysis', time: 'July 31st' }]
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${prevMonthDays - i}`} className="p-2 text-gray-600 text-center">
          {prevMonthDays - i}
        </div>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
      const hasRevision = revisionDates[dateKey]
      const isToday = day === 7 // July 7th is today
      
      days.push(
        <div
          key={day}
          className={`p-2 text-center cursor-pointer relative ${
            isToday ? 'bg-purple-600 text-white rounded-full' : 'text-white hover:bg-gray-800 rounded'
          }`}
          onClick={() => hasRevision && setSelectedDate({ date: dateKey, revisions: hasRevision })}
        >
          {day}
          {hasRevision && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  if (selectedDate) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(null)}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-xl font-semibold">Revisions</h2>
          <div></div>
        </div>

        <div className="space-y-4">
          {selectedDate.revisions.map((revision, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg p-4 border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{revision.topic}</h3>
                  <p className="text-gray-400 text-sm">{revision.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth(-1)}
          className="text-white hover:bg-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth(1)}
          className="text-white hover:bg-gray-800"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  )
}

export default CalendarView

