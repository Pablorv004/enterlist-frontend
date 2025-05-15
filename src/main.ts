import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index';
import { FontAwesomeIcon } from './plugins/fontawesome';

// Core Ionic CSS
import '@ionic/vue/css/core.css';

// Basic Ionic CSS
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// Optional Ionic CSS utilities
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

// Import custom SCSS styles
import './assets/styles/main.scss';

const pinia = createPinia();
const app = createApp(App);

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(IonicVue);
app.use(router);
app.use(pinia);

router.isReady().then(() => {
    app.mount('#app');
});
