'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Seleccionar fecha",
  disabled = false
}: DatePickerProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value
    if (dateValue) {
      onSelect?.(new Date(dateValue))
    } else {
      onSelect?.(undefined)
    }
  }

  return (
    <div className="relative">
      <Input
        type="date"
        value={selected ? format(selected, 'yyyy-MM-dd') : ''}
        onChange={handleDateChange}
        disabled={disabled}
        className="pl-10"
        min={format(new Date(), 'yyyy-MM-dd')}
      />
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  )
}