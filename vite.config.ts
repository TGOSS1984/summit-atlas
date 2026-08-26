import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// path aliases can go here later if the import paths get out of hand
export default defineConfig({
  plugins: [react()],
  test: {
    // pure util tests for now, no DOM needed - switch to jsdom if/when
    // component tests get added
    environment: 'node',
  },
})