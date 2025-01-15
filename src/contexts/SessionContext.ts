import { createContext, useContext } from 'react';

export const NextSessionContext = createContext<any | null | undefined>({
  session: null,
  setSession: () => {}
});

export const useNextSessionContext = (): any | null | undefined => {
  const context = useContext(NextSessionContext);

  if (!context) {
    throw new Error('useNextSessionContext must be used within a NextSessionProvider');
  }
  return context;
};