"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserDataManager } from "@/lib/user-data"
import { AuthService } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

interface PomodoroStats {
  totalSessions: number
  focusSessions: number
  breakSessions: number
  todayPomodoros: number
  totalFocusMinutes: number
  totalBreakMinutes: number
}

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
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    focusSessions: 0,
    breakSessions: 0,
    todayPomodoros: 0,
    totalFocusMinutes: 0,
    totalBreakMinutes: 0
  })
  const [showStats, setShowStats] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar tiempo cuando cambia la configuración o el modo
  useEffect(() => {
    const timeConfig = mode === "focus" ? config.focusTime : config.breakTime
    const newTimeLeft = timeConfig.hours * 3600 + timeConfig.minutes * 60 + timeConfig.seconds
    setTimeLeft(newTimeLeft)
  }, [config, mode])

  const loadStats = useCallback(async () => {
    try {
      const sessions = await UserDataManager.getPomodoroSessions()

      const focusSessions = sessions.filter(s => s.type === 'focus')
      const breakSessions = sessions.filter(s => s.type === 'break')

      const today = new Date().toDateString()
      const todaySessions = sessions.filter(s =>
        new Date(s.completedAt).toDateString() === today
      )

      // CONTAR POMODOROS CORRECTAMENTE (1 pomodoro = 1 focus + 1 break completos)
      let pomodoroCount = 0
      const todayFocusSessions = todaySessions.filter(s => s.type === 'focus')
      const todayBreakSessions = todaySessions.filter(s => s.type === 'break')

      // Un pomodoro completo requiere al menos una sesión de focus y una de break
      pomodoroCount = Math.min(todayFocusSessions.length, todayBreakSessions.length)

      // Calcular minutos de FOCUS y BREAK por separado
      const totalFocusMinutes = Math.round(
        focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
      )

      const totalBreakMinutes = Math.round(
        breakSessions.reduce((acc, s) => acc + s.duration, 0) / 60
      )

      setStats({
        totalSessions: sessions.length,
        focusSessions: focusSessions.length,
        breakSessions: breakSessions.length,
        todayPomodoros: pomodoroCount,
        totalFocusMinutes: totalFocusMinutes,
        totalBreakMinutes: totalBreakMinutes
      })
    } catch (error) {
      console.error('Error loading Pomodoro stats:', error)
    }
  }, [])

  useEffect(() => {
    if (!isFocusMode) {
      loadStats()
    }
  }, [loadStats, isFocusMode])

  const playNotificationSound = (type: "focus" | "break") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (type === "focus") {
        const frequencies = [800, 600, 500]
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          const startTime = audioContext.currentTime + (index * 0.15)
          oscillator.frequency.setValueAtTime(freq, startTime)

          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

          oscillator.start(startTime)
          oscillator.stop(startTime + 0.4)
        })
      } else {
        const frequencies = [400, 600, 800]
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          const startTime = audioContext.currentTime + (index * 0.12)
          oscillator.frequency.setValueAtTime(freq, startTime)

          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35)

          oscillator.start(startTime)
          oscillator.stop(startTime + 0.35)
        })
      }
    } catch (error) {
      console.log('No se pudo reproducir el sonido de notificación:', error)
    }
  }

  const getTotalSeconds = (timeConfig: TimeConfig) => {
    return timeConfig.hours * 3600 + timeConfig.minutes * 60 + timeConfig.seconds
  }

  const saveCompletedSession = async (sessionMode: "focus" | "break", duration: number) => {
    try {
      // Aumentar el mínimo a 30 segundos para evitar sesiones muy cortas
      if (duration < 30) {
        console.log('Sesión muy corta, no se guardará:', duration);
        return;
      }

      console.log(`🔥 GUARDANDO ${sessionMode.toUpperCase()}:`, {
        mode: sessionMode,
        duration: Math.round(duration),
        durationMinutes: (duration / 60).toFixed(1)
      });

      const token = AuthService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
      }

      const session = await UserDataManager.addPomodoroSession(sessionMode, Math.round(duration));

      if (session) {
        const minutes = Math.round(duration / 60);
        const sessionType = sessionMode === "focus" ? "concentración" : "descanso";

        toast({
          title: "✅ Sesión completada",
          description: `${sessionType} de ${minutes}min guardada`,
          duration: 3000
        });

        console.log(`✅ ${sessionMode.toUpperCase()} guardado:`, {
          id: session.id,
          type: session.type,
          duration: session.duration
        });

        // Recargar estadísticas inmediatamente
        loadStats()
      }
    } catch (error) {
      console.error(`❌ Error guardando ${sessionMode}:`, error);

      toast({
        title: "❌ Error al guardar sesión",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Timer principal
  useEffect(() => {
    if (state === "running") {
      if (timeLeft > 0) {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => prev - 1)
        }, 1000)
      } else {
        // Tiempo terminado
        setState("idle")
        playNotificationSound(mode)

        // Calcular duración real
        let duration = 0;
        if (sessionStartTime) {
          duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        } else {
          const timeConfig = mode === "focus" ? config.focusTime : config.breakTime
          duration = getTotalSeconds(timeConfig)
        }

        console.log(`⏰ TERMINÓ ${mode.toUpperCase()}, guardando ${duration}s`)

        // GUARDAR LA SESIÓN QUE TERMINÓ
        saveCompletedSession(mode, duration)

        // Cambiar de modo
        const nextMode = mode === "focus" ? "break" : "focus"
        const currentModeText = mode === "focus" ? "concentración" : "descanso"
        const nextModeText = nextMode === "focus" ? "concentración" : "descanso"

        toast({
          title: `¡${currentModeText} completada!`,
          description: `Cambiando a ${nextModeText}`,
          duration: 5000
        })

        setIsFlipping(true)
        setTimeout(() => {
          setMode(nextMode)
          setIsFlipping(false)
          setSessionStartTime(null)
        }, 400)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state, timeLeft, mode, sessionStartTime, config])

  const handleStart = () => {
    setState("running")
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
      console.log(`🚀 INICIANDO ${mode.toUpperCase()}`)
    }
  }

  const handlePause = () => {
    setState("paused")
  }

  const handleReset = () => {
    setState("idle")
    setSessionStartTime(null)
    const timeConfig = mode === "focus" ? config.focusTime : config.breakTime
    setTimeLeft(getTotalSeconds(timeConfig))
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

  const StatsPanel = () => (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-light text-foreground/60 uppercase tracking-wider">
          Estadísticas
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowStats(!showStats)}
          className="text-xs h-6 px-2"
        >
          {showStats ? 'Ocultar' : 'Ver'}
        </Button>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-card/50 rounded-lg p-3 border border-border/30">
            <div className="text-lg font-mono" style={{ color: currentColor }}>
              {stats.todayPomodoros}
            </div>
            <div className="text-xs text-foreground/60">Pomodoros Hoy</div>
            <div className="text-[10px] text-foreground/40 mt-1">
              (focus + break)
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/30">
            <div className="text-lg font-mono text-foreground">
              {stats.totalFocusMinutes + stats.totalBreakMinutes}m
            </div>
            <div className="text-xs text-foreground/60">Minutos Totales</div>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/30">
            <div
              className="text-lg font-mono"
              style={{ color: config.colors.focusColor }}
            >
              {stats.focusSessions}
            </div>
            <div className="text-xs text-foreground/60">Sesiones Focus</div>
            <div className="text-[10px] text-foreground/40">
              {stats.totalFocusMinutes}m
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/30">
            <div
              className="text-lg font-mono"
              style={{ color: config.colors.breakColor }}
            >
              {stats.breakSessions}
            </div>
            <div className="text-xs text-foreground/60">Sesiones Break</div>
            <div className="text-[10px] text-foreground/40">
              {stats.totalBreakMinutes}m
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4">
      {!isFocusMode && (
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-light text-foreground/80"></h2>
        </div>
      )}

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

      <div className="perspective-1000">
        <div
          className={cn(
            "relative transition-transform duration-800 transform-style-preserve-3d",
            isFlipping && "rotate-y-180",
          )}
        >
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

      {!isFocusMode && <StatsPanel />}

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