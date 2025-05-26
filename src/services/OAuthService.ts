import { useAuthStore } from '@/store';
import { Capacitor } from '@capacitor/core';
import { Router } from 'vue-router';

export interface OAuthCallbackData {
  access_token: string;
  user: string;
  isNewUser: boolean;
  needsRoleSelection: boolean;
  provider: string;
}

export interface OAuthErrorData {
  error: string;
}

export class OAuthService {
  private router: Router;
  private authStore: ReturnType<typeof useAuthStore>;

  constructor(router: Router) {
    this.router = router;
    this.authStore = useAuthStore();
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
      const provider = params.get('provider') || '';

      if (!accessToken || !userData) {
        throw new Error('Missing required OAuth parameters');
      }

      callbackData = {
        access_token: accessToken,
        user: userData,
        isNewUser,
        needsRoleSelection,
        provider
      };
    } else {
      callbackData = params;
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
        return true;
      } catch (error) {
        console.error('OAuth web callback failed:', error);
        await this.handleOAuthError('OAuth authentication failed');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Initialize OAuth service for the current platform
   */
  static initialize(router: Router): OAuthService {
    const service = new OAuthService(router);
    
    // Set up mobile deep link handling if on native platform
    if (Capacitor.isNativePlatform()) {
      service.setupMobileDeepLinks();
    }
    
    return service;
  }

  /**
   * Set up mobile deep link listeners
   */
  private async setupMobileDeepLinks(): Promise<void> {
    const { App: CapacitorApp } = await import('@capacitor/app');
    
    CapacitorApp.addListener('appUrlOpen', async (event) => {
      try {
        await this.handleMobileCallback(event.url);
      } catch (error) {
        console.error('Mobile OAuth callback failed:', error);
        await this.handleOAuthError('OAuth authentication failed');
      }
    });
  }
}
