import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { City } from '../data/cities';

export interface DailyForecast {
  time: string;
  code: number;
  tempMax: number;
  tempMin: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  code: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  sunrise?: string;
  sunset?: string;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export function useWeather(city: City) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchWeather() {
      try {
        setLoading(true);
        setError(false);
        
        let lat = city.latitude;
        let lon = city.longitude;

        if (lat === undefined || lon === undefined) {
          // 1. Geocoding
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.name)}&count=1&language=en&format=json`);
          const geoData = await geoRes.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
          }
          
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        }
        
        // 2. Weather
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
        const weatherData = await weatherRes.json();
        
        if (mounted && weatherData.current && weatherData.daily) {
          const dailyForecasts: DailyForecast[] = weatherData.daily.time.map((time: string, index: number) => ({
            time,
            code: weatherData.daily.weather_code[index],
            tempMax: weatherData.daily.temperature_2m_max[index],
            tempMin: weatherData.daily.temperature_2m_min[index],
          }));

          const hourlyForecasts: HourlyForecast[] = weatherData.hourly.time.map((time: string, index: number) => ({
            time,
            temp: weatherData.hourly.temperature_2m[index],
            code: weatherData.hourly.weather_code[index],
            humidity: weatherData.hourly.relative_humidity_2m[index],
            windSpeed: weatherData.hourly.wind_speed_10m[index],
            feelsLike: weatherData.hourly.apparent_temperature[index],
          }));

          setWeather({
            temp: weatherData.current.temperature_2m,
            code: weatherData.current.weather_code,
            isDay: weatherData.current.is_day === 1,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: weatherData.current.wind_speed_10m,
            feelsLike: weatherData.current.apparent_temperature,
            sunrise: weatherData.daily.sunrise[0],
            sunset: weatherData.daily.sunset[0],
            daily: dailyForecasts,
            hourly: hourlyForecasts
          });
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchWeather();
    
    return () => { mounted = false; };
  }, [city.name]);

  return { weather, loading, error };
}

export function getWeatherAtTime(weather: WeatherData | null, time: Date, timezone: string) {
  if (!weather || !weather.hourly) return null;
  
  try {
    const targetTimeStr = formatInTimeZone(time, timezone, "yyyy-MM-dd'T'HH:00");
    const hourly = weather.hourly.find(h => h.time === targetTimeStr);
    
    const hour = parseInt(formatInTimeZone(time, timezone, 'H'), 10);
    const isDay = hour >= 6 && hour < 20;
    
    if (hourly) {
      return {
        temp: hourly.temp,
        code: hourly.code,
        humidity: hourly.humidity,
        windSpeed: hourly.windSpeed,
        feelsLike: hourly.feelsLike,
        sunrise: weather.sunrise,
        sunset: weather.sunset,
        isDay,
        daily: weather.daily
      };
    }
  } catch (e) {
    console.error('Error finding hourly weather', e);
  }
  
  const hour = parseInt(formatInTimeZone(time, timezone, 'H'), 10);
  const isDay = hour >= 6 && hour < 20;
  
  return {
    temp: weather.temp,
    code: weather.code,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    feelsLike: weather.feelsLike,
    sunrise: weather.sunrise,
    sunset: weather.sunset,
    isDay,
    daily: weather.daily
  };
}
