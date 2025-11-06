# PWA Setup Instructions

## Icon Generation

To complete the PWA setup, you need to generate the following PNG icon files:

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels  
3. **apple-touch-icon.png** - 180x180 pixels (for iOS)

### Quick Method

1. Open `generate-icons.html` in your browser
2. Click the download buttons to save each icon
3. Place the downloaded PNG files in the `public` folder

### Alternative Method

You can use any image editor or online tool to convert `icon.svg` to PNG at the required sizes:
- Use tools like [CloudConvert](https://cloudconvert.com/svg-to-png) or [Convertio](https://convertio.co/svg-png/)
- Or use image editing software like Photoshop, GIMP, or Figma

## Testing PWA

1. Build the app: `npm run build`
2. Preview the build: `npm run preview`
3. Open in Chrome DevTools > Application > Manifest to verify
4. Test "Add to Home Screen" on mobile devices

## Service Worker

The service worker is automatically generated and registered by `vite-plugin-pwa`. It will:
- Cache static assets for offline use
- Cache API responses from Supabase
- Auto-update when new versions are available

## Features Enabled

- ✅ Offline support
- ✅ Install prompt on supported browsers
- ✅ App-like experience when installed
- ✅ Automatic updates
- ✅ Caching strategy for better performance

