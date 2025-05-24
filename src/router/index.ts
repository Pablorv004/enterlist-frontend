import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store';

// Lazy load views for better performance
const Home = () => import('@/views/Home.vue');
const Login = () => import('@/views/Login.vue');
// const Register = () => import('@/views/Register.vue'); // Commented out missing component
const Dashboard = () => import('@/views/Dashboard.vue');
const RoleSelection = () => import('@/views/RoleSelection.vue');
const ArtistDashboard = () => import('@/views/artist/Dashboard.vue');
const PlaylistMakerDashboard = () => import('@/views/playlist-maker/Dashboard.vue');
// const AdminDashboard = () => import('@/views/admin/Dashboard.vue'); // Commented out missing component
const NotFound = () => import('@/views/NotFound.vue');

// Artist routes
const ArtistSongs = () => import('@/views/artist/Songs.vue');
const ArtistSubmissions = () => import('@/views/artist/Submissions.vue');
const ArtistSubmissionDetail = () => import('@/views/artist/SubmissionDetail.vue');
const ArtistNewSubmission = () => import('@/views/artist/NewSubmission.vue');
const ArtistProfile = () => import('@/views/artist/Profile.vue');
const ArtistPaymentMethods = () => import('@/views/artist/PaymentMethods.vue');
const ArtistLinkedAccounts = () => import('@/views/artist/LinkedAccounts.vue');

// Playlist maker routes
const PlaylistMakerPlaylists = () => import('@/views/playlist-maker/Playlists.vue');
const PlaylistMakerSubmissions = () => import('@/views/playlist-maker/Submissions.vue');
const PlaylistMakerSubmissionDetail = () => import('@/views/playlist-maker/SubmissionDetail.vue');
const PlaylistMakerProfile = () => import('@/views/playlist-maker/Profile.vue');
const PlaylistMakerLinkedAccounts = () => import('@/views/playlist-maker/LinkedAccounts.vue');

//Admin routes
// const AdminUsers = () => import('@/views/admin/Users.vue');
// const AdminPlaylists = () => import('@/views/admin/Playlists.vue');
// const AdminSongs = () => import('@/views/admin/Songs.vue');
// const AdminSubmissions = () => import('@/views/admin/Submissions.vue');
// const AdminTransactions = () => import('@/views/admin/Transactions.vue');
// const AdminActions = () => import('@/views/admin/Actions.vue');

// OAuth callback routes
const OAuthCallback = () => import('@/views/OAuthCallback.vue');

const routes: Array<RouteRecordRaw> = [    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: false }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, guestOnly: true }
    },
    /* Commented out missing route
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false, guestOnly: true }
    },
    */    {
        path: '/role-selection',
        name: 'RoleSelection',
        component: RoleSelection,
        meta: { requiresAuth: true, allowNoRole: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
        // This will redirect based on user role
    },
    // Artist routes
    {
        path: '/artist/dashboard',
        name: 'ArtistDashboard',
        component: ArtistDashboard,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/songs',
        name: 'ArtistSongs',
        component: ArtistSongs,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/submissions',
        name: 'ArtistSubmissions',
        component: ArtistSubmissions,
        meta: { requiresAuth: true, role: 'artist' }
    }, {
        path: '/artist/submissions/:id',
        name: 'ArtistSubmissionDetail',
        component: ArtistSubmissionDetail,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/submissions/new',
        name: 'ArtistNewSubmission',
        component: ArtistNewSubmission,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/profile',
        name: 'ArtistProfile',
        component: ArtistProfile,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/payment-methods',
        name: 'ArtistPaymentMethods',
        component: ArtistPaymentMethods,
        meta: { requiresAuth: true, role: 'artist' }
    },
    {
        path: '/artist/linked-accounts',
        name: 'ArtistLinkedAccounts',
        component: ArtistLinkedAccounts,
        meta: { requiresAuth: true, role: 'artist' }
    },
    // Playlist maker routes
    {
        path: '/playlist-maker/dashboard',
        name: 'PlaylistMakerDashboard',
        component: PlaylistMakerDashboard,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/playlists',
        name: 'PlaylistMakerPlaylists',
        component: PlaylistMakerPlaylists,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/submissions',
        name: 'PlaylistMakerSubmissions',
        component: PlaylistMakerSubmissions,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/submissions/:id',
        name: 'PlaylistMakerSubmissionDetail',
        component: PlaylistMakerSubmissionDetail,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/profile',
        name: 'PlaylistMakerProfile',
        component: PlaylistMakerProfile,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/linked-accounts',
        name: 'PlaylistMakerLinkedAccounts',
        component: PlaylistMakerLinkedAccounts,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },    // Admin routes
    /*
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/playlists',
        name: 'AdminPlaylists',
        component: AdminPlaylists,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/songs',
        name: 'AdminSongs',
        component: AdminSongs,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/submissions',
        name: 'AdminSubmissions',
        component: AdminSubmissions,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/transactions',
        name: 'AdminTransactions',
        component: AdminTransactions,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/actions',
        name: 'AdminActions',
        component: AdminActions,
        meta: { requiresAuth: true, role: 'admin' }
    },
    */    // OAuth callback routes
    {
        path: '/oauth/callback',
        name: 'OAuthCallback',
        component: OAuthCallback,
        meta: { requiresAuth: false }
    },
    // 404 Not Found route
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { requiresAuth: false }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL || ''),
    routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    // Always initialize from storage (including cookies) before checking auth
    authStore.initializeFromStorage();
    
    // Special handling for OAuth redirect URLs with provider and status params
    // These indicate the user is coming back from OAuth flow
    const isOAuthRedirect = to.query.provider && to.query.status === 'success';
    
    if (isOAuthRedirect) {
        // For OAuth redirects, check if we have a token (from cookies)
        // and allow navigation to role-selection or dashboard
        if (authStore.isAuthenticated) {
            // Let the OAuth redirect proceed
            next();
            return;
        } else {
            // If no token found, something went wrong, redirect to login
            next({ name: 'Login', query: { error: 'OAuth authentication failed' } });
            return;
        }
    }
    
    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const guestOnly = to.matched.some(record => record.meta.guestOnly);
    const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;
    const allowNoRole = to.matched.some(record => record.meta.allowNoRole);

    if (requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login if user is not authenticated
        next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (guestOnly && authStore.isAuthenticated) {
        // Redirect to dashboard if user is authenticated and tries to access guest-only pages
        next({ name: 'Dashboard' });
    } else if (requiredRole && authStore.isAuthenticated) {
        // Check user role for role-specific routes
        const userRole = authStore.user?.role?.toLowerCase();

        // If user has the correct role, proceed
        if (userRole === requiredRole) {
            next();
        } else {
            // Redirect to appropriate dashboard based on user role
            if (userRole === 'artist') {
                next({ name: 'ArtistDashboard' });
            } else if (userRole === 'playlist_maker') {
                next({ name: 'PlaylistMakerDashboard' });
            } else if (userRole === 'admin') {
                // Temporarily redirect to Home until admin views are implemented
                next({ name: 'Home' });
            } else {
                // Fallback to home if role is unknown
                next({ name: 'Home' });
            }
        }
    } else if (authStore.isAuthenticated && !authStore.hasRole && to.name !== 'RoleSelection') {
        // If authenticated but no role, and not already on role selection page
        next({ name: 'RoleSelection' });
    } else if (to.path === '/dashboard' && authStore.isAuthenticated) {
        // Redirect to appropriate dashboard based on user role
        const userRole = authStore.user?.role?.toLowerCase();

        if (userRole === 'artist') {
            next({ name: 'ArtistDashboard' });
        } else if (userRole === 'playlist_maker') {
            next({ name: 'PlaylistMakerDashboard' });
        } else if (userRole === 'admin') {
            // Temporarily redirect to Home until admin views are implemented
            next({ name: 'Home' });
        } else if (!userRole) {
            // If user has no role, send to role selection
            next({ name: 'RoleSelection' });
        } else {
            // Fallback to home if role is unknown
            next({ name: 'Home' });
        }
    } else {
        // Allow navigation
        next();
    }
});

export default router;
