# The Clock - Aplicación de Productividad Minimalista

![The Clock](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

Una aplicación web minimalista de productividad que combina un reloj digital en tiempo real, temporizador Pomodoro, lista de tareas y sistema de notas, todo en una interfaz elegante y enfocada.

## ✨ Características Principales

### 🕐 Reloj Digital Inteligente
- **Tiempo real** con visualización de fecha y zona horaria
- **Múltiples estilos tipográficos** (monospace, sans-serif, serif, display, condensed)
- **Diseño responsivo** que se adapta a cualquier dispositivo
- **Modo enfoque** para máxima inmersión

### 🍅 Temporizador Pomodoro Avanzado
- **Configuración personalizable** de tiempos de enfoque y descanso
- **Sistema de colores** personalizable para cada modo
- **Animaciones de transición** entre modos
- **Registro automático** de sesiones completadas
- **Interfaz tipo "flip card"** para cambios de modo

### ✅ Sistema de Gestión de Tareas
- **Lista de tareas** con marcado de completado
- **Organización automática** (pendientes vs completadas)
- **Edición en línea** con confirmación visual
- **Sincronización en tiempo real** entre dispositivos
- **Estadísticas** de productividad

### 📝 Sistema de Notas Integrado
- **Creación y edición** de notas con título y contenido
- **Almacenamiento persistente** en base de datos
- **Vista previa** y truncado inteligente de contenido
- **Marcas de tiempo** de creación y modificación
- **Interfaz limpia** y minimalista

### 👤 Sistema de Autenticación
- **Registro e inicio de sesión** simplificado
- **Almacenamiento seguro** de datos por usuario
- **Notificaciones toast** para feedback de acciones
- **Validación en tiempo real** de nombres de usuario

## 🚀 Tecnologías Utilizadas

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Autenticación**: JWT con sistema personalizado
- **Base de Datos**: API REST personalizada
- **Iconos**: Lucide React
- **Componentes UI**: Shadcn/ui personalizados
- **Analytics**: Vercel Analytics

## 🛠️ Estructura del Proyecto

```
my-app/
├── app/                    # Directorio principal de la aplicación
│   ├── layout.tsx         # Layout principal con providers
│   ├── page.tsx           # Página principal con navegación
│   └── globals.css        # Estilos globales
├── components/            # Componentes de React
│   ├── ui/               # Componentes de interfaz (Shadcn/ui)
│   ├── auth-provider.tsx # Contexto de autenticación
│   ├── config-modal.tsx  # Modal de configuración Pomodoro
│   ├── digital-clock.tsx # Componente de reloj digital
│   ├── notes-system.tsx  # Sistema de notas
│   ├── pomodoro-timer.tsx# Temporizador Pomodoro
│   ├── simple-user-menu.tsx # Menú de usuario
│   ├── theme-provider.tsx   # Proveedor de temas
│   ├── todo-list.tsx     # Lista de tareas
│   └── user-registration.tsx # Registro de usuario
├── lib/                   # Utilidades y servicios
│   ├── api-client.ts     # Cliente para API REST
│   ├── auth.ts          # Servicio de autenticación
│   ├── user-data.ts     # Gestión de datos de usuario
│   └── utils.ts         # Utilidades generales
├── hooks/                # Hooks personalizados
│   ├── use-auto-refresh.ts # Auto-refresco de datos
│   ├── use-data-refresh.ts # Gestión de refresco
│   ├── use-live-data.ts    # Datos en tiempo real
│   ├── use-mobile.ts       # Detección de dispositivo móvil
│   └── use-toast.ts        # Sistema de notificaciones
└── public/               # Archivos estáticos
```

## 📦 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd my-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎨 Personalización

### Colores del Pomodoro
El sistema permite personalizar los colores para los modos de enfoque y descanso a través de la modal de configuración.

### Tipografías del Reloj
Clic en el icono de tipografía en el reloj para ciclar entre 5 estilos diferentes.

### Modo Enfoque
Activa el modo de pantalla completa para minimizar distracciones durante sesiones de trabajo.

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Navegación superior, layout expandido
- **Tablet**: Interfaz adaptativa con gestos táctiles
- **Mobile**: Navegación inferior, optimización de touch

## 🔄 Sincronización de Datos

- **Auto-save**: Guardado automático de cambios
- **Sync en tiempo real**: Actualización entre pestañas/dispositivos
- **Offline-ready**: Funcionalidad básica sin conexión

## 🚦 Scripts Disponibles

- `npm run dev` - Modo desarrollo
- `npm run build` - Compilación para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Análisis de código

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la feature (`git checkout -b feature/AmazingFeature`)
3. Commit de los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Abre un nuevo issue con detalles del problema

## 🌟 Próximas Características

- [ ] Sincronización con cloud
- [ ] Exportación de datos
- [ ] Temas adicionales
- [ ] Recordatorios y notificaciones
- [ ] Estadísticas avanzadas de productividad
- [ ] Modos de trabajo adicionales
- [ ] Integración con calendarios

---

**The Clock** - Mantente enfocado, organízate y mejora tu productividad con esta herramienta todo-en-uno.