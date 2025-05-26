import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './store';

// Polyfill for process.env to make code compatible with both Node.js and browser environments
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.BASE_URL = import.meta.env.BASE_URL;

import { IonicVue } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

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
  .use(pinia)
  .use(router);

// Handle mobile OAuth callbacks
if (Capacitor.isNativePlatform()) {
  CapacitorApp.addListener('appUrlOpen', async (event) => {
    const url = new URL(event.url);
    
    if (url.pathname === '/oauth/callback') {
      const params = new URLSearchParams(url.search);
      const accessToken = params.get('access_token');
      const userData = params.get('user');
      const isNewUser = params.get('isNewUser') === 'true';
      const needsRoleSelection = params.get('needsRoleSelection') === 'true';
      const provider = params.get('provider');
      
      if (accessToken && userData) {
        // Store in Capacitor Preferences for mobile
        const { Preferences } = await import('@capacitor/preferences');
        
        await Preferences.set({
          key: 'enterlist_token',
          value: accessToken
        });
        
        await Preferences.set({
          key: 'enterlist_user',
          value: userData
        });
        
        // Navigate based on user state
        await router.isReady();
        
        if (isNewUser || needsRoleSelection) {
          router.push(`/role-selection?provider=${provider}&status=success`);
        } else {
          router.push('/dashboard?status=success');
        }
      }
    } else if (url.pathname === '/oauth/error') {
      const params = new URLSearchParams(url.search);
      const error = params.get('error');
      
      // Navigate to login with error
      await router.isReady();
      router.push(`/login?error=${encodeURIComponent(error || 'OAuth authentication failed')}`);
    }
  });
}

router.isReady().then(() => {
  app.mount('#app');
});
