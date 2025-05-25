import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enterlist.app',
  appName: 'Enterlist',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
