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
  }
  /**
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
      const provider = params.get('provider') || '';      // Check if this is account linking flow (no access_token but linkedAccount=true)
      if (linkedAccount && !accessToken) {
        // This is an account linking success - redirect to appropriate linked accounts page
        await this.router.isReady();
        
        // Get current user role to determine which linked accounts page to redirect to
        const userRole = this.authStore.user?.role;
        
        if (userRole === 'artist') {
          this.router.push({
            name: 'ArtistLinkedAccounts',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          });
        } else if (userRole === 'playlist_maker') {
          this.router.push({
            name: 'PlaylistMakerLinkedAccounts',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          });
        } else {
          // Fallback to profile page
          this.router.push({
            name: 'Profile',
            query: { 
              success: `${provider}-connected`,
              provider: provider
            },
            replace: true
          });
        }
        return;
      }

      if (!accessToken || !userData) {
        throw new Error('Missing required OAuth parameters');
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
          });
        } else if (userRole === 'playlist_maker') {
          this.router.push({
            name: 'PlaylistMakerLinkedAccounts',
            query: { 
              success: `${callbackData.provider}-connected`,
              provider: callbackData.provider
            },
            replace: true
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
  }

  /**
   * Handle mobile deep link OAuth callback
   */
  async handleMobileCallback(url: string): Promise<void> {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (urlObj.pathname === '/oauth/callback') {
      await this.handleOAuthCallback(params);
    } else if (urlObj.pathname === '/oauth/error') {
      const error = params.get('error') || 'OAuth authentication failed';
      await this.handleOAuthError(error);
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
