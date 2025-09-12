"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Download, Loader2, AlertCircle, CheckCircle2, X, UserX, UserCheck } from "lucide-react"
import { useAuth } from "./auth-provider"
import { toast } from "@/components/ui/use-toast"

interface UserRegistrationProps {
  onUserRegistered: (username: string) => void
}

interface NotificationProps {
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
}

function Notification({ type, title, message, isVisible, onClose }: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        handleClose()
      }, type === "error" ? 6000 : 4000) // Errores se muestran más tiempo
      return () => clearTimeout(timer)
    }
  }, [isVisible, type])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  const bgColor = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
  }[type]

  const textColor = {
    success: "text-green-800 dark:text-green-200",
    error: "text-red-800 dark:text-red-200",
    warning: "text-amber-800 dark:text-amber-200",
    info: "text-blue-800 dark:text-blue-200"
  }[type]

  const iconColor = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400"
  }[type]

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: UserX,
    info: AlertCircle
  }[type]

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 max-w-md sm:w-full px-4 sm:px-0">
      <div className={`
        ${bgColor} ${textColor}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        ${isAnimating
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-full opacity-0 scale-95"
        }
      `}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm mt-1 opacity-90 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className={`${iconColor} hover:opacity-70 transition-opacity p-1 rounded ml-2`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserRegistration({ onUserRegistered }: UserRegistrationProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<"register" | "login" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning"
    title: string
    message: string
    isVisible: boolean
  }>({
    type: "info",
    title: "",
    message: "",
    isVisible: false
  })

  const { login, register } = useAuth()

  const showNotification = (type: "success" | "error" | "info" | "warning", title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const validateUsername = (username: string): string | null => {
    const trimmed = username.trim()
    if (!trimmed) return "El nombre de usuario es requerido"
    if (trimmed.length < 2) return "El nombre debe tener al menos 2 caracteres"
    if (trimmed.length > 30) return "El nombre no puede tener más de 30 caracteres"
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return "Solo se permiten letras, números, guiones y guiones bajos"
    }
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      showNotification("warning", "Nombre inválido", validationError)
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setLoadingType("register")
    setError(null)

    try {
      const success = await register(username.trim())
      if (success) {
        showNotification(
          "success",
          "¡Cuenta creada exitosamente!",
          `Bienvenido ${username.trim()}. Tu cuenta ha sido creada correctamente.`
        )
        setTimeout(() => {
          onUserRegistered(username.trim())
        }, 1500)

        toast({
          title: "¡Usuario creado!",
          description: `Bienvenido ${username.trim()}`,
        })
      }
    } catch (error: any) {
      console.error('Registration error:', error)

      // Manejo específico de errores con alertas mejoradas
      if (error?.response?.status === 409 || error?.message?.toLowerCase().includes('exists') || error?.message?.toLowerCase().includes('already')) {
        const errorMessage = `¡Usuario no disponible! "${username.trim()}" ya está registrado en el sistema.`
        setError(errorMessage)
        showNotification(
          "warning",
          "⚠️ Usuario ya registrado",
          `El nombre "${username.trim()}" ya está en uso. Intenta con "Iniciar Sesión" si es tu cuenta, o elige otro nombre.`
        )
        toast({
          title: "Usuario no disponible",
          description: `"${username.trim()}" ya existe. Prueba iniciar sesión o usa otro nombre.`,
          variant: "destructive"
        })
      } else if (error?.response?.status === 400) {
        const errorMessage = "Nombre de usuario no válido. Revisa el formato."
        setError(errorMessage)
        showNotification(
          "error",
          "Formato inválido",
          "El nombre debe contener solo letras, números y guiones. Sin espacios ni caracteres especiales."
        )
      } else if (error?.response?.status >= 500) {
        const errorMessage = "Error del servidor. Intenta nuevamente en unos momentos."
        setError(errorMessage)
        showNotification(
          "error",
          "Error del servidor",
          "Hay problemas técnicos temporales. Por favor intenta de nuevo en unos segundos."
        )
      } else {
        const errorMessage = "Error de conexión. Verifica tu internet e inténtalo de nuevo."
        setError(errorMessage)
        showNotification(
          "error",
          "Sin conexión",
          "No se pudo conectar al servidor. Verifica tu conexión a internet."
        )
      }
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      showNotification("warning", "Nombre inválido", validationError)
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setLoadingType("login")
    setError(null)

    try {
      const success = await login(username.trim())
      if (success) {
        showNotification(
          "success",
          "¡Bienvenido de vuelta!",
          `Sesión iniciada correctamente como ${username.trim()}.`
        )
        setTimeout(() => {
          onUserRegistered(username.trim())
        }, 1500)

        toast({
          title: "¡Bienvenido de vuelta!",
          description: `Sesión iniciada como ${username.trim()}`,
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)

      // Manejo específico de errores de login
      if (error?.response?.status === 404 || error?.message?.toLowerCase().includes('not found') || error?.message?.toLowerCase().includes('user does not exist')) {
        const errorMessage = `Usuario "${username.trim()}" no encontrado.`
        setError(errorMessage)
        showNotification(
          "warning",
          "👤 Usuario no registrado",
          `No existe una cuenta con el nombre "${username.trim()}". Usa "Nuevo Usuario" para crear tu cuenta.`
        )
        toast({
          title: "Usuario no encontrado",
          description: `"${username.trim()}" no existe. Créalo con "Nuevo Usuario".`,
          variant: "destructive"
        })
      } else if (error?.response?.status === 401) {
        const errorMessage = "Credenciales incorrectas."
        setError(errorMessage)
        showNotification(
          "error",
          "Acceso denegado",
          "Los datos ingresados no coinciden. Verifica el nombre de usuario."
        )
      } else if (error?.response?.status >= 500) {
        const errorMessage = "Error del servidor. Intenta nuevamente."
        setError(errorMessage)
        showNotification(
          "error",
          "Error del servidor",
          "Problemas técnicos temporales. Intenta de nuevo en unos segundos."
        )
      } else {
        const errorMessage = "Error de conexión. Verifica tu internet."
        setError(errorMessage)
        showNotification(
          "error",
          "Sin conexión",
          "No se pudo conectar. Verifica tu conexión a internet y vuelve a intentar."
        )
      }
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  const handleInputChange = (value: string) => {
    // Limpiar caracteres no permitidos en tiempo real
    const cleanValue = value.replace(/[^a-zA-Z0-9_-]/g, '')
    setUsername(cleanValue)

    if (error) setError(null)
    if (notification.isVisible && (notification.type === "error" || notification.type === "warning")) {
      hideNotification()
    }
  }

  return (
    <>
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-card border border-border/50 rounded-full mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <User className="w-8 h-8 text-muted-foreground relative z-10" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Bienvenido</h1>
            <p className="text-muted-foreground text-sm px-4">
              Ingresa tu nombre para comenzar o acceder a tu cuenta existente
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full bg-card border-border/50 text-foreground placeholder:text-muted-foreground text-base h-12 transition-all duration-200 ${error ? 'border-red-500/50 focus:border-red-500' : 'focus:border-primary/50'
                  }`}
                disabled={isLoading}
                maxLength={30}
              />

              {/* Contador de caracteres */}
              <div className="text-right">
                <span className={`text-xs ${username.length > 25 ? 'text-amber-500' : username.length > 28 ? 'text-red-500' : 'text-muted-foreground/60'}`}>
                  {username.length}/30
                </span>
              </div>

              {/* Mensaje de error local */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in slide-in-from-top-1 duration-300">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleRegister}
                className="w-full h-12 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                disabled={!username.trim() || isLoading}
                size="lg"
              >
                {isLoading && loadingType === "register" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Creando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Nuevo Usuario</span>
                    <span className="sm:hidden">Crear</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full bg-transparent h-12 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                disabled={!username.trim() || isLoading}
                size="lg"
              >
                {isLoading && loadingType === "login" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Accediendo...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3 pt-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/80 bg-muted/30 px-3 py-2 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="hidden sm:inline">"Nuevo Usuario" crea una cuenta nueva</span>
                  <span className="sm:hidden">Crea cuenta nueva</span>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/80 bg-muted/30 px-3 py-2 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span className="hidden sm:inline">"Iniciar Sesión" accede a tu cuenta existente</span>
                  <span className="sm:hidden">Accede a cuenta existente</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}