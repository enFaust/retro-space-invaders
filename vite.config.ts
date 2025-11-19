import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Для Vercel настройка base не нужна (или должна быть '/'), 
  // так как приложение деплоится в корень домена.
});