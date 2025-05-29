<template>
    <ion-button fill="clear" color="light" @click="presentPopover($event)">
        <div class="profile-button-content">
            <span class="username">{{ user?.username }}</span>
            <ion-avatar>
                <ion-icon :icon="personCircleOutline" class="avatar-icon"></ion-icon>
            </ion-avatar>
        </div>
    </ion-button>

    <ion-popover :is-open="isOpen" :event="event" @didDismiss="isOpen = false" class="profile-popover">        <ion-content>
            <ion-list lines="none">
                <ion-item v-if="!isAdmin" detail :router-link="profileLink" @click="closePopover">
                    <ion-icon :icon="personIcon" slot="start"></ion-icon>
                    <ion-label>My Profile</ion-label>
                </ion-item>
                
                <ion-item button @click="logout()">
                    <ion-icon :icon="logOutIcon" slot="start"></ion-icon>
                    <ion-label>Log Out</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-popover>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import {
    IonButton,
    IonAvatar,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel
} from '@ionic/vue';
import { person, logOut, personCircleOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'UserProfileMenu',
    components: {
        IonButton,
        IonAvatar,
        IonPopover,
        IonContent,
        IonList,
        IonItem,
        IonIcon,
        IonLabel
    },
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();
        const isOpen = ref(false);        const event = ref();
        const user = computed(() => authStore.user);        
        // Check if user is admin
        const isAdmin = computed(() => authStore.isAdmin);

        // Determine profile link based on user role
        const profileLink = computed(() => {
            return '/profile';
        });

        const presentPopover = (e: Event) => {
            event.value = e;
            isOpen.value = true;
        };

        const logout = async () => {
            isOpen.value = false;
            await new Promise(resolve => setTimeout(resolve, 100));
            await authStore.logout();
            router.push('/login');
        };

        const closePopover = () => {
            isOpen.value = false;
        };        return {
            isOpen,
            event,
            user,
            isAdmin,
            profileLink,
            presentPopover,
            logout,
            closePopover,
            personIcon: person,
            logOutIcon: logOut,
            personCircleOutline
        };
    }
});
</script>

<style scoped>
.profile-button-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    display: inline-block;
    color: white;
    font-weight: 500;
}

.avatar-icon {
    width: 100%;
    height: 100%;
}

ion-avatar {
    width: 32px;
    height: 32px;
}

.profile-popover {
    --width: 220px;
}

@media (max-width: 576px) {
    .username {
        display: none;
    }
}
</style>
