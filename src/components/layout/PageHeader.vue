<template>
    <ion-header :translucent="true" class="page-header">
        <ion-toolbar class="glass-header">
            <ion-buttons slot="start">
                <ion-menu-button v-if="showMenu && !isMobile" class="menu-button">
                    <font-awesome-icon icon="bars" />
                </ion-menu-button>
                <ion-back-button v-if="showBackButton" :default-href="backHref" class="back-button" text="">
                    <font-awesome-icon icon="chevron-left" slot="icon-only" />
                </ion-back-button>
            </ion-buttons>
            <ion-title class="page-title">
                <font-awesome-icon :icon="icon" v-if="icon" class="header-icon" />
                {{ title }}
            </ion-title>
            <ion-buttons slot="end">
                <slot name="end-buttons"></slot>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script setup lang="ts">
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonBackButton
} from '@ionic/vue';
import { FontAwesomeIcon } from '@/plugins/fontawesome';
import { useScreenSize } from '@/composables/useUtils';

defineProps({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: ''
    },
    showMenu: {
        type: Boolean,
        default: true
    },
    showBackButton: {
        type: Boolean,
        default: false
    },
    backHref: {
        type: String,
        default: '/'
    }
});

const { isMobile } = useScreenSize();
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables';
@import '../../assets/styles/mixins';

.page-header {
  --background: transparent;
}

.glass-header {
  --background: rgba(255, 255, 255, 0.1);
  @include glass-effect(0.1, 10px, rgba(255, 255, 255, 0.1));
  padding: 5px 0;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      rgba(255, 255, 255, 0.3), 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
  }
}

.page-title {
  font-weight: 600;
  color: white;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  
  .header-icon {
    margin-right: 8px;
    color: $primary-color;
  }
}

.menu-button, .back-button {
  --color: white;
  --background-hover: rgba(255, 255, 255, 0.1);
  --background-activated: rgba(255, 255, 255, 0.2);
  --padding-start: 12px;
  --padding-end: 12px;
  
  &::part(native) {
    border-radius: $border-radius-md;
  }
}

.back-button::part(text) {
  display: none;
}
</style>
