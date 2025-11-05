import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: You must replace 'your-repo-name' with the name of your GitHub repository.
  // For example, if your repo URL is https://github.com/user/my-pokedex,
  // you should set base to '/my-pokedex/'.
  base: '/PokeStats/',
})
