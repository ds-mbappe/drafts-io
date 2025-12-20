// hooks/useAuthFetcher.ts
import { useContext } from 'react';
import { NextSessionContext } from '@/contexts/SessionContext';

export const useAuthFetcher = () => {
  const { session } = useContext(NextSessionContext);
  const token = session?.accessToken;

  const fetcher = async (url: string) => {
    if (!token) throw new Error('No authentication token');
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
    });
    
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

    return res.json();
  };

  return { fetcher, token };
};