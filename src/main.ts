import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './store';
import { Capacitor } from '@capacitor/core';

// Polyfill for process.env to make code compatible with both Node.js and browser environments
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.BASE_URL = import.meta.env.BASE_URL;

import { IonicVue } from '@ionic/vue';

// Vuetify
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(vuetify)
  .use(pinia)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
  
  // Initialize mobile OAuth handling after app is mounted and router is ready
  if (Capacitor.isNativePlatform()) {
    import('./services/OAuthService').then(({ OAuthService }) => {
      const oauthService = new OAuthService(router);
      
      // Set up mobile deep links for OAuth callbacks
      import('@capacitor/app').then(({ App: CapacitorApp }) => {
        console.log('Setting up mobile OAuth deep link handler...');
        
        CapacitorApp.addListener('appUrlOpen', async (event) => {
          console.log('Deep link received:', event.url);
          try {
            await oauthService.handleMobileCallback(event.url);
          } catch (error) {
            console.error('Mobile OAuth callback failed:', error);
            await oauthService.handleOAuthError('OAuth authentication failed');
          }
        });
      });
    });
  }
});
