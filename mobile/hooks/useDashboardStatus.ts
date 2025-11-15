import { useUser } from '../contexts/UserContext';

export interface DashboardStatus {
  meals: {
    status: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
    value: number;
    unit: string;
  } | null;
  hydration: {
    status: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
    value: number;
    unit: string;
  } | null;
  alcohol: {
    status: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
    value: number;
    unit: string;
  } | null;
  overallStatus: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'No Data';
  lastUpdated: string | null;
}

export function useDashboardStatus(): DashboardStatus {
  const { userData } = useUser();
  
  const dashboardData = userData?.dashboardData;
  
  if (!dashboardData) {
    return {
      meals: null,
      hydration: null,
      alcohol: null,
      overallStatus: 'No Data',
      lastUpdated: null
    };
  }

  // Calculate overall status as the lowest status among all metrics
  const statusValues = {
    'Excellent': 5,
    'Good': 4,
    'Fair': 3,
    'Poor': 2,
    'Critical': 1
  };

  const statuses = [
    dashboardData.meals.status,
    dashboardData.hydration.status,
    dashboardData.alcohol.status
  ];

  const minStatusValue = Math.min(...statuses.map(status => statusValues[status]));
  const overallStatus = Object.entries(statusValues).find(([, value]) => value === minStatusValue)?.[0] as 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';

  return {
    meals: {
      status: dashboardData.meals.status,
      value: dashboardData.meals.value,
      unit: dashboardData.meals.unit
    },
    hydration: {
      status: dashboardData.hydration.status,
      value: dashboardData.hydration.value,
      unit: dashboardData.hydration.unit
    },
    alcohol: {
      status: dashboardData.alcohol.status,
      value: dashboardData.alcohol.value,
      unit: dashboardData.alcohol.unit
    },
    overallStatus,
    lastUpdated: dashboardData.date
  };
}
