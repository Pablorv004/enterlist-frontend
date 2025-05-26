<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, onMounted } from 'vue';
import { useAuthStore } from '@/store';

export default defineComponent({
    name: 'App',
    components: {
        IonApp,
        IonRouterOutlet
    },
    setup() {
        const authStore = useAuthStore();

        // Use onMounted to ensure initialization happens after component mount
        onMounted(async () => {
            // Initialize auth from local storage and wait for it to complete
            await authStore.initializeFromStorage();
            
            // No need to call checkAuth separately as it's now handled inside initializeFromStorage
        });

        return {};
    }
});
</script>

<style>
/* Global CSS Variables */
:root {
    --primary-color: #6a11cb;
    --secondary-color: #2575fc;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --dark-color: #1f2937;
    --light-color: #f3f4f6;
    --background-gradient: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

/* Ionic Theme Customization */
:root {
    --ion-color-primary: var(--primary-color);
    --ion-color-secondary: var(--secondary-color);
    --ion-color-success: var(--success-color);
    --ion-color-warning: var(--warning-color);
    --ion-color-danger: var(--danger-color);
    --ion-color-dark: var(--dark-color);
    --ion-color-light: var(--light-color);

    --ion-background-color: #ffffff;
    --ion-text-color: var(--dark-color);

    --ion-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

body {
    font-family: var(--ion-font-family);
}

/* Card styles */
ion-card {
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Button styles */
ion-button {
    --border-radius: 8px;
    font-weight: 600;
}

.gradient-text {
    background: var(--background-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
}

.gradient-bg {
    background: var(--background-gradient);
}

.full-height {
    height: 100%;
}

/* Animation for page transitions */
.page-enter-active,
.page-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from,
.page-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}

/* Added centering for common elements */
h1, h2, h3, h4, h5, h6, ion-title {
    text-align: center;
}

@media (min-width: 768px) {
    /* On larger screens, left-align some elements for better design */
    .dashboard-container h1, 
    .dashboard-container h2,
    .section-header h2,
    .card-header h2 {
        text-align: left;
    }
}
</style>
