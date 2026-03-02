import React from 'react';
import { MapPin, Wind, Droplets, Thermometer, Loader2, Sunrise, Sunset, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { City } from '../data/cities';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useWeather, getWeatherAtTime } from '../hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';
import { RainAnimation, SnowAnimation, StarAnimation, MorningAnimation, AfternoonAnimation, EveningAnimation } from './BackgroundAnimations';
import { getDSTInfo } from '../lib/dst';

export interface CityCardProps {
  city: City;
  primaryCity: City;
  time: Date;
  onRemove: () => void;
  key?: string | number;
}

export function CityCard({ city, primaryCity, time, onRemove }: CityCardProps) {
  const dateString = formatInTimeZone(time, city.timezone, 'EEEE, MMM d');
  const ampm = formatInTimeZone(time, city.timezone, 'a');
  
  const getOffset = (tz: string) => {
    const offsetString = formatInTimeZone(time, tz, 'xxx');
    if (offsetString === 'Z') return 0;
    const sign = offsetString[0] === '+' ? 1 : -1;
    const hours = parseInt(offsetString.slice(1, 3), 10);
    const minutes = parseInt(offsetString.slice(4, 6), 10);
    return sign * (hours * 60 + minutes);
  };

  const cityOffset = getOffset(city.timezone);
  const primaryOffset = getOffset(primaryCity.timezone);
  
  const diffMinutes = cityOffset - primaryOffset;
  const absMinutes = Math.abs(diffMinutes);
  const h = Math.floor(absMinutes / 60);
  const m = absMinutes % 60;
  
  let diffString = '';
  if (diffMinutes === 0) {
    diffString = 'Same time';
  } else {
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    diffString = `${parts.join(' ')} ${diffMinutes > 0 ? 'ahead' : 'behind'}`;
  }

  const diffHours = diffMinutes / 60;

  const hour = parseInt(formatInTimeZone(time, city.timezone, 'H'), 10);
  const isMorning = hour >= 6 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 6;

  // Visual offset calculation
  const maxOffset = 14;
  const minOffset = -12;
  const totalRange = maxOffset - minOffset;
  const centerPct = ((0 - minOffset) / totalRange) * 100;
  const cityPct = ((diffHours - minOffset) / totalRange) * 100;
  const barWidth = Math.abs(cityPct - centerPct);
  const barLeft = Math.min(cityPct, centerPct);

  const { weather: rawWeather, loading: weatherLoading } = useWeather(city);
  const weather = getWeatherAtTime(rawWeather, time, city.timezone);

  const isRainy = weather && [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.code);
  const isSnowy = weather && [71, 73, 75, 77, 85, 86].includes(weather.code);

  const dstInfo = getDSTInfo(city.timezone, time);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 overflow-hidden flex flex-col justify-between min-h-[240px] shadow-sm transition-colors duration-500",
        isMorning ? "bg-sky-50 dark:bg-sky-950/20 text-sky-950 dark:text-sky-50" :
        isAfternoon ? "bg-blue-50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-50" :
        isEvening ? "bg-indigo-900 dark:bg-indigo-950/40 text-indigo-50" :
        "bg-[#1a1b35] dark:bg-zinc-900 text-white"
      )}
    >
      {/* Dynamic Time Animations */}
      {isMorning && <MorningAnimation />}
      {isAfternoon && <AfternoonAnimation />}
      {isEvening && <EveningAnimation />}
      {isNight && <StarAnimation />}

      {/* Dynamic Weather Animations */}
      {isRainy && <RainAnimation />}
      {isSnowy && <SnowAnimation />}
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium tracking-tight">{city.name}</h3>
            <a 
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}`}
              target="_blank"
              rel="noreferrer"
              className="opacity-40 hover:opacity-100 transition-opacity"
              title={`View ${city.name} on Wikipedia`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {dstInfo.isDSTActive && (
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 ml-1">
                DST Active
                <div className="relative group/tooltip flex items-center">
                  <Info className="w-3 h-3 cursor-help" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50 normal-case font-normal tracking-normal text-center">
                    Daylight Saving Time (DST) is the practice of advancing clocks during warmer months so that darkness falls later.
                  </div>
                </div>
              </div>
            )}
          </div>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city.name}, ${city.country}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity text-sm mt-1 w-fit"
            title={`View ${city.name} on Google Maps`}
          >
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
            {city.country}
          </a>
        </div>
        <div className="flex items-center gap-2">
          {weatherLoading ? (
            <div className="flex items-center gap-1.5 opacity-60 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-full border border-black/10 dark:border-white/10">
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
              <span className="text-xs font-medium">--°</span>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-1.5 bg-white/40 dark:bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-black/10 dark:border-white/10 shadow-sm">
              <WeatherIcon code={weather.code} isDay={weather.isDay} className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{Math.round(weather.temp)}°C</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 opacity-60 bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-full border border-black/10 dark:border-white/10">
              <span className="text-xs font-medium">--°</span>
            </div>
          )}
          <button 
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2 -mt-2 hover:text-red-500 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-end gap-2 mb-3">
          <div className="text-4xl sm:text-6xl font-black tracking-tighter">
            {formatInTimeZone(time, city.timezone, 'h:mm')}
          </div>
          <span className="text-xl font-black opacity-60 mb-1">{ampm}</span>
        </div>
        
        <div className="pt-3 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-70">{dateString}</div>
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded-md bg-black/5 dark:bg-white/10"
            )}>
              {diffString}
            </div>
          </div>
          
          {dstInfo.daysUntilChange !== -1 && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded mb-2 w-fit">
              <AlertTriangle className="w-3 h-3" strokeWidth={2} />
              Time difference changes in {dstInfo.daysUntilChange} day{dstInfo.daysUntilChange !== 1 ? 's' : ''} due to DST.
              <div className="relative group/tooltip flex items-center">
                <Info className="w-3 h-3 opacity-70 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50 normal-case font-normal tracking-normal text-center">
                  Daylight Saving Time (DST) is the practice of advancing clocks during warmer months so that darkness falls later.
                </div>
              </div>
            </div>
          )}
          
          {/* Visual Offset Indicator */}
          <div className="relative mt-1 mb-3">
            <div className="relative h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="absolute top-0 bottom-0 w-0.5 bg-black/30 dark:bg-white/40 z-10" style={{ left: `${centerPct}%`, transform: 'translateX(-50%)' }} />
              {diffHours !== 0 && (
                <div 
                  className={cn(
                    "absolute top-0 bottom-0 opacity-80",
                    diffHours > 0 ? "bg-blue-500" : "bg-amber-500"
                  )}
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                />
              )}
            </div>
            <div 
              className={cn(
                "absolute top-[3px] w-2.5 h-2.5 rounded-full z-20 shadow-[0_0_4px_rgba(0,0,0,0.2)] border-2 border-white dark:border-zinc-900",
                diffHours === 0 ? "bg-gray-400 dark:bg-zinc-400" : diffHours > 0 ? "bg-blue-500 dark:bg-blue-400" : "bg-amber-500 dark:bg-amber-400"
              )}
              style={{ left: `${cityPct}%`, transform: 'translate(-50%, -50%)' }}
            />
            <div className="flex justify-between text-[10px] opacity-50 mt-2 font-mono uppercase tracking-wider">
              <span>-12h</span>
              <span className="opacity-80">Primary</span>
              <span>+14h</span>
            </div>
          </div>

          {/* Additional Weather Details */}
          {weather && !weatherLoading && (
            <div className="flex flex-col mt-3 pt-3 border-t border-black/10 dark:border-white/10">
              <div className="grid grid-cols-3 gap-2 text-xs opacity-70 mb-4">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" title="Feels Like">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Feels</span>
                  <span className="font-bold opacity-100">{Math.round(weather.feelsLike)}°</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" title="Humidity">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Humid</span>
                  <span className="font-bold opacity-100">{weather.humidity}%</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" title="Wind Speed">
                  <Wind className="w-3.5 h-3.5 text-teal-500" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Wind</span>
                  <span className="font-bold opacity-100">{Math.round(weather.windSpeed)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs opacity-80 mb-4 px-1">
                <div className="flex items-center gap-2" title="Sunrise">
                  <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
                    <Sunrise className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  </motion.div>
                  <span>{weather.sunrise ? formatInTimeZone(new Date(weather.sunrise), city.timezone, 'h:mm a') : '--:--'}</span>
                </div>
                <div className="flex items-center gap-2" title="Sunset">
                  <motion.div animate={{ y: [0, 1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
                    <Sunset className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                  </motion.div>
                  <span>{weather.sunset ? formatInTimeZone(new Date(weather.sunset), city.timezone, 'h:mm a') : '--:--'}</span>
                </div>
              </div>

              {/* 7-Day Forecast */}
              {weather.daily && weather.daily.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                  {weather.daily.map((day, i) => {
                    const date = new Date(day.time);
                    const dayName = i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                    return (
                      <div key={day.time} className="snap-start shrink-0 flex flex-col items-center gap-1.5 min-w-[3rem]">
                        <span className="text-[10px] font-medium opacity-70">{dayName}</span>
                        <WeatherIcon code={day.code} isDay={true} className="w-4 h-4" />
                        <div className="flex items-center gap-1 text-[10px] font-medium">
                          <span className="opacity-100 font-bold">{Math.round(day.tempMax)}°</span>
                          <span className="opacity-60">{Math.round(day.tempMin)}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
