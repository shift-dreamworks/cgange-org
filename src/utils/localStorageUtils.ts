import { OrgNode } from './orgChartUtils';
import { LayoutType } from '../components/ui/layout-selector';

const CURRENT_CHART_KEY = 'org-chart-current';
const CHARTS_LIST_KEY = 'org-chart-list';
const LAYOUT_PREFERENCE_KEY = 'org-chart-layout';

export interface SavedChart {
  id: string;
  name: string;
  timestamp: number;
  data: OrgNode;
}

/**
 * Save the current chart to localStorage
 */
export const saveCurrentChart = (data: OrgNode): void => {
  try {
    localStorage.setItem(CURRENT_CHART_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save current chart:', error);
  }
};

/**
 * Load the current chart from localStorage
 */
export const loadCurrentChart = (): OrgNode | null => {
  try {
    const savedData = localStorage.getItem(CURRENT_CHART_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Failed to load current chart:', error);
  }
  return null;
};

/**
 * Save a chart with a name
 */
export const saveChart = (name: string, data: OrgNode): SavedChart => {
  try {
    const charts = getSavedCharts();
    
    const newChart: SavedChart = {
      id: `chart-${Date.now()}`,
      name,
      timestamp: Date.now(),
      data,
    };
    
    charts.push(newChart);
    localStorage.setItem(CHARTS_LIST_KEY, JSON.stringify(charts));
    
    return newChart;
  } catch (error) {
    console.error('Failed to save chart:', error);
    throw error;
  }
};

/**
 * Get all saved charts
 */
export const getSavedCharts = (): SavedChart[] => {
  try {
    const savedCharts = localStorage.getItem(CHARTS_LIST_KEY);
    if (savedCharts) {
      return JSON.parse(savedCharts);
    }
  } catch (error) {
    console.error('Failed to get saved charts:', error);
  }
  return [];
};

/**
 * Load a saved chart by ID
 */
export const loadChart = (id: string): OrgNode | null => {
  try {
    const charts = getSavedCharts();
    const chart = charts.find(c => c.id === id);
    if (chart) {
      saveCurrentChart(chart.data);
      return chart.data;
    }
  } catch (error) {
    console.error('Failed to load chart:', error);
  }
  return null;
};

/**
 * Delete a saved chart
 */
export const deleteChart = (id: string): boolean => {
  try {
    const charts = getSavedCharts();
    const newCharts = charts.filter(c => c.id !== id);
    localStorage.setItem(CHARTS_LIST_KEY, JSON.stringify(newCharts));
    return true;
  } catch (error) {
    console.error('Failed to delete chart:', error);
    return false;
  }
};

/**
 * Export chart data as JSON string
 */
export const exportChart = (data: OrgNode): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Import chart data from JSON string
 */
export const importChart = (jsonString: string): OrgNode | null => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data && typeof data === 'object' && 'id' in data && 'name' in data && 'title' in data) {
      return data as OrgNode;
    } else {
      throw new Error('Invalid chart data format');
    }
  } catch (error) {
    console.error('Failed to import chart:', error);
    return null;
  }
};

/**
 * Save layout preference to localStorage
 */
export const saveLayoutPreference = (layout: LayoutType): void => {
  try {
    localStorage.setItem(LAYOUT_PREFERENCE_KEY, layout);
  } catch (error) {
    console.error('Failed to save layout preference:', error);
  }
};

/**
 * Load layout preference from localStorage
 */
export const loadLayoutPreference = (): LayoutType => {
  try {
    const savedLayout = localStorage.getItem(LAYOUT_PREFERENCE_KEY);
    if (savedLayout && ['vertical', 'horizontal', 'radial', 'compact'].includes(savedLayout)) {
      return savedLayout as LayoutType;
    }
  } catch (error) {
    console.error('Failed to load layout preference:', error);
  }
  return 'vertical'; // Default layout
};
