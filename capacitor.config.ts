import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolapp.mayuri',
  appName: 'Mayuri Kids Villa',
  webDir: 'dist',
  // Load the live hosted web app instead of the bundle baked into the APK, so
  // every Firebase deploy shows up in the installed app immediately and we
  // never ship a stale app again. webDir is kept as a fallback for cap tooling.
  server: {
    url: 'https://school-c0203.web.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#00897B',
      showSpinner: true,
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#00897B'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
