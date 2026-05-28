// hooks/useAuthFetcher.ts
import { useContext } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { errorToast } from '@/actions/showToast';
import { backendUrl } from '@/lib/backend';
import { isTokenExpired } from '@/lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetcherOptions {
  method?: HttpMethod;
  body?: any;
  headers?: HeadersInit;
}

export const useAuthFetcher = () => {
  const { session, setSession } = useContext(NextSessionContext);
  const token = session?.accessToken;

  const fetcher = async (url: string, options: FetcherOptions = {}) => {
    let currentSession = session;

    if (!currentSession || !currentSession.accessToken || isTokenExpired(currentSession.accessToken)) {
      currentSession = await getSession();

      setSession(currentSession);
    }

    if (!currentSession?.accessToken || isTokenExpired(currentSession.accessToken)) {
      errorToast('Your session has expired, please sign in again.');
      await signOut({ callbackUrl: '/account/sign-in' });

      throw new Error('No valid token');
    }

    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${currentSession.accessToken}`,
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData - browser will set it with boundary
        config.body = body;
      } else {
        // JSON body
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        };
        config.body = JSON.stringify(body);
      }
    } else if (method === 'GET' || method === 'DELETE') {
      // Set Content-Type for GET/DELETE when no body is provided
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
    }
    
    let res = await fetch(backendUrl(url), config);

    if (res.status === 401) {
      const refreshedSession = await getSession();

      if (refreshedSession?.accessToken && refreshedSession.accessToken !== currentSession.accessToken) {
        // New token obtained — retry once.
        setSession(refreshedSession);
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${refreshedSession.accessToken}`,
        };
        res = await fetch(backendUrl(url), config);

        // Still 401 after refresh — session is truly dead.
        if (res.status === 401) {
          errorToast('Your session has expired. Please sign in again.');
          await signOut({ callbackUrl: '/account/sign-in' });
          throw new Error('Session expired');
        }
      } else {
        // No new token available — session is expired.
        errorToast('Your session has expired. Please sign in again.');
        await signOut({ callbackUrl: '/account/sign-in' });
        throw new Error('Session expired');
      }
    }

    if (!res.ok) {
      errorToast(`Failed to fetch: ${res.statusText}`);
      throw new Error();
    }

    return res.json();
  };

  return { fetcher, token };
};
