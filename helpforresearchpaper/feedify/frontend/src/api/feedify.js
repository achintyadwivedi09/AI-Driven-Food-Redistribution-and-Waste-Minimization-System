import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

const MOCK_ANALYTICS = {
  summary: {
    total_food_saved: 3909.6,
    total_waste: 0,
    waste_reduction_percentage: 17.0,
    total_meals_served: 9774,
  },
  model_metrics: { r2: 0.849, rmse: 3.92, mae: 2.92, mape: 12.75 },
  recent_allocations: [
    {
      allocation_id: '1', donors: { food_type: 'Biryani', city: 'Mumbai' },
      ngos: { ngo_name: 'Asha Foundation' }, allocated_quantity: 25,
      priority_score: 0.977, created_at: new Date().toISOString(),
    },
    {
      allocation_id: '2', donors: { food_type: 'Rice', city: 'Delhi' },
      ngos: { ngo_name: 'Roti Bank Delhi' }, allocated_quantity: 18,
      priority_score: 0.954, created_at: new Date().toISOString(),
    },
    {
      allocation_id: '3', donors: { food_type: 'Sabzi', city: 'Chennai' },
      ngos: { ngo_name: 'Chennai Food Trust' }, allocated_quantity: 32,
      priority_score: 0.931, created_at: new Date().toISOString(),
    },
    {
      allocation_id: '4', donors: { food_type: 'Roti', city: 'Bengaluru' },
      ngos: { ngo_name: 'Seva Sangam' }, allocated_quantity: 15,
      priority_score: 0.912, created_at: new Date().toISOString(),
    },
    {
      allocation_id: '5', donors: { food_type: 'Dal', city: 'Kolkata' },
      ngos: { ngo_name: 'Jan Seva' }, allocated_quantity: 40,
      priority_score: 0.898, created_at: new Date().toISOString(),
    },
  ],
};

export const predictSurplus = async (formData) => {
  try {
    const res = await api.post('/predict-surplus', formData);
    return { data: res.data, error: null };
  } catch (err) {
    console.error('predictSurplus failed:', err);
    return { data: null, error: err.response?.data?.detail || err.message };
  }
};

export const allocateFood = async (payload) => {
  try {
    const res = await api.post('/allocate', payload);
    return { data: res.data, error: null };
  } catch (err) {
    console.error('allocateFood failed:', err);
    return { data: null, error: err.response?.data?.detail || err.message };
  }
};

export const fetchAnalytics = async () => {
  try {
    const res = await api.get('/analytics');
    return { data: res.data, error: null };
  } catch (err) {
    console.error('fetchAnalytics failed:', err);
    return { data: null, error: err.response?.data?.detail || err.message };
  }
};

export const fetchNGOs = async (city = null) => {
  try {
    const res = await api.get('/ngos', { params: city ? { city } : {} });
    return { data: res.data, error: null };
  } catch (err) {
    console.error('fetchNGOs failed:', err);
    return { data: null, error: err.response?.data?.detail || err.message };
  }
};
