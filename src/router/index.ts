// router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

// Views
import LoginView from '../views/LoginView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { requiresAuth: false }
    }, {
        path: '/register',
        name: 'Register',
        component: () => import('../views/RegisterView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/tabs/',
        component: () => import('../views/TabsLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: '/tabs/dashboard'
            },
            // Artist routes
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/DashboardView.vue')
            },
            {
                path: 'songs',
                name: 'Songs',
                component: () => import('../views/artist/SongsView.vue')
            },
            {
                path: 'songs/new',
                name: 'NewSong',
                component: () => import('../views/artist/SongFormView.vue')
            },
            {
                path: 'songs/:id',
                name: 'EditSong',
                component: () => import('../views/artist/SongFormView.vue')
            },
            // Playlist manager routes
            {
                path: 'playlists',
                name: 'Playlists',
                component: () => import('../views/playlist-manager/PlaylistsView.vue')
            },
            {
                path: 'playlists/new',
                name: 'NewPlaylist',
                component: () => import('../views/playlist-manager/PlaylistFormView.vue')
            },
            {
                path: 'playlists/:id',
                name: 'EditPlaylist',
                component: () => import('../views/playlist-manager/PlaylistFormView.vue')
            },
            // Submissions
            {
                path: 'submissions',
                name: 'Submissions',
                component: () => import('../views/submissions/SubmissionsView.vue')
            },
            {
                path: 'submissions/:id',
                name: 'SubmissionDetails',
                component: () => import('../views/submissions/SubmissionDetailView.vue')
            },
            // Profile
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/ProfileView.vue')
            },
            // Admin routes
            {
                path: 'admin',
                name: 'Admin',
                component: () => import('../views/admin/AdminDashboardView.vue'),
                meta: { requiresAdmin: true },
            },
            {
                path: 'admin/users',
                name: 'AdminUsers',
                component: () => import('../views/admin/UsersView.vue'),
                meta: { requiresAdmin: true },
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login if not authenticated
        next('/login');
    } else if (to.meta.requiresAdmin && authStore.userRole !== 'admin') {
        // Redirect to dashboard if not an admin
        next('/tabs/dashboard');
    } else {
        next();
    }
});

export default router;
