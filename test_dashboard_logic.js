// Test script to verify the dashboard warnings logic

// Mock the hook behavior
function useMockDashboardStatus() {
  // Simulate a user who completed onboarding with selected integrations but no manual data yet
  const selectedIntegrations = ['steps', 'sleep', 'calendar'];
  
  // Device metrics data
  const allDeviceMetrics = [
    { id: 'steps', iconName: 'walk', label: 'Steps', value: 0.4, unit: '5,240 steps' },
    { id: 'sleep', iconName: 'moon', label: 'Sleep Quality', value: 0.8, unit: '7.5 hours' },
    { id: 'heart-rate', iconName: 'heart', label: 'Heart Rate', value: 0.8, unit: '68 bpm avg' },
  ];

  const allExternalMetrics = [
    { id: 'calendar', iconName: 'calendar', label: 'Calendar Stress', value: 0.4, unit: '8 meetings' },
    { id: 'weather', iconName: 'cloud', label: 'Weather', value: 0.6, unit: 'Stable pressure' },
  ];

  // Helper function to get status from value
  const getStatusFromValue = (value) => {
    if (value >= 0.8) return 'Excellent';
    if (value >= 0.6) return 'Good';
    if (value >= 0.4) return 'Fair';
    if (value >= 0.2) return 'Poor';
    return 'Critical';
  };

  // Get selected device and external metrics
  const deviceMetrics = allDeviceMetrics
    .filter(metric => selectedIntegrations.includes(metric.id))
    .map(metric => ({
      ...metric,
      status: getStatusFromValue(metric.value)
    }));

  const externalMetrics = allExternalMetrics
    .filter(metric => selectedIntegrations.includes(metric.id))
    .map(metric => ({
      ...metric,
      status: getStatusFromValue(metric.value)
    }));

  // Check if we have any data
  const hasDeviceData = deviceMetrics.length > 0;
  const hasExternalData = externalMetrics.length > 0;
  const hasAnyData = hasDeviceData || hasExternalData;

  return {
    meals: null, // No manual data entered yet
    hydration: null,
    alcohol: null,
    deviceMetrics,
    externalMetrics,
    overallStatus: hasAnyData ? 'Fair' : 'No Data', // Based on lowest metric
    lastUpdated: hasAnyData ? new Date().toISOString().split('T')[0] : null,
    hasAnyData
  };
}

// Test the logic
console.log('=== TESTING DASHBOARD WARNINGS AFTER ONBOARDING ===');

const dashboardStatus = useMockDashboardStatus();
console.log('Dashboard Status:', dashboardStatus);

// Test if warnings would be shown
const allMetrics = [];

// Manual metrics (should be empty)
if (dashboardStatus.meals) allMetrics.push({ type: 'manual', name: 'Meals' });
if (dashboardStatus.hydration) allMetrics.push({ type: 'manual', name: 'Hydration' });
if (dashboardStatus.alcohol) allMetrics.push({ type: 'manual', name: 'Alcohol' });

// Device metrics
dashboardStatus.deviceMetrics.forEach(metric => {
  allMetrics.push({ 
    type: 'device', 
    name: metric.label, 
    status: metric.status, 
    unit: metric.unit 
  });
});

// External metrics
dashboardStatus.externalMetrics.forEach(metric => {
  allMetrics.push({ 
    type: 'external', 
    name: metric.label, 
    status: metric.status, 
    unit: metric.unit 
  });
});

console.log('\n=== AVAILABLE METRICS ===');
allMetrics.forEach((metric, index) => {
  console.log(`${index + 1}. [${metric.type.toUpperCase()}] ${metric.name} - ${metric.status || 'N/A'}`);
});

console.log('\n=== TEST RESULTS ===');
console.log(`Has any data: ${dashboardStatus.hasAnyData}`);
console.log(`Total metrics shown: ${allMetrics.length}`);
console.log(`Would show device metrics immediately after onboarding: ${dashboardStatus.deviceMetrics.length > 0 ? 'YES' : 'NO'}`);
console.log(`Would show external metrics immediately after onboarding: ${dashboardStatus.externalMetrics.length > 0 ? 'YES' : 'NO'}`);

// Test what the DashboardWarnings component would show
if (!dashboardStatus.hasAnyData) {
  console.log('DashboardWarnings would show: Getting started message');
} else {
  console.log(`DashboardWarnings would show: ${allMetrics.length} metrics`);
}
