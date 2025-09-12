"use client"

import { useState } from "react"
import { DigitalClock } from "@/components/digital-clock"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { TodoList } from "@/components/todo-list"
import { NotesSystem } from "@/components/notes-system"
import { ConfigModal } from "@/components/config-modal"
import { UserRegistration } from "@/components/user-registration"
import { SimpleUserMenu } from "@/components/simple-user-menu"
import { Button } from "@/components/ui/button"
import { Clock, Timer, CheckSquare, FileText, Maximize2, Minimize2, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

type ViewType = "clock" | "pomodoro" | "todo" | "notes"

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [currentView, setCurrentView] = useState<ViewType>("clock")
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [pomodoroConfig, setPomodoroConfig] = useState({
    focusTime: { hours: 0, minutes: 25, seconds: 0 },
    breakTime: { hours: 0, minutes: 5, seconds: 0 },
    colors: {
      focusColor: "#3b82f6",
      breakColor: "#10b981",
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground/60 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <UserRegistration onUserRegistered={() => window.location.reload()} />
  }

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Navegación superior para desktop */}
      {!isFocusMode && (
        <div className="hidden md:block fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex gap-1 bg-card/90 backdrop-blur-sm border border-border/50 rounded-full p-1 shadow-lg">
            <Button
              variant={currentView === "clock" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("clock")}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              Reloj
            </Button>
            <Button
              variant={currentView === "pomodoro" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("pomodoro")}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            >
              <Timer className="w-4 h-4 mr-2" />
              Pomodoro
            </Button>
            <Button
              variant={currentView === "todo" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("todo")}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tareas
            </Button>
            <Button
              variant={currentView === "notes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("notes")}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Notas
            </Button>
          </div>
        </div>
      )}

      {/* SimpleUserMenu - Solo desktop */}
      {!isFocusMode && (
        <div className="hidden md:block fixed top-4 left-4 z-20">
          <SimpleUserMenu />
        </div>
      )}

      {/* Botón de modo enfoque - Solo desktop */}
      {!isFocusMode && (
        <div className="hidden md:block fixed top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFocusMode(true)}
            className="rounded-full bg-card/80 backdrop-blur-sm border border-border/50 h-10 w-10 hover:bg-card transition-all"
            title="Activar modo enfoque"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Botón de salir del modo enfoque - Visible en móvil y desktop */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFocusMode(false)}
            className="rounded-full bg-card/90 backdrop-blur-sm border border-border/50 h-12 w-12 md:h-10 md:w-10 hover:bg-card transition-all shadow-lg"
            title="Salir del modo enfoque"
          >
            <Minimize2 className="w-5 h-5 md:w-4 md:h-4" />
          </Button>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-24 md:pb-8">
        <div className={`w-full transition-all duration-500 ease-in-out ${isFocusMode
            ? "max-w-7xl"
            : "max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl"
          }`}>

          {currentView === "clock" && (
            <div className="animate-in fade-in-0 duration-300">
              <DigitalClock isFocusMode={isFocusMode} />
            </div>
          )}

          {currentView === "pomodoro" && (
            <div className="animate-in fade-in-0 duration-300">
              <PomodoroTimer
                config={pomodoroConfig}
                onConfigOpen={() => setIsConfigOpen(true)}
                isFocusMode={isFocusMode}
              />
            </div>
          )}

          {currentView === "todo" && (
            <div className="animate-in fade-in-0 duration-300">
              <TodoList isFocusMode={isFocusMode} />
            </div>
          )}

          {currentView === "notes" && (
            <div className="animate-in fade-in-0 duration-300">
              <NotesSystem isFocusMode={isFocusMode} />
            </div>
          )}
        </div>
      </div>

      {/* Navegación inferior para móvil */}
      {!isFocusMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50">
          {/* Barra de navegación principal */}
          <div className="flex justify-around items-center px-2 pt-2">
            <Button
              variant={currentView === "clock" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("clock")}
              className={`flex-1 mx-1 rounded-xl h-14 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all ${currentView === "clock"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-accent/60"
                }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-medium">Reloj</span>
            </Button>
            <Button
              variant={currentView === "pomodoro" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("pomodoro")}
              className={`flex-1 mx-1 rounded-xl h-14 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all ${currentView === "pomodoro"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-accent/60"
                }`}
            >
              <Timer className="w-5 h-5" />
              <span className="text-xs font-medium">Pomodoro</span>
            </Button>
            <Button
              variant={currentView === "todo" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("todo")}
              className={`flex-1 mx-1 rounded-xl h-14 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all ${currentView === "todo"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-accent/60"
                }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Tareas</span>
            </Button>
            <Button
              variant={currentView === "notes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("notes")}
              className={`flex-1 mx-1 rounded-xl h-14 flex flex-col items-center justify-center gap-1 touch-manipulation transition-all ${currentView === "notes"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-accent/60"
                }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Notas</span>
            </Button>
          </div>

          {/* SimpleUserMenu para móvil - integrado en la barra inferior */}
          <div className="flex justify-center py-2 border-t border-border/30 mt-2">
            <div className="scale-90 transform">
              <SimpleUserMenu />
            </div>
          </div>

          {/* Espacio para safe area en móviles */}
          <div className="h-safe-bottom"></div>
        </div>
      )}

      {/* Modal de configuración */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={pomodoroConfig}
        onConfigChange={setPomodoroConfig}
      />

      <style jsx>{`
        .h-safe-bottom {
          height: max(8px, env(safe-area-inset-bottom));
        }
        
        @supports (height: 100dvh) {
          .min-h-screen {
            min-height: 100dvh;
          }
        }
        
        /* Mejores toques en móviles */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Prevenir zoom en inputs en móviles */
        @media screen and (max-width: 768px) {
          input[type="text"], 
          input[type="email"], 
          textarea, 
          select {
            font-size: 16px;
          }
        }
        
        /* Scroll suave */
        * {
          scroll-behavior: smooth;
        }
        
        /* Mejores transiciones */
        .animate-in {
          animation-duration: 0.3s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Espaciado dinámico para móviles */
        @media (max-height: 640px) {
          .pb-24 {
            padding-bottom: 7rem;
          }
        }
        
        @media (max-height: 568px) {
          .pb-24 {
            padding-bottom: 6rem;
          }
        }
      `}</style>
    </main>
  )
}