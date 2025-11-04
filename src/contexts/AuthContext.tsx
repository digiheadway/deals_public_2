import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  ownerId: number;
  setOwnerId: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ownerId, setOwnerIdState] = useState<number>(() => {
    const stored = localStorage.getItem('owner_id');
    return stored ? parseInt(stored, 10) : 1;
  });

  const setOwnerId = (id: number) => {
    setOwnerIdState(id);
    localStorage.setItem('owner_id', id.toString());
  };

  useEffect(() => {
    localStorage.setItem('owner_id', ownerId.toString());
  }, [ownerId]);

  return (
    <AuthContext.Provider value={{ ownerId, setOwnerId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
