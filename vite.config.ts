// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/password_generator

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Конфиг Vite под Tauri: фиксированный порт и без очистки экрана,
// чтобы не терять вывод Rust-части при `tauri dev`.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: "es2021",
  },
});
