"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Brain, Coffee, Plus, Minus } from "lucide-react"

interface TimeConfig {
  hours: number
  minutes: number
  seconds: number
}

interface ColorConfig {
  focusColor: string
  breakColor: string
}

interface PomodoroConfig {
  focusTime: TimeConfig
  breakTime: TimeConfig
  colors: ColorConfig
}

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  config: PomodoroConfig
  onConfigChange: (config: PomodoroConfig) => void
}

export function ConfigModal({ isOpen, onClose, config, onConfigChange }: ConfigModalProps) {
  const [localConfig, setLocalConfig] = useState({
    focusHours: 0,
    focusMinutes: 25,
    focusSeconds: 0,
    breakHours: 0,
    breakMinutes: 5,
    breakSeconds: 0,
    focusColor: "#3b82f6",
    breakColor: "#10b981"
  })

  useEffect(() => {
    if (isOpen) {
      setLocalConfig({
        focusHours: config.focusTime.hours,
        focusMinutes: config.focusTime.minutes,
        focusSeconds: config.focusTime.seconds,
        breakHours: config.breakTime.hours,
        breakMinutes: config.breakTime.minutes,
        breakSeconds: config.breakTime.seconds,
        focusColor: config.colors.focusColor,
        breakColor: config.colors.breakColor
      })
    }
  }, [isOpen, config])

  const incrementValue = (field: string, max: number) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: Math.min((prev[field as keyof typeof prev] as number) + 1, max)
    }))
  }

  const decrementValue = (field: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: Math.max((prev[field as keyof typeof prev] as number) - 1, 0)
    }))
  }

  const setDirectValue = (field: string, value: string, max: number) => {
    const numValue = Math.min(Math.max(parseInt(value) || 0, 0), max)
    setLocalConfig(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  const setColor = (field: string, color: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: color
    }))
  }

  const handleSave = () => {
    const newConfig: PomodoroConfig = {
      focusTime: {
        hours: localConfig.focusHours,
        minutes: localConfig.focusMinutes,
        seconds: localConfig.focusSeconds
      },
      breakTime: {
        hours: localConfig.breakHours,
        minutes: localConfig.breakMinutes,
        seconds: localConfig.breakSeconds
      },
      colors: {
        focusColor: localConfig.focusColor,
        breakColor: localConfig.breakColor
      }
    }
    onConfigChange(newConfig)
    onClose()
  }

  const colorOptions = [
    "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
    "#ef4444", "#f97316", "#06b6d4", "#84cc16"
  ]

  const TimeSelector = ({
    value,
    onIncrement,
    onDecrement,
    onDirectChange,
    label,
    max
  }: {
    value: number
    onIncrement: () => void
    onDecrement: () => void
    onDirectChange: (value: string) => void
    label: string
    max: number
  }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs text-foreground/50 uppercase tracking-wide font-light">
        {label}
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Button
          onClick={onIncrement}
          variant="ghost"
          size="sm"
          className="h-5 w-8 p-0 hover:bg-foreground/10 rounded text-xs"
          type="button"
        >
          <Plus className="h-3 w-3" />
        </Button>
        <input
          type="text"
          inputMode="numeric"
          value={value.toString().padStart(2, '0')}
          onChange={(e) => onDirectChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => {
            const val = parseInt(e.target.value) || 0
            if (val > max) onDirectChange(max.toString())
          }}
          maxLength={2}
          className="w-12 h-8 text-center text-sm font-mono bg-foreground/5 border border-foreground/10 focus:border-foreground/30 rounded focus:outline-none"
        />
        <Button
          onClick={onDecrement}
          variant="ghost"
          size="sm"
          className="h-5 w-8 p-0 hover:bg-foreground/10 rounded text-xs"
          type="button"
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )

  const QuickTimeButtons = ({
    onSetTime,
    mode
  }: {
    onSetTime: (hours: number, minutes: number, seconds: number) => void
    mode: 'focus' | 'break'
  }) => {
    const presets = mode === 'focus'
      ? [
        { label: '15m', h: 0, m: 15, s: 0 },
        { label: '25m', h: 0, m: 25, s: 0 },
        { label: '45m', h: 0, m: 45, s: 0 },
        { label: '1h', h: 1, m: 0, s: 0 }
      ]
      : [
        { label: '5m', h: 0, m: 5, s: 0 },
        { label: '10m', h: 0, m: 10, s: 0 },
        { label: '15m', h: 0, m: 15, s: 0 },
        { label: '30m', h: 0, m: 30, s: 0 }
      ]

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            onClick={() => onSetTime(preset.h, preset.m, preset.s)}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs border border-foreground/20 hover:bg-foreground/10 rounded-full"
            type="button"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-background border-foreground/10 mx-4 sm:mx-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-lg font-light text-foreground">
            Configurar Pomodoro
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-foreground/60">
            Personaliza los tiempos y colores para tus sesiones de trabajo y descanso
          </DialogDescription>
        </DialogHeader>

        {/* Layout lado a lado para móviles y desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pr-1">
          {/* CONCENTRACIÓN */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 pb-2 border-b border-foreground/10">
              <Brain className="w-4 h-4" style={{ color: localConfig.focusColor }} />
              <span className="text-sm font-light text-foreground/70">Concentración</span>
            </div>

            {/* Colores */}
            <div className="space-y-3">
              <div className="text-xs font-light text-foreground/60 text-center">
                Color del temporizador
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {colorOptions.map((color) => (
                  <button
                    key={`focus-${color}`}
                    onClick={() => setColor('focusColor', color)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${localConfig.focusColor === color
                        ? "border-foreground/40 scale-110"
                        : "border-foreground/10 hover:border-foreground/20"
                      }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            {/* Presets rápidos */}
            <div className="space-y-2">
              <div className="text-xs font-light text-foreground/60 text-center">
                Tiempos comunes
              </div>
              <QuickTimeButtons
                onSetTime={(h, m, s) => setLocalConfig(prev => ({
                  ...prev,
                  focusHours: h,
                  focusMinutes: m,
                  focusSeconds: s
                }))}
                mode="focus"
              />
            </div>

            {/* Tiempo con botones e inputs */}
            <div className="flex justify-center items-center space-x-3">
              <TimeSelector
                value={localConfig.focusHours}
                onIncrement={() => incrementValue('focusHours', 23)}
                onDecrement={() => decrementValue('focusHours')}
                onDirectChange={(value) => setDirectValue('focusHours', value, 23)}
                label="H"
                max={23}
              />
              <div className="text-foreground/30 font-mono text-sm pt-4">:</div>
              <TimeSelector
                value={localConfig.focusMinutes}
                onIncrement={() => incrementValue('focusMinutes', 59)}
                onDecrement={() => decrementValue('focusMinutes')}
                onDirectChange={(value) => setDirectValue('focusMinutes', value, 59)}
                label="M"
                max={59}
              />
              <div className="text-foreground/30 font-mono text-sm pt-4">:</div>
              <TimeSelector
                value={localConfig.focusSeconds}
                onIncrement={() => incrementValue('focusSeconds', 59)}
                onDecrement={() => decrementValue('focusSeconds')}
                onDirectChange={(value) => setDirectValue('focusSeconds', value, 59)}
                label="S"
                max={59}
              />
            </div>
          </div>

          {/* DESCANSO */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 pb-2 border-b border-foreground/10">
              <Coffee className="w-4 h-4" style={{ color: localConfig.breakColor }} />
              <span className="text-sm font-light text-foreground/70">Descanso</span>
            </div>

            {/* Colores */}
            <div className="space-y-3">
              <div className="text-xs font-light text-foreground/60 text-center">
                Color del temporizador
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {colorOptions.map((color) => (
                  <button
                    key={`break-${color}`}
                    onClick={() => setColor('breakColor', color)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${localConfig.breakColor === color
                        ? "border-foreground/40 scale-110"
                        : "border-foreground/10 hover:border-foreground/20"
                      }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            {/* Presets rápidos */}
            <div className="space-y-2">
              <div className="text-xs font-light text-foreground/60 text-center">
                Tiempos comunes
              </div>
              <QuickTimeButtons
                onSetTime={(h, m, s) => setLocalConfig(prev => ({
                  ...prev,
                  breakHours: h,
                  breakMinutes: m,
                  breakSeconds: s
                }))}
                mode="break"
              />
            </div>

            {/* Tiempo con botones e inputs */}
            <div className="flex justify-center items-center space-x-3">
              <TimeSelector
                value={localConfig.breakHours}
                onIncrement={() => incrementValue('breakHours', 23)}
                onDecrement={() => decrementValue('breakHours')}
                onDirectChange={(value) => setDirectValue('breakHours', value, 23)}
                label="H"
                max={23}
              />
              <div className="text-foreground/30 font-mono text-sm pt-4">:</div>
              <TimeSelector
                value={localConfig.breakMinutes}
                onIncrement={() => incrementValue('breakMinutes', 59)}
                onDecrement={() => decrementValue('breakMinutes')}
                onDirectChange={(value) => setDirectValue('breakMinutes', value, 59)}
                label="M"
                max={59}
              />
              <div className="text-foreground/30 font-mono text-sm pt-4">:</div>
              <TimeSelector
                value={localConfig.breakSeconds}
                onIncrement={() => incrementValue('breakSeconds', 59)}
                onDecrement={() => decrementValue('breakSeconds')}
                onDirectChange={(value) => setDirectValue('breakSeconds', value, 59)}
                label="S"
                max={59}
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-foreground/10">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 border border-foreground/10 hover:bg-foreground/5 bg-transparent rounded-lg font-light order-2 sm:order-1"
            type="button"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-light order-1 sm:order-2"
            type="button"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}