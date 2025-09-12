"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Type } from "lucide-react"

type FontStyle = "mono" | "sans" | "serif" | "display" | "condensed"

const fontStyles = {
  mono: "font-mono",
  sans: "font-sans",
  serif: "font-serif",
  display: "font-sans font-black tracking-tight",
  condensed: "font-sans font-semibold tracking-tighter",
}

const fontNames = {
  mono: "Monospace",
  sans: "Sans Serif",
  serif: "Serif",
  display: "Display",
  condensed: "Condensed",
}

interface DigitalClockProps {
  isFocusMode?: boolean
}

export function DigitalClock({ isFocusMode = false }: DigitalClockProps) {
  const [time, setTime] = useState(new Date())
  const [fontStyle, setFontStyle] = useState<FontStyle>("mono")

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const cycleFontStyle = () => {
    const styles: FontStyle[] = ["mono", "sans", "serif", "display", "condensed"]
    const currentIndex = styles.indexOf(fontStyle)
    const nextIndex = (currentIndex + 1) % styles.length
    setFontStyle(styles[nextIndex])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTimezone = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const parts = timezone.split("/")
    if (parts.length >= 2) {
      return `${parts[1].replace("_", " ")}, ${parts[0]}`
    }
    return timezone
  }

  return (
    <div className={`text-center relative ${isFocusMode ? "py-8 sm:py-16" : "py-6 sm:py-8"}`}>
      {!isFocusMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleFontStyle}
          className="absolute top-0 right-0 text-xs scale-90 sm:scale-100"
        >
          <Type className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">{fontNames[fontStyle]}</span>
        </Button>
      )}

      {/* Zona horaria */}
      <div className={`${isFocusMode
          ? "text-sm sm:text-lg md:text-xl mb-3 sm:mb-4"
          : "text-xs sm:text-sm md:text-base mb-2"
        } text-foreground/60 font-medium`}>
        {getTimezone()}
      </div>

      {/* Fecha */}
      <div className={`${isFocusMode
          ? "text-base sm:text-xl md:text-2xl mb-6 sm:mb-8"
          : "text-sm sm:text-lg md:text-xl mb-4 sm:mb-6"
        } text-foreground/50 capitalize px-2`}>
        {formatDate(time)}
      </div>

      {/* Hora principal - Responsiva */}
      <div className={`${isFocusMode
          ? "text-4xl sm:text-6xl md:text-8xl lg:text-9xl"
          : "text-3xl sm:text-4xl md:text-6xl lg:text-8xl"
        } font-bold text-foreground ${fontStyles[fontStyle]} tracking-wider transition-all duration-300 px-2`}>
        <div className="mobile-clock-text">
          {formatTime(time)}
        </div>
      </div>

      {/* Mejorar legibilidad en pantallas muy pequeñas */}
      <style jsx>{`
        @media (max-width: 375px) {
          .mobile-clock-text {
            font-size: clamp(1.8rem, 8vw, 2.5rem) !important;
            line-height: 1.1;
          }
        }
      `}</style>
    </div>
  )
}