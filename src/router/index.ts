import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store';
import { OAuthService } from '@/services/OAuthService';
import { Capacitor } from '@capacitor/core';

// Lazy load views for better performance
const Home = () => import('@/views/Home.vue');
const Login = () => import('@/views/Login.vue');
const EmailConfirmation = () => import('@/views/EmailConfirmation.vue');
const EmailConfirmationHandler = () => import('@/views/EmailConfirmationHandler.vue');
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
const ArtistPaymentMethods = () => import('@/views/PaymentMethods.vue');
const ArtistLinkedAccounts = () => import('@/views/artist/LinkedAccounts.vue');

// Unified profile component
const ProfileComponent = () => import('@/components/ProfileComponent.vue');

// Playlist maker routes
const PlaylistMakerPlaylists = () => import('@/views/playlist-maker/Playlists.vue');
const PlaylistMakerSubmissions = () => import('@/views/playlist-maker/Submissions.vue');
const PlaylistMakerSubmissionDetail = () => import('@/views/playlist-maker/SubmissionDetail.vue');
const PlaylistMakerPaymentMethods = () => import('@/views/PaymentMethods.vue');
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
const OAuthHandler = () => import('@/views/OAuthHandler.vue');

// Payment callback routes
const PaymentSuccess = () => import('@/views/PaymentSuccess.vue');

const routes: Array<RouteRecordRaw> = [    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: false }
    },    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, guestOnly: true }
    },    {
        path: '/confirm-email',
        name: 'EmailConfirmation',
        component: EmailConfirmation,
        meta: { requiresAuth: true, skipEmailConfirmation: true }
    },
    {
        path: '/confirm-email-token',
        name: 'EmailConfirmationHandler',
        component: EmailConfirmationHandler,
        meta: { requiresAuth: false }
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
    },    {
        path: '/artist/profile',
        redirect: '/profile'
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
    },    {
        path: '/playlist-maker/profile',
        redirect: '/profile'
    },
    {
        path: '/playlist-maker/payment-methods',
        name: 'PlaylistMakerPaymentMethods',
        component: PlaylistMakerPaymentMethods,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },
    {
        path: '/playlist-maker/linked-accounts',
        name: 'PlaylistMakerLinkedAccounts',
        component: PlaylistMakerLinkedAccounts,
        meta: { requiresAuth: true, role: 'playlist_maker' }
    },// Admin routes
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
        meta: { requiresAuth: true, role: 'admin' }    },
    */
      // Shared routes for all authenticated users
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileComponent,
        meta: { requiresAuth: true }
    },
    {
        path: '/payment-methods',
        name: 'PaymentMethods',
        component: ArtistPaymentMethods, // Reusing the same component as it's role-agnostic
        meta: { requiresAuth: true }
    },
    {
        path: '/balance',
        name: 'Balance',
        component: () => import('@/views/Balance.vue'),
        meta: { requiresAuth: true }
    },

    // OAuth callback routes
    {
        path: '/oauth/callback',
        name: 'OAuthCallback',
        component: OAuthHandler,
        meta: { requiresAuth: false }
    },
    {
        path: '/oauth/link-callback',
        name: 'OAuthLinkCallback',
        component: OAuthCallback,
        meta: { requiresAuth: true }
    },
    // Payment callback routes
    {
        path: '/payment/success',
        name: 'PaymentSuccess',
        component: PaymentSuccess,
        meta: { requiresAuth: true }
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

// Global OAuth service instance
let globalOAuthService: OAuthService | null = null;

// Function to get or create OAuth service instance
function getOAuthService(): OAuthService {
    if (!globalOAuthService) {
        globalOAuthService = new OAuthService(router);
        
        // Set up mobile deep links if on native platform
        if (Capacitor.isNativePlatform()) {
            // Use dynamic import to avoid immediate initialization
            import('@capacitor/app').then(({ App: CapacitorApp }) => {
                CapacitorApp.addListener('appUrlOpen', async (event) => {
                    try {
                        await globalOAuthService!.handleMobileCallback(event.url);
                    } catch (error) {
                        console.error('Mobile OAuth callback failed:', error);
                        await globalOAuthService!.handleOAuthError('OAuth authentication failed');
                    }
                });
            });
        }
    }
    return globalOAuthService;
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    // Always initialize from storage before checking auth
    await authStore.initializeFromStorage();
    
    // Handle OAuth redirects using the unified OAuth service for web platform
    // Skip OAuth handling if we're going to RoleSelection or Dashboard with OAuth parameters (let the component handle it)
    if (!Capacitor.isNativePlatform() && 
        !((to.name === 'RoleSelection' && to.query.access_token) || 
          (to.name === 'Dashboard' && to.query.access_token))) {
        const oauthService = getOAuthService();
        const isOAuthHandled = await oauthService.handleWebCallback(to.query);
        if (isOAuthHandled) {
            // OAuth service handled the redirect, don't proceed with normal routing
            return;
        }
    }    
    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const guestOnly = to.matched.some(record => record.meta.guestOnly);
    const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;
    const allowNoRole = to.matched.some(record => record.meta.allowNoRole);
    const skipEmailConfirmation = to.matched.some(record => record.meta.skipEmailConfirmation);

    // Special handling for Dashboard and RoleSelection with OAuth parameters
    if ((to.name === 'Dashboard' || to.name === 'RoleSelection') && to.query.access_token) {
        // Allow these routes to handle OAuth authentication themselves
        next();
        return;
    }    if (requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login if user is not authenticated
        next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (guestOnly && authStore.isAuthenticated) {
        // Redirect to dashboard if user is authenticated and tries to access guest-only pages
        next({ name: 'Dashboard' });
    } else if (requiresAuth && authStore.isAuthenticated && !authStore.isEmailConfirmed && !skipEmailConfirmation) {
        // Redirect to email confirmation if user is authenticated but email is not confirmed
        next({ name: 'EmailConfirmation' });
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
