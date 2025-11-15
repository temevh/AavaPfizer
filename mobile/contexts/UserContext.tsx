import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
  name: string;
  ageBracket: string;
  integrations: string[];
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  updateName: (name: string) => void;
  updateAgeBracket: (ageBracket: string) => void;
  updateIntegrations: (integrations: string[]) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  const updateName = (name: string) => {
    setUserData(prev => prev ? { ...prev, name } : { name, ageBracket: '', integrations: [] });
  };

  const updateAgeBracket = (ageBracket: string) => {
    setUserData(prev => prev ? { ...prev, ageBracket } : { name: '', ageBracket, integrations: [] });
  };

  const updateIntegrations = (integrations: string[]) => {
    setUserData(prev => prev ? { ...prev, integrations } : { name: '', ageBracket: '', integrations });
  };

  const clearUserData = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, updateName, updateAgeBracket, updateIntegrations, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}