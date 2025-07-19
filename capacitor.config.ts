import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ea663fcd7f7540419ef331f1f0f33fce',
  appName: 'grid-vision-cloud-ops',
  webDir: 'dist',
  server: {
    url: 'https://ea663fcd-7f75-4041-9ef3-31f1f0f33fce.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    }
  }
};

export default config;