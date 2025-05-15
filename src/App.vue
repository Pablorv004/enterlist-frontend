<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useAuthStore } from './store/auth';
import { onMounted } from 'vue';

const authStore = useAuthStore();

// Check for existing token on app load
onMounted(() => {
  authStore.checkAuth();
});
</script>

<style>
/* Global styles */
:root {
  /* Primary brand colors */
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #3171e0;
  --ion-color-primary-tint: #4c8dff;
  
  /* Secondary colors */
  --ion-color-secondary: #3dc2ff;
  --ion-color-secondary-rgb: 61, 194, 255;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #36abe0;
  --ion-color-secondary-tint: #50c8ff;
  
  /* Tertiary colors */
  --ion-color-tertiary: #5260ff;
  --ion-color-tertiary-rgb: 82, 96, 255;
  --ion-color-tertiary-contrast: #ffffff;
  --ion-color-tertiary-contrast-rgb: 255, 255, 255;
  --ion-color-tertiary-shade: #4854e0;
  --ion-color-tertiary-tint: #6370ff;
  
  /* Accent color */
  --ion-color-accent: #ff6b6b;
  --ion-color-accent-rgb: 255, 107, 107;
  --ion-color-accent-shade: #e05d5d;
  --ion-color-accent-tint: #ff7a7a;
  
  /* Background colors */
  --ion-background-color: #121212;
  --ion-background-color-rgb: 18, 18, 18;
  
  /* Text colors */
  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;
  
  /* Other UI colors */
  --ion-toolbar-background: transparent;
  --ion-item-background: transparent;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
