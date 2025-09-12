"use client"

import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { toast } from '@/components/ui/use-toast'

export function SimpleUserMenu() {
    const { user, logout, isAuthenticated } = useAuth()

    const handleLogout = () => {
        try {
            logout()
            toast({
                title: "Sesión cerrada",
                description: "Has cerrado sesión correctamente"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al cerrar sesión",
                variant: "destructive"
            })
        }
    }

    if (!isAuthenticated || !user) {
        return null
    }

    return (
        <div className="flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 px-3 sm:px-4 py-2 rounded-full shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-foreground/60 shrink-0" />
                <span className="text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-none">
                    {user.username}
                </span>
            </div>
            <Button
                onClick={handleLogout}
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-full hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-all touch-manipulation shrink-0"
                title="Cerrar sesión"
            >
                <LogOut className="w-4 h-4" />
            </Button>
        </div>
    )
}