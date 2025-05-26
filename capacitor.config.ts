import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enterlist.app',
  appName: 'Enterlist',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      appUrlOpen: {
        enabled: true,
        url: "enterlist"
      }
    }
  }
};

export default config;
