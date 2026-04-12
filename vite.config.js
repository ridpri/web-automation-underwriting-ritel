import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor'
            return 'vendor'
          }
          if (id.includes('vehicleFlowData') || id.includes('vehicleFlowUi') || id.includes('MotorLatestExact')) return 'vehicle-flow'
          if (id.includes('MotorInternalPrototype') || id.includes('CarTloInternalPrototype') || id.includes('CarCompInternalPrototype')) return 'vehicle-internal'
          if (id.includes('PropertyPrototype')) return 'property-internal'
          if (id.includes('PropertyExternalPrototype')) return 'property-external'
          if (id.includes('InternalOperatingShell') || id.includes('ReviewWorkbench') || id.includes('operatingLayer')) return 'operating-layer'
        },
      },
    },
  },
})
