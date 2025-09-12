"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserDataManager } from "@/lib/user-data"
import { toast } from "@/components/ui/use-toast"

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

interface PomodoroTimerProps {
  config: PomodoroConfig
  onConfigOpen: () => void
  isFocusMode?: boolean
}

export function PomodoroTimer({ config, onConfigOpen, isFocusMode = false }: PomodoroTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [state, setState] = useState<"idle" | "running" | "paused">("idle")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate total seconds from time config
  const getTotalSeconds = (timeConfig: TimeConfig) => {
    return timeConfig.hours * 3600 + timeConfig.minutes * 60 + timeConfig.seconds
  }

  // Initialize timer with current mode's time
  useEffect(() => {
    const currentConfig = mode === "focus" ? config.focusTime : config.breakTime
    setTimeLeft(getTotalSeconds(currentConfig))
  }, [mode, config])

  // Save completed pomodoro session to database
  const saveCompletedSession = async (sessionMode: "focus" | "break", duration: number) => {
    try {
      const session = await UserDataManager.addPomodoroSession(sessionMode, duration)
      if (session) {
        toast({
          title: "Sesión completada",
          description: `Sesión de ${sessionMode === "focus" ? "concentración" : "descanso"} de ${Math.round(duration / 60)} minutos guardada`
        })
      }
    } catch (error) {
      console.error('Error saving pomodoro session:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sesión",
        variant: "destructive"
      })
    }
  }

  // Timer countdown logic
  useEffect(() => {
    if (state === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState("idle")

            // Calculate session duration and save it
            if (sessionStartTime) {
              const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
              saveCompletedSession(mode, sessionDuration)
            }

            // Switch modes with flip animation
            setIsFlipping(true)
            setTimeout(() => {
              setMode((prevMode) => (prevMode === "focus" ? "break" : "focus"))
              setIsFlipping(false)
              setSessionStartTime(null)
            }, 400)

            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, timeLeft, mode, sessionStartTime])

  const handleStart = () => {
    setState("running")
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
  }

  const handlePause = () => {
    setState("paused")
  }

  const handleReset = () => {
    setState("idle")
    setSessionStartTime(null)
    const currentConfig = mode === "focus" ? config.focusTime : config.breakTime
    setTimeLeft(getTotalSeconds(currentConfig))
  }

  const handleModeToggle = () => {
    if (state === "running") return
    setSessionStartTime(null)
    setIsFlipping(true)
    setTimeout(() => {
      setMode((prev) => (prev === "focus" ? "break" : "focus"))
      setIsFlipping(false)
    }, 400)
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentColor = mode === "focus" ? config.colors.focusColor : config.colors.breakColor

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4">
      {!isFocusMode && (
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-light text-foreground/80"></h2>
        </div>
      )}

      {/* Indicador de modo - Responsivo */}
      <div className="flex items-center space-x-2 mb-2 sm:mb-4">
        <div
          className={cn("w-2 h-2 rounded-full transition-all duration-500", `shadow-lg`)}
          style={{
            backgroundColor: currentColor,
            boxShadow: `0 0 20px ${currentColor}50`,
          }}
        />
        <span className="text-xs sm:text-sm font-light text-foreground/60 uppercase tracking-wider">
          {mode === "focus" ? "Focus" : "Break"}
        </span>
      </div>

      {/* Temporizador principal - Altamente responsivo */}
      <div className="perspective-1000">
        <div
          className={cn(
            "relative transition-transform duration-800 transform-style-preserve-3d",
            isFlipping && "rotate-y-180",
          )}
        >
          {/* Front face */}
          <div className="backface-hidden">
            <div className="text-center space-y-4 sm:space-y-6">
              <div
                className={cn(
                  "font-mono font-light transition-all duration-300 px-2",
                  isFocusMode
                    ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                    : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                )}
                style={{ color: currentColor }}
              >
                <div className="mobile-timer-text leading-none">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {!isFocusMode && (
                <div className="text-xs text-foreground/40 uppercase tracking-widest font-light">
                  {state === "running" ? "Running" : state === "paused" ? "Paused" : "Ready"}
                </div>
              )}
            </div>
          </div>

          {/* Back face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="text-center space-y-4 sm:space-y-6">
              <div
                className={cn(
                  "font-mono font-light transition-all duration-300 px-2",
                  isFocusMode
                    ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                    : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                )}
                style={{ color: currentColor }}
              >
                <div className="mobile-timer-text leading-none">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {!isFocusMode && (
                <div className="text-xs text-foreground/40 uppercase tracking-widest font-light">
                  {state === "running" ? "Running" : state === "paused" ? "Paused" : "Ready"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controles - Optimizados para móviles */}
      <div className="flex items-center space-x-2 sm:space-x-3 mt-6 sm:mt-8">
        {state === "idle" || state === "paused" ? (
          <Button
            onClick={handleStart}
            variant="ghost"
            size="sm"
            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-foreground/5 transition-all duration-200 mobile-tap-area"
          >
            <Play className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="ghost"
            size="sm"
            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-foreground/5 transition-all duration-200 mobile-tap-area"
          >
            <Pause className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-foreground/5 transition-all duration-200 mobile-tap-area"
        >
          <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>

        {!isFocusMode && (
          <Button
            onClick={handleModeToggle}
            disabled={state === "running"}
            variant="ghost"
            size="sm"
            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-foreground/5 transition-all duration-200 disabled:opacity-30 mobile-tap-area"
          >
            {mode === "focus" ? (
              <Coffee className="h-5 w-5 sm:h-4 sm:w-4" />
            ) : (
              <Brain className="h-5 w-5 sm:h-4 sm:w-4" />
            )}
          </Button>
        )}

        {!isFocusMode && (
          <Button
            onClick={onConfigOpen}
            variant="ghost"
            size="sm"
            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-foreground/5 transition-all duration-200 mobile-tap-area"
          >
            <Settings className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* CSS específico para móviles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-timer-text {
            font-size: clamp(2.5rem, 12vw, 4rem) !important;
            line-height: 0.9;
          }
          
          .mobile-tap-area {
            min-height: 48px;
            min-width: 48px;
          }
        }

        @media (max-width: 375px) {
          .mobile-timer-text {
            font-size: clamp(2rem, 10vw, 3rem) !important;
            line-height: 0.9;
          }
        }
      `}</style>
    </div>
  )
}