import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, setCurrentUser, getAllUsers, User } from '../types/user';

interface AuthContextType {
  ownerId: number;
  setOwnerId: (id: number) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    return getCurrentUser();
  });

  const [ownerId, setOwnerIdState] = useState<number>(() => {
    const currentUser = getCurrentUser();
    return currentUser?.id || 1;
  });

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    setCurrentUser(newUser);
    if (newUser) {
      setOwnerIdState(newUser.id);
    }
  };

  const setOwnerId = (id: number) => {
    setOwnerIdState(id);
    // Try to find user by ID
    const users = getAllUsers();
    const foundUser = users.find((u: User) => u.id === id);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setOwnerIdState(user.id);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      ownerId, 
      setOwnerId, 
      user, 
      setUser,
      isAuthenticated: !!user 
    }}>
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
