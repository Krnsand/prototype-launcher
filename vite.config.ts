import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.pub/favicon.ico",
        "favicon.pub/apple-touch-icon.png"
      ],

      manifest: {
        name: "Min App",
        short_name: "MinApp",
        description: "Min Solid PWA",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",

        icons: [
          {
            src: "/favicon.pub/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/favicon.pub/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});


