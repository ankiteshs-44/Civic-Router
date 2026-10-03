import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Civic Complaint Router frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // auto-open the browser on `npm run dev`
  },
});
