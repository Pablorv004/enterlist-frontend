<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button v-if="backButton" router-back>
                    <ion-icon :icon="arrowBackIcon" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button router-link="/" fill="clear" color="light">
                    <ion-icon :icon="homeIcon" slot="icon-only"></ion-icon>
                </ion-button>
            </ion-buttons>
            <ion-title class="ion-text-center">{{ title }}</ion-title>
            <ion-buttons slot="end">
                <slot name="end-buttons"></slot>
                <user-profile-menu v-if="showUserMenu"></user-profile-menu>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { arrowBack, home } from 'ionicons/icons';
import { useAuthStore } from '@/store';
import UserProfileMenu from './UserProfileMenu.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    UserProfileMenu
  },
  props: {
    title: {
      type: String,
      required: true
    },
    backButton: {
      type: Boolean,
      default: false
    },
    backUrl: {
      type: String,
      default: ''
    }
  },
  setup() {
    const authStore = useAuthStore();
    const showUserMenu = computed(() => authStore.isAuthenticated);
    
    return {
      showUserMenu,
      arrowBackIcon: arrowBack,
      homeIcon: home
    };
  }
});
</script>

<style scoped>
ion-toolbar {
    --background: var(--ion-color-primary);
    --color: white;
}

ion-title {
    text-align: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    padding: 0;
}
</style>
