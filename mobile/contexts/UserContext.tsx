import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DashboardMetric {
  value: number; // 0-1 scale
  status: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
  unit: string;
}

interface DashboardData {
  date: string; // YYYY-MM-DD format
  meals: DashboardMetric;
  hydration: DashboardMetric;
  alcohol: DashboardMetric;
}

interface UserData {
  name: string;
  ageBracket: string;
  integrations: string[];
  dashboardData: DashboardData | null;
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  updateName: (name: string) => void;
  updateAgeBracket: (ageBracket: string) => void;
  updateIntegrations: (integrations: string[]) => void;
  updateDashboardData: (mealsCount: number, waterCount: number, alcoholCount: number) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  // Helper function to get status from value
  const getStatusFromValue = (value: number): 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent' => {
    if (value >= 0.8) return 'Excellent';
    if (value >= 0.6) return 'Good';
    if (value >= 0.4) return 'Fair';
    if (value >= 0.2) return 'Poor';
    return 'Critical';
  };

  // Helper function to get today's date string
  const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Check if dashboard data needs to be reset (new day)
  const checkAndResetDashboardData = () => {
    if (userData?.dashboardData) {
      const today = getTodayDateString();
      if (userData.dashboardData.date !== today) {
        // Reset dashboard data for new day
        setUserData(prev => prev ? {
          ...prev,
          dashboardData: null
        } : null);
      }
    }
  };

  // Check for day change on mount and when component updates
  useEffect(() => {
    checkAndResetDashboardData();
    
    // Set up a timer to check for day change at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      checkAndResetDashboardData();
      
      // Set up interval to check every 24 hours after that
      const intervalId = setInterval(() => {
        checkAndResetDashboardData();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(intervalId);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array since we don't want this to re-run

  const updateName = (name: string) => {
    setUserData(prev => prev ? { ...prev, name } : { 
      name, 
      ageBracket: '', 
      integrations: [], 
      dashboardData: null 
    });
  };

  const updateAgeBracket = (ageBracket: string) => {
    setUserData(prev => prev ? { ...prev, ageBracket } : { 
      name: '', 
      ageBracket, 
      integrations: [], 
      dashboardData: null 
    });
  };

  const updateIntegrations = (integrations: string[]) => {
    setUserData(prev => prev ? { ...prev, integrations } : { 
      name: '', 
      ageBracket: '', 
      integrations, 
      dashboardData: null 
    });
  };

  const updateDashboardData = (mealsCount: number, waterCount: number, alcoholCount: number) => {
    const today = getTodayDateString();
    
    // Calculate values (0-1 scale) and status
    const mealsValue = mealsCount / 5; // Assuming 5 meals is the max/ideal
    const hydrationValue = waterCount / 10; // Assuming 10 glasses is the max/ideal
    const alcoholValue = alcoholCount === 0 ? 1.0 : Math.max(0, 1 - (alcoholCount / 5)); // Less alcohol = better score

    const dashboardData: DashboardData = {
      date: today,
      meals: {
        value: Math.min(mealsValue, 1), // Cap at 1
        status: getStatusFromValue(Math.min(mealsValue, 1)),
        unit: `${mealsCount} meals today`
      },
      hydration: {
        value: Math.min(hydrationValue, 1), // Cap at 1
        status: getStatusFromValue(Math.min(hydrationValue, 1)),
        unit: `${waterCount} glasses`
      },
      alcohol: {
        value: alcoholValue,
        status: getStatusFromValue(alcoholValue),
        unit: alcoholCount === 0 ? 'None today' : `${alcoholCount} units`
      }
    };

    setUserData(prev => prev ? { 
      ...prev, 
      dashboardData 
    } : { 
      name: '', 
      ageBracket: '', 
      integrations: [], 
      dashboardData 
    });
  };

  const clearUserData = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData, 
      updateName, 
      updateAgeBracket, 
      updateIntegrations, 
      updateDashboardData,
      clearUserData 
    }}>
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