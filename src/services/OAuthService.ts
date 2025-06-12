import { useAuthStore } from '@/store';
import { Capacitor } from '@capacitor/core';
import { Router } from 'vue-router';

export interface OAuthCallbackData {
  access_token?: string;
  user?: string;
  isNewUser?: boolean;
  needsRoleSelection?: boolean;
  provider: string;
  linkedAccount?: boolean;
}

export interface OAuthErrorData {
  error: string;
}

export class OAuthService {
  private router: Router;
  private _authStore: ReturnType<typeof useAuthStore> | null = null;

  constructor(router: Router) {
    this.router = router;
  }

  // Lazy getter for auth store to avoid Pinia initialization issues
  private get authStore() {
    if (!this._authStore) {
      this._authStore = useAuthStore();
    }
    return this._authStore;
  }  /**
   * Unified OAuth callback handler for both mobile and web platforms
   */
  async handleOAuthCallback(params: URLSearchParams | OAuthCallbackData): Promise<void> {
    
    let callbackData: OAuthCallbackData;

    // Parse parameters based on input type
    if (params instanceof URLSearchParams) {

      const accessToken = params.get('access_token');
      const userData = params.get('user');
      const isNewUser = params.get('isNewUser') === 'true';
      const needsRoleSelection = params.get('needsRoleSelection') === 'true';
      const linkedAccount = params.get('linkedAccount') === 'true';
      const provider = params.get('provider') || '';
      
      if (linkedAccount && !accessToken) {
        
        // This is an account linking success - redirect to appropriate page
        await this.router.isReady();
        
        // Get current user role to determine which linked accounts page to redirect to
        const userRole = this.authStore.user?.role;
        
        // Special handling for PayPal account linking (for payment methods)
        if (provider === 'paypal') {
          // Redirect to payment methods page and reload the window
          this.router.push({
            name: 'PaymentMethods',
            query: { 
              success: 'paypal-connected',
              provider: provider,
              timestamp: Date.now().toString() // Force query param change for reload
            },
            replace: true
          }).then(() => {
            // Reload window to refresh payment methods data
            window.location.reload();
          });
          return;
        }
        
        // For non-PayPal account linking (like Spotify, YouTube), use existing logic
        if (userRole === 'artist') {
          this.router.push({
            name: 'ArtistLinkedAccounts',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        } else if (userRole === 'playlist_maker') {
          this.router.push({
            name: 'PlaylistMakerLinkedAccounts',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        } else {
          this.router.push({
            name: 'Profile',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        }
        return;
      }      if (!accessToken || !userData) {
        const errorMsg = `Missing required OAuth parameters: ${!accessToken ? 'access_token' : ''} ${!userData ? 'user' : ''}`;
        throw new Error(errorMsg);
      }

      callbackData = {
        access_token: accessToken,
        user: userData,
        isNewUser,
        needsRoleSelection,
        provider,
        linkedAccount
      };
    } else {
      callbackData = params;
      // Handle account linking in direct call format too
      if (callbackData.linkedAccount && !callbackData.access_token) {
        await this.router.isReady();
        
        // Special handling for PayPal account linking (payment methods)
        if (callbackData.provider === 'paypal') {
          // Redirect to payment methods page and reload the window
          this.router.push({
            name: 'PaymentMethods',
            query: { 
              success: 'paypal-connected',
              provider: callbackData.provider,
              timestamp: Date.now().toString() // Force query param change for reload
            },
            replace: true
          }).then(() => {
            // Reload window to refresh payment methods data
            window.location.reload();
          });
          return;
        }
        
        // Get current user role to determine which linked accounts page to redirect to
        const userRole = this.authStore.user?.role;
        
        if (userRole === 'artist') {
          this.router.push({
            name: 'ArtistLinkedAccounts',
            query: { 
              success: `${callbackData.provider}-connected`,
              provider: callbackData.provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        } else if (userRole === 'playlist_maker') {
          this.router.push({
            name: 'PlaylistMakerLinkedAccounts',
            query: { 
              success: `${callbackData.provider}-connected`,
              provider: callbackData.provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        } else {
          // Fallback to profile page
          this.router.push({
            name: 'Profile',
            query: { 
              success: `${callbackData.provider}-connected`,
              provider: callbackData.provider
            },
            replace: true
          }).then(() => {
            // Reload window to refresh linked accounts data
            window.location.reload();
          });
        }
        return;
      }
    }

    // Only proceed with authentication if we have tokens (login/registration flow)
    if (!callbackData.access_token || !callbackData.user) {
      throw new Error('Missing authentication data');
    }

    // Parse user data
    let user;
    try {
      user = typeof callbackData.user === 'string' 
        ? JSON.parse(callbackData.user) 
        : callbackData.user;
    } catch (error) {
      console.error('Failed to parse OAuth user data:', error);
      throw new Error('Invalid OAuth user data');
    }

    // Store authentication data using the auth store
    await this.authStore.setAuthData(callbackData.access_token, user);

    // Navigate based on user state
    await this.router.isReady();
    
    if (callbackData.isNewUser || callbackData.needsRoleSelection) {
      this.router.push({
        name: 'RoleSelection',
        query: { 
          provider: callbackData.provider, 
          status: 'success' 
        },
        replace: true
      });
    } else {
      this.router.push({
        name: 'Dashboard',
        query: { status: 'success' },
        replace: true
      });
    }
  }
  /**
   * Unified OAuth error handler for both mobile and web platforms
   */
  async handleOAuthError(error: string): Promise<void> {
    
    await this.router.isReady();
    this.router.push({
      name: 'Login',
      query: { error: encodeURIComponent(error || 'OAuth authentication failed') },
      replace: true
    });
  }  /**
   * Handle mobile deep link OAuth callback
   */
  async handleMobileCallback(url: string): Promise<void> {
    
    try {

      // Simpler approach: First, check if this is an OAuth URL
      const isOAuthCallback = url.includes('oauth/callback');
      const isOAuthError = url.includes('oauth/error');
      
      
      if (!isOAuthCallback && !isOAuthError) {
        return;
      }
      
      // Extract parameters from the URL
      let queryString = '';
      
      // Look for query string after '?'
      const questionMarkIndex = url.indexOf('?');
      if (questionMarkIndex !== -1) {
        queryString = url.substring(questionMarkIndex + 1);
      } else {
        return;
      }
      
      // Create a URLSearchParams object from the query string
      const params = new URLSearchParams(queryString);
      
      if (isOAuthCallback) {
        await this.handleOAuthCallback(params);
      } else if (isOAuthError) {
        const error = params.get('error') || 'OAuth authentication failed';
        await this.handleOAuthError(error);
      }
    } catch (error) {
      throw error; // Re-throw to be caught by the caller
    }
  }

  /**
   * Handle web OAuth redirect
   */
  async handleWebCallback(query: Record<string, any>): Promise<boolean> {
    const isOAuthRedirect = query.provider && query.status === 'success';
    
    if (isOAuthRedirect) {
      try {
        const params = new URLSearchParams();
        Object.keys(query).forEach(key => {
          if (query[key] !== undefined) {
            params.set(key, String(query[key]));
          }
        });
        
        await this.handleOAuthCallback(params);
        return true;    } catch (error) {
        console.error('OAuth web callback failed:', error);
        await this.handleOAuthError('OAuth authentication failed');
        return true;
      }
    }
    
    return false;
  }
}
