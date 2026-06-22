import axios from 'axios';

interface WeatherResponse {
  temperature: number;
  humidity: number;
}

export const fetchLiveWeather = async (city: string): Promise<WeatherResponse | null> => {
  try {
    // 1. Geocode city to coords
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' }
    });

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return null;
    }

    const { latitude, longitude } = geoRes.data.results[0];

    // 2. Fetch current weather
    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m',
      }
    });

    const current = weatherRes.data.current;
    
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m
    };
  } catch (error) {
    console.error('Weather fetching failed:', error);
    return null;
  }
};
