"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Brain, Coffee, Palette } from "lucide-react"

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
  const [tempConfig, setTempConfig] = useState<PomodoroConfig>(config)

  const handleTimeChange = (mode: "focusTime" | "breakTime", unit: "hours" | "minutes" | "seconds", value: string) => {
    const numValue = Math.max(0, Math.min(Number.parseInt(value) || 0, unit === "hours" ? 23 : 59))
    setTempConfig((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [unit]: numValue,
      },
    }))
  }

  const handleColorChange = (mode: "focusColor" | "breakColor", color: string) => {
    setTempConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [mode]: color,
      },
    }))
  }

  const handleSave = () => {
    onConfigChange(tempConfig)
    onClose()
  }

  const handleCancel = () => {
    setTempConfig(config)
    onClose()
  }

  const TimeInput = ({
    mode,
    unit,
    value,
    max,
  }: {
    mode: "focusTime" | "breakTime"
    unit: "hours" | "minutes" | "seconds"
    value: number
    max: number
  }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs text-foreground/50 uppercase tracking-wide font-light">
        {unit === "hours" ? "H" : unit === "minutes" ? "M" : "S"}
      </div>
      <Input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(e) => handleTimeChange(mode, unit, e.target.value)}
        className="w-14 h-12 text-center text-lg font-mono bg-transparent border-foreground/10 focus:border-foreground/30 rounded-lg"
      />
    </div>
  )

  const colorOptions = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background border-foreground/10">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-center text-lg font-light text-foreground">Configurar Pomodoro</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Palette className="w-4 h-4 text-foreground/60" />
              <span className="text-sm font-light text-foreground/70">Colores del Temporizador</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-3 h-3" style={{ color: tempConfig.colors.focusColor }} />
                  <span className="text-xs font-light text-foreground/60">Concentración</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={`focus-${color}`}
                      onClick={() => handleColorChange("focusColor", color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        tempConfig.colors.focusColor === color
                          ? "border-foreground/40 scale-110"
                          : "border-foreground/10 hover:border-foreground/20"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Coffee className="w-3 h-3" style={{ color: tempConfig.colors.breakColor }} />
                  <span className="text-xs font-light text-foreground/60">Descanso</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={`break-${color}`}
                      onClick={() => handleColorChange("breakColor", color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        tempConfig.colors.breakColor === color
                          ? "border-foreground/40 scale-110"
                          : "border-foreground/10 hover:border-foreground/20"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-4 h-4" style={{ color: tempConfig.colors.focusColor }} />
              <span className="text-sm font-light text-foreground/70">Concentración</span>
            </div>
            <div className="flex justify-center items-end space-x-4">
              <TimeInput mode="focusTime" unit="hours" value={tempConfig.focusTime.hours} max={23} />
              <div className="text-foreground/30 font-mono text-lg pb-3">:</div>
              <TimeInput mode="focusTime" unit="minutes" value={tempConfig.focusTime.minutes} max={59} />
              <div className="text-foreground/30 font-mono text-lg pb-3">:</div>
              <TimeInput mode="focusTime" unit="seconds" value={tempConfig.focusTime.seconds} max={59} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coffee className="w-4 h-4" style={{ color: tempConfig.colors.breakColor }} />
              <span className="text-sm font-light text-foreground/70">Descanso</span>
            </div>
            <div className="flex justify-center items-end space-x-4">
              <TimeInput mode="breakTime" unit="hours" value={tempConfig.breakTime.hours} max={23} />
              <div className="text-foreground/30 font-mono text-lg pb-3">:</div>
              <TimeInput mode="breakTime" unit="minutes" value={tempConfig.breakTime.minutes} max={59} />
              <div className="text-foreground/30 font-mono text-lg pb-3">:</div>
              <TimeInput mode="breakTime" unit="seconds" value={tempConfig.breakTime.seconds} max={59} />
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 h-10 border border-foreground/10 hover:bg-foreground/5 bg-transparent rounded-lg font-light"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-light"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
