import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store';
import { OAuthService } from '@/services/OAuthService';
import { Capacitor } from '@capacitor/core';
import { toastController } from '@ionic/vue';

const Home = () => import('@/views/Home.vue');
const Login = () => import('@/views/Login.vue');
const EmailConfirmation = () => import('@/views/EmailConfirmation.vue');
const EmailConfirmationHandler = () => import('@/views/EmailConfirmationHandler.vue');
const Dashboard = () => import('@/views/Dashboard.vue');
const RoleSelection = () => import('@/views/RoleSelection.vue');
const ArtistDashboard = () => import('@/views/artist/Dashboard.vue');
const PlaylistMakerDashboard = () => import('@/views/playlist-maker/Dashboard.vue');
const AdminDashboard = () => import('@/views/admin/Dashboard.vue');
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

// Admin routes
const AdminUsers = () => import('@/views/admin/Users.vue');
const AdminPlaylists = () => import('@/views/admin/Playlists.vue');
const AdminSongs = () => import('@/views/admin/Songs.vue');
const AdminSubmissions = () => import('@/views/admin/Submissions.vue');
const AdminTransactions = () => import('@/views/admin/Transactions.vue');
const AdminWithdrawals = () => import('@/views/admin/Withdrawals.vue');
const AdminActions = () => import('@/views/admin/Actions.vue');
const AdminLinkedAccounts = () => import('@/views/admin/LinkedAccounts.vue');
const AdminPaymentMethods = () => import('@/views/admin/PaymentMethods.vue');

// OAuth callback routes
const OAuthCallback = () => import('@/views/OAuthCallback.vue');
const OAuthHandler = () => import('@/views/OAuthHandler.vue');

// Payment callback routes
const PaymentSuccess = () => import('@/views/PaymentSuccess.vue');

const routes: Array<RouteRecordRaw> = [{
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
}, {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, guestOnly: true }
}, {
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
{
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
}, {
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
}, {
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
},
// Admin routes
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
}, {
    path: '/admin/withdrawals',
    name: 'AdminWithdrawals',
    component: AdminWithdrawals,
    meta: { requiresAuth: true, role: 'admin' }
},
{
    path: '/admin/linked-accounts',
    name: 'AdminLinkedAccounts',
    component: AdminLinkedAccounts,
    meta: { requiresAuth: true, role: 'admin' }
},
{
    path: '/admin/payment-methods',
    name: 'AdminPaymentMethods',
    component: AdminPaymentMethods,
    meta: { requiresAuth: true, role: 'admin' }
},
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
    component: ArtistPaymentMethods,
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
    }
    return globalOAuthService;
}

// Initialize OAuth service early to ensure deep link handlers are registered
// This is especially important for mobile OAuth callbacks
if (Capacitor.isNativePlatform()) {
    // Initialize OAuth service immediately
    const oauthService = getOAuthService();

    // Set up mobile deep links for OAuth callbacks
    import('@capacitor/app').then(({ App: CapacitorApp }) => {
        // Show toast instead of console log
        CapacitorApp.addListener('appUrlOpen', async (event) => {
            try {
                const url = event.url.toLowerCase();

                if (url.includes('oauth/callback') || url.includes('oauth/error')) {
                    await oauthService.handleMobileCallback(event.url);
                }                else if (url.includes('payment/success')) {
                    // Extract PayPal parameters from the URL
                    const urlParts = url.split('?');
                    const params = urlParts.length > 1 ? new URLSearchParams(urlParts[1]) : new URLSearchParams();
                    const paymentId = params.get('paymentId');
                    const payerId = params.get('PayerID');

                    // Navigate to payment success view with the same parameters
                    router.push({
                        path: '/payment/success',
                        query: {
                            paymentId,
                            PayerID: payerId
                        }
                    });
                }                else if (url.includes('payment/cancel')) {
                    // Navigate back to the submission page
                    router.push('/artist/submissions/new');
                }
                else if (url.includes('artist/submissions/new')) {
                    // Handle direct deep link to new submission page (e.g., from payment cancellation)
                    router.push('/artist/submissions/new');
                }
            } catch (error) {
                console.error('Deep link handling error:', error);
            }
        });
    });
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Always initialize from storage before checking auth
    await authStore.initializeFromStorage();
    // Handle OAuth redirects using the unified OAuth service for web platform
    // Skip OAuth handling if we're going to dedicated OAuth callback routes or specific routes with OAuth parameters
    if (!Capacitor.isNativePlatform() &&
        to.name !== 'OAuthCallback' &&
        to.name !== 'OAuthLinkCallback' &&
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
    const skipEmailConfirmation = to.matched.some(record => record.meta.skipEmailConfirmation);

    // Special handling for Dashboard and RoleSelection with OAuth parameters
    if ((to.name === 'Dashboard' || to.name === 'RoleSelection') && to.query.access_token) {
        // Allow these routes to handle OAuth authentication themselves
        next();
        return;
    } if (requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login if user is not authenticated
        next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (guestOnly && authStore.isAuthenticated) {
        // Redirect to dashboard if user is authenticated and tries to access guest-only pages
        next({ name: 'Dashboard' });
    } else if (requiresAuth && authStore.isAuthenticated && !authStore.isEmailConfirmed && !skipEmailConfirmation && to.name !== 'EmailConfirmationHandler') {
        // Redirect to email confirmation if user is authenticated but email is not confirmed
        // This takes priority over role selection
        // BUT allow access to EmailConfirmationHandler route so users can actually confirm their email
        next({ name: 'EmailConfirmation' });
    } else if (authStore.isAuthenticated && !authStore.hasRole && to.name !== 'RoleSelection' && to.name !== 'EmailConfirmation' && to.name !== 'EmailConfirmationHandler') {
        // If authenticated, email confirmed, but no role, and not already on role selection or email confirmation page
        next({ name: 'RoleSelection' });
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
                next({ name: 'AdminDashboard' });
            } else {
                // Fallback to home if role is unknown
                next({ name: 'Home' });
            }
        }
    } else if (to.path === '/dashboard' && authStore.isAuthenticated) {
        // Redirect to appropriate dashboard based on user role
        const userRole = authStore.user?.role?.toLowerCase();

        if (userRole === 'artist') {
            next({ name: 'ArtistDashboard' });
        } else if (userRole === 'playlist_maker') {
            next({ name: 'PlaylistMakerDashboard' });
        } else if (userRole === 'admin') {
            next({ name: 'AdminDashboard' });
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
