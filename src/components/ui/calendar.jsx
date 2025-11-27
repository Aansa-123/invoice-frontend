import React, { useState } from 'react'
import { cn } from './lib/utils'
import { Button } from './button'

function Calendar({ className, selected, onSelect, ...props }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const days = []
  const current = new Date(startDate)

  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    if (!selected) return false
    if (Array.isArray(selected)) {
      return selected.some(sel => sel.toDateString() === date.toDateString())
    }
    return selected.toDateString() === date.toDateString()
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === month
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <div className={cn('p-4 bg-white border border-gray-200 rounded-lg shadow-sm', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          ‹
        </Button>
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          ›
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <Button
            key={index}
            variant={isSelected(date) ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-8 w-8 p-0 text-sm',
              !isCurrentMonth(date) && 'text-gray-400',
              isToday(date) && !isSelected(date) && 'bg-blue-100 text-blue-600',
              isSelected(date) && 'bg-blue-500 text-white hover:bg-blue-600'
            )}
            onClick={() => handleDateClick(date)}
          >
            {date.getDate()}
          </Button>
        ))}
      </div>
    </div>
  )
}

export { Calendar }
