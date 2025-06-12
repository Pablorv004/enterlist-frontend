<template>
    <ion-footer>
        <ion-toolbar>
            <div class="bottom-nav">
                <!-- Dashboard -->
                <ion-button fill="clear" @click="navigateTo('dashboard')" :class="getNavButtonClass('dashboard')">
                    <ion-icon :icon="homeIcon" slot="top"></ion-icon>
                    <ion-label>Dashboard</ion-label>
                </ion-button>

                <!-- Songs/Playlists -->
                <ion-button fill="clear" @click="navigateTo('content')" :class="getNavButtonClass('content')">
                    <ion-icon :icon="contentIcon" slot="top"></ion-icon>
                    <ion-label>{{ contentLabel }}</ion-label>
                </ion-button>

                <!-- Submissions -->
                <ion-button fill="clear" @click="navigateTo('submissions')" :class="getNavButtonClass('submissions')">
                    <ion-icon :icon="documentTextIcon" slot="top"></ion-icon>
                    <ion-label>Submissions</ion-label>
                </ion-button>

                <!-- Profile -->
                <ion-button fill="clear" @click="navigateTo('profile')" :class="getNavButtonClass('profile')">
                    <ion-icon :icon="personIcon" slot="top"></ion-icon>
                    <ion-label>Profile</ion-label>
                </ion-button>
            </div>
        </ion-toolbar>
    </ion-footer>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonFooter, IonToolbar, IonButton, IonIcon, IonLabel } from '@ionic/vue';
import {
    home as homeIcon,
    documentText as documentTextIcon,
    person as personIcon,
    musicalNotes as musicalNotesIcon,
    list as listIcon
} from 'ionicons/icons';
import { useAuthStore } from '@/store';

type UserType = 'artist' | 'playlist_maker';
type ActiveTab = 'dashboard' | 'content' | 'submissions' | 'profile';

export default defineComponent({
    name: 'BottomNavigation',
    components: {
        IonFooter,
        IonToolbar,
        IonButton,
        IonIcon,
        IonLabel
    },
    props: {
        userType: {
            type: String as PropType<UserType>,
            required: false
        },
        activeTab: {
            type: String as PropType<ActiveTab>,
            required: false
        }
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const authStore = useAuthStore();

        // Determine user type from prop or auth store
        const currentUserType = computed((): UserType => {
            if (props.userType) {
                return props.userType;
            }
            return authStore.user?.role === 'playlist_maker' ? 'playlist_maker' : 'artist';
        });

        // Routes based on user type
        const dashboardRoute = computed(() => 
            currentUserType.value === 'artist' ? '/artist/dashboard' : '/playlist-maker/dashboard'
        );

        const contentRoute = computed(() => 
            currentUserType.value === 'artist' ? '/artist/songs' : '/playlist-maker/playlists'
        );

        const submissionsRoute = computed(() => 
            currentUserType.value === 'artist' ? '/artist/submissions' : '/playlist-maker/submissions'
        );        const profileRoute = computed(() => '/profile');

        // Content label and icon based on user type
        const contentLabel = computed(() => 
            currentUserType.value === 'artist' ? 'Songs' : 'Playlists'
        );

        const contentIcon = computed(() => 
            currentUserType.value === 'artist' ? musicalNotesIcon : listIcon
        );

        // Determine active tab from route or prop
        const activeTab = computed((): ActiveTab => {
            if (props.activeTab) {
                return props.activeTab;
            }

            // Auto-detect from current route
            const path = route.path;
            
            if (path.includes('/dashboard')) {
                return 'dashboard';
            } else if (path.includes('/songs') || path.includes('/playlists')) {
                return 'content';
            } else if (path.includes('/submissions')) {
                return 'submissions';
            } else if (path.includes('/profile') || path.includes('/linked-accounts')) {
                return 'profile';
            }
            
            return 'dashboard'; // Default fallback
        });

        // Get nav button class with active state
        const getNavButtonClass = (tab: ActiveTab): string => {
            const baseClass = 'nav-button';
            return activeTab.value === tab ? `${baseClass} active` : baseClass;
        };

        // Navigation handler with page refresh
        const navigateTo = async (tab: ActiveTab) => {
            let targetRoute: string;
            
            switch (tab) {
                case 'dashboard':
                    targetRoute = dashboardRoute.value;
                    break;
                case 'content':
                    targetRoute = contentRoute.value;
                    break;
                case 'submissions':
                    targetRoute = submissionsRoute.value;
                    break;
                case 'profile':
                    targetRoute = profileRoute.value;
                    break;
                default:
                    targetRoute = dashboardRoute.value;
            }

            // If we're already on the target route, just refresh
            if (route.path === targetRoute) {
                window.location.reload();
                return;
            }

            // Navigate to the route and then refresh
            await router.push(targetRoute);
            // Small delay to ensure navigation completes before refresh
            setTimeout(() => {
                window.location.reload();
            }, 100);
        };

        return {
            dashboardRoute,
            contentRoute,
            submissionsRoute,
            profileRoute,
            contentLabel,
            contentIcon,
            getNavButtonClass,
            navigateTo,
            // Icons
            homeIcon,
            documentTextIcon,
            personIcon
        };
    }
});
</script>

<style scoped>
.bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    padding: 8px 0;
    background: var(--ion-color-light);
}

.nav-button {
    --background: transparent;
    --color: var(--ion-color-medium);
    --color-activated: var(--ion-color-primary);
    --color-focused: var(--ion-color-primary);
    --color-hover: var(--ion-color-primary);
    --ripple-color: var(--ion-color-primary);
    flex: 1;
    height: auto;
    flex-direction: column;
    font-size: 0.75rem;
    margin: 0;
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 8px;
    --padding-bottom: 8px;
}

.nav-button.active {
    --color: var(--ion-color-primary);
    font-weight: 600;
}

.nav-button ion-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
}

.nav-button ion-label {
    font-size: 0.75rem;
    text-transform: none;
    margin: 0;
}

/* Responsive adjustments */
@media (max-width: 320px) {
    .nav-button ion-label {
        font-size: 0.6rem;
    }
    
    .nav-button ion-icon {
        font-size: 1.25rem;
    }
}

@media (min-width: 768px) {
    .nav-button {
        font-size: 0.875rem;
    }
    
    .nav-button ion-label {
        font-size: 0.875rem;
    }
    
    .nav-button ion-icon {
        font-size: 1.75rem;
    }
}
</style>
