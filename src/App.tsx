import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, MapPin, Globe, RotateCcw, Loader2, Sun, Moon, Wind, Droplets, Thermometer, ChevronLeft, ChevronRight, Navigation, Sunrise, Sunset, ExternalLink, Calendar } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { CITIES, City } from './data/cities';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWeather, getWeatherAtTime } from './hooks/useWeather';
import { WeatherIcon } from './components/WeatherIcon';
import { TimeWheelPicker } from './components/TimeWheelPicker';
import { CityCard } from './components/CityCard';

interface HubCardProps {
  city: City;
  currentTime: Date;
  key?: string | number;
}

import { RainAnimation, SnowAnimation, StarAnimation, MorningAnimation, AfternoonAnimation, EveningAnimation } from './components/BackgroundAnimations';

function HubCard({ city, currentTime }: HubCardProps) {
  const { weather: rawWeather } = useWeather(city);
  const weather = getWeatherAtTime(rawWeather, currentTime, city.timezone);
  const timeString = formatInTimeZone(currentTime, city.timezone, 'h:mm');
  const ampm = formatInTimeZone(currentTime, city.timezone, 'a');
  const hour = parseInt(formatInTimeZone(currentTime, city.timezone, 'H'), 10);
  
  const isMorning = hour >= 6 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 6;
  
  const isDarkText = isMorning || isAfternoon;
  
  const sunriseStr = weather?.sunrise ? formatInTimeZone(new Date(weather.sunrise), city.timezone, 'h:mm a') : '--:--';
  const sunsetStr = weather?.sunset ? formatInTimeZone(new Date(weather.sunset), city.timezone, 'h:mm a') : '--:--';

  const abbreviation = city.id.toUpperCase().slice(0, 3);

  const isRainy = weather && [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.code);
  const isSnowy = weather && [71, 73, 75, 77, 85, 86].includes(weather.code);

  return (
    <div 
      className={cn(
        "snap-start shrink-0 relative overflow-hidden rounded-[20px] p-3.5 w-[136px] h-[136px] shadow-md flex flex-col justify-between transition-all duration-500",
        isMorning ? "bg-sky-50 text-sky-950" :
        isAfternoon ? "bg-blue-50 text-blue-950" :
        isEvening ? "bg-indigo-900 text-indigo-50" :
        "bg-[#1a1b35] text-white"
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

      <div className="relative z-10 flex justify-between items-start">
        <span className={cn(
          "text-xs font-black tracking-wide",
          isDarkText ? "text-gray-500" : "text-gray-300"
        )}>
          {abbreviation}
        </span>
        {isNight ? (
          <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
            <Moon className="w-4 h-4 text-gray-300" strokeWidth={2} />
          </motion.div>
        ) : isEvening ? (
          <motion.div animate={{ y: [0, 1.5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
            <Sunset className="w-4 h-4 text-indigo-200" strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
            <Sun className="w-4 h-4 text-amber-500" strokeWidth={2} />
          </motion.div>
        )}
      </div>

      <div className="relative z-10 mt-auto mb-1.5">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] leading-none font-black tracking-tighter">{timeString}</span>
          <span className="text-sm leading-none font-black tracking-tight uppercase">{ampm}</span>
        </div>
        <span className={cn(
          "text-[10px] font-bold mt-1 block truncate",
          isDarkText ? "text-gray-600" : "text-gray-300"
        )}>
          {city.name}{city.country && city.country !== 'Unknown' ? `, ${city.country}` : ''}
        </span>
      </div>

      <div className="relative z-10 flex justify-between items-end">
        <div className="space-y-0.5">
          <div className={cn("flex items-center gap-1 text-[9px] font-bold", isDarkText ? "text-gray-500" : "text-gray-400")}>
            <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
              <Sunrise className="w-3 h-3" strokeWidth={2} />
            </motion.div>
            {sunriseStr}
          </div>
          <div className={cn("flex items-center gap-1 text-[9px] font-bold", isDarkText ? "text-gray-500" : "text-gray-400")}>
            <motion.div animate={{ y: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
              <Sunset className="w-3 h-3" strokeWidth={2} />
            </motion.div>
            {sunsetStr}
          </div>
        </div>
        
        {weather && (
          <div className={cn(isDarkText ? "text-gray-500" : "text-gray-400")}>
            <WeatherIcon code={weather.code} isDay={weather.isDay} className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}

function WorldClockWidget({ currentTime, cities }: { currentTime: Date, cities: City[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 mb-4 px-1 uppercase tracking-[0.2em]">Global Hubs</h3>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar px-1">
        {cities.map(city => (
          <HubCard key={city.id} city={city} currentTime={currentTime} />
        ))}
      </div>
    </div>
  );
}

function HighlightedText({ text, highlight }: { text: string, highlight: string }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/20 rounded px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [primaryCity, setPrimaryCity] = useState<City>(() => {
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const found = CITIES.find(c => c.timezone === localTz);
      return found || CITIES.find(c => c.id === 'nyc')!;
    } catch (e) {
      return CITIES.find(c => c.id === 'nyc')!;
    }
  });
  
  const [selectedCities, setSelectedCities] = useState<City[]>(() => {
    return [
      CITIES.find(c => c.id === 'mus')!,
      CITIES.find(c => c.id === 'lak')!,
      CITIES.find(c => c.id === 'chi')!,
      CITIES.find(c => c.id === 'lon')!,
      CITIES.find(c => c.id === 'tok')!,
      CITIES.find(c => c.id === 'syd')!
    ].filter(c => c && c.id !== primaryCity.id);
  });
  
  const [isSearchOpen, setIsSearchOpen] = useState<'none' | 'primary' | 'add'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [sliderMinutes, setSliderMinutes] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [hasAttemptedLiveLocation, setHasAttemptedLiveLocation] = useState(false);

  const fetchLiveLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          
          const cityName = data.city || data.locality || 'Current Location';
          const countryName = data.countryName || 'Unknown';
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          setPrimaryCity({
            id: 'live-location',
            name: cityName,
            country: countryName,
            timezone: tz,
            latitude,
            longitude
          });
        } catch (e) {
          console.error('Failed to get live location details', e);
        }
      }, (error) => {
        console.error('Geolocation error:', error);
      });
    }
  };

  useEffect(() => {
    if (!hasAttemptedLiveLocation) {
      fetchLiveLocation();
      setHasAttemptedLiveLocation(true);
    }
  }, [hasAttemptedLiveLocation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLive) {
      const hours = parseInt(formatInTimeZone(currentTime, primaryCity.timezone, 'H'), 10);
      const minutes = parseInt(formatInTimeZone(currentTime, primaryCity.timezone, 'm'), 10);
      setSliderMinutes(hours * 60 + minutes);
      setSelectedDateStr(formatInTimeZone(currentTime, primaryCity.timezone, 'yyyy-MM-dd'));
    }
  }, [currentTime, primaryCity, isLive]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(CITIES);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`);
        const data = await res.json();
        
        if (data.results) {
          const mapped: City[] = data.results.map((r: any) => ({
            id: r.id.toString(),
            name: r.name,
            country: r.country || r.admin1 || 'Unknown',
            timezone: r.timezone || 'UTC'
          }));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.error('Search failed', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayTime: Date = isLive ? currentTime : (() => {
    const currentPrimaryDateStr = formatInTimeZone(currentTime, primaryCity.timezone, 'yyyy-MM-dd');
    const currentPrimaryMinutes = parseInt(formatInTimeZone(currentTime, primaryCity.timezone, 'H'), 10) * 60 + parseInt(formatInTimeZone(currentTime, primaryCity.timezone, 'm'), 10);
    
    const targetDate = new Date(selectedDateStr || currentPrimaryDateStr);
    const currentDate = new Date(currentPrimaryDateStr);
    
    const diffDays = Math.round((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const diffMinutes = sliderMinutes - currentPrimaryMinutes;
    
    let approxTime = new Date(currentTime.getTime() + diffDays * 24 * 60 * 60 * 1000 + diffMinutes * 60000);
    
    // Check if DST caused an offset shift
    const approxMinutes = parseInt(formatInTimeZone(approxTime, primaryCity.timezone, 'H'), 10) * 60 + parseInt(formatInTimeZone(approxTime, primaryCity.timezone, 'm'), 10);
    const approxDateStr = formatInTimeZone(approxTime, primaryCity.timezone, 'yyyy-MM-dd');
    
    if (approxMinutes !== sliderMinutes || approxDateStr !== selectedDateStr) {
       let errorMinutes = sliderMinutes - approxMinutes;
       if (errorMinutes > 720) errorMinutes -= 1440;
       if (errorMinutes < -720) errorMinutes += 1440;
       
       approxTime = new Date(approxTime.getTime() + errorMinutes * 60000);
       
       const finalDateStr = formatInTimeZone(approxTime, primaryCity.timezone, 'yyyy-MM-dd');
       if (finalDateStr !== selectedDateStr && selectedDateStr) {
         const d1 = new Date(selectedDateStr);
         const d2 = new Date(finalDateStr);
         const dayError = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
         approxTime = new Date(approxTime.getTime() + dayError * 24 * 60 * 60 * 1000);
       }
    }
    
    return approxTime;
  })();

  const handleCitySelect = (city: City) => {
    if (isSearchOpen === 'primary') {
      setPrimaryCity(city);
      setSelectedCities(prev => prev.filter(c => c.id !== city.id));
    } else if (isSearchOpen === 'add') {
      if (!selectedCities.find(c => c.id === city.id) && primaryCity.id !== city.id) {
        setSelectedCities([...selectedCities, city]);
      }
    }
    setIsSearchOpen('none');
    setSearchQuery('');
  };

  const removeCity = (id: string) => {
    setSelectedCities(selectedCities.filter(c => c.id !== id));
  };

  const adjustDateByDays = (days: number) => {
    setIsLive(false);
    const baseDateStr = selectedDateStr || formatInTimeZone(currentTime, primaryCity.timezone, 'yyyy-MM-dd');
    const current = new Date(baseDateStr + 'T00:00:00Z');
    current.setUTCDate(current.getUTCDate() + days);
    setSelectedDateStr(current.toISOString().split('T')[0]);
  };

  const formatSliderTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const { weather: rawPrimaryWeather, loading: primaryWeatherLoading } = useWeather(primaryCity);
  const primaryWeather = getWeatherAtTime(rawPrimaryWeather, displayTime, primaryCity.timezone);

  const primaryHour = parseInt(formatInTimeZone(displayTime, primaryCity.timezone, 'H'), 10);
  const primaryIsMorning = primaryHour >= 6 && primaryHour < 12;
  const primaryIsAfternoon = primaryHour >= 12 && primaryHour < 17;
  const primaryIsEvening = primaryHour >= 17 && primaryHour < 20;
  const primaryIsNight = primaryHour >= 20 || primaryHour < 6;
  const primaryTimeOfDay = primaryHour >= 6 && primaryHour < 17 ? 'day' : primaryHour >= 17 && primaryHour < 20 ? 'evening' : 'night';

  const isPrimaryRainy = primaryWeather && [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(primaryWeather.code);
  const isPrimarySnowy = primaryWeather && [71, 73, 75, 77, 85, 86].includes(primaryWeather.code);

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row transition-colors duration-300 font-sans",
      isDarkMode ? "dark bg-black text-white" : "bg-gray-50 text-black"
    )}>
      {/* Sidebar / Header */}
      <aside className="group w-full md:w-[80px] hover:md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-4 md:p-5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:gap-8 z-20 sticky top-0 md:relative transition-all duration-300 ease-in-out overflow-hidden shrink-0">
        <div className="flex items-center justify-center md:justify-start w-auto md:w-full px-1">
          <h1 className="font-black italic tracking-tighter text-2xl bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate">
            <span className="md:hidden group-hover:inline">SKEDULE</span>
            <span className="hidden md:inline group-hover:hidden">SK</span>
          </h1>
        </div>

        <nav className="hidden md:flex flex-col gap-2 w-full">
          <button className="flex items-center gap-4 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors w-full overflow-hidden">
            <Clock className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
          </button>
        </nav>

        <div className="mt-0 md:mt-auto flex flex-row md:flex-col items-center gap-2 md:gap-4 w-auto md:w-full">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors w-full flex items-center justify-center md:justify-start gap-4 overflow-hidden"
          >
            {isDarkMode ? <Moon className="w-5 h-5 shrink-0" strokeWidth={1.5} /> : <Sun className="w-5 h-5 shrink-0" strokeWidth={1.5} />}
            <span className="hidden md:inline opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          <button 
            onClick={() => setIsSearchOpen('add')}
            className="p-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-full flex items-center justify-center md:justify-start gap-4 overflow-hidden shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" strokeWidth={2} />
            <span className="hidden md:inline font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Add Location</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          <WorldClockWidget currentTime={displayTime} cities={selectedCities} />

          {/* Primary Location Section */}
          <div className="mb-6 sm:mb-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl relative overflow-hidden shadow-sm flex flex-col">
            <div className={cn(
              "absolute inset-0 opacity-20 dark:opacity-30 transition-colors duration-1000",
              primaryTimeOfDay === 'day' ? "bg-gradient-to-br from-sky-400/30 dark:from-sky-500/20 to-transparent dark:to-zinc-900" :
              primaryTimeOfDay === 'evening' ? "bg-gradient-to-br from-amber-500/30 dark:from-amber-500/20 to-transparent dark:to-zinc-900" :
              "bg-gradient-to-br from-indigo-500/30 dark:from-indigo-900/50 to-transparent dark:to-zinc-900"
            )} />

            {/* Dynamic Time Animations */}
            {primaryIsMorning && <MorningAnimation />}
            {primaryIsAfternoon && <AfternoonAnimation />}
            {primaryIsEvening && <EveningAnimation />}
            {primaryIsNight && <StarAnimation />}

            {/* Dynamic Weather Animations */}
            {isPrimaryRainy && <RainAnimation />}
            {isPrimarySnowy && <SnowAnimation />}
            
            {/* TOP: Location Header */}
            <div className="relative z-10 p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-400 dark:text-zinc-500" strokeWidth={1.5} />
                <h2 className="text-lg font-bold text-gray-400 dark:text-zinc-500 font-sans">Primary</h2>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Globe className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-400 dark:text-zinc-400 flex items-center gap-2">
                    {primaryCity.name}{primaryCity.country && primaryCity.country !== 'Unknown' ? `, ${primaryCity.country}` : ''}
                    <a 
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(primaryCity.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="opacity-40 hover:opacity-100 transition-opacity"
                      title={`View ${primaryCity.name} on Wikipedia`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </span>
                  <button 
                    onClick={() => setIsSearchOpen('primary')} 
                    className="text-sm font-medium text-gray-300 hover:text-blue-500 transition-colors ml-1"
                  >
                    Change
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-gray-200/50 dark:border-zinc-700/50 shadow-sm backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
                    <Calendar className="w-4 h-4" />
                    <input 
                      type="date" 
                      value={selectedDateStr} 
                      onChange={(e) => { setIsLive(false); setSelectedDateStr(e.target.value); }} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Select Date"
                    />
                  </div>
                  {!isLive && (
                    <button 
                      onClick={() => setIsLive(true)} 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shadow-sm"
                      title="Reset to Live Time"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TOP: Time Wheel */}
            <div className="relative z-10 p-4 sm:p-6 pb-2 sm:pb-4 flex justify-center">
              <TimeWheelPicker 
                sliderMinutes={sliderMinutes} 
                onChange={(mins) => { setIsLive(false); setSliderMinutes(mins); }} 
              />
            </div>

            {/* MIDDLE: Sunrise / Sunset Bar */}
            <div className="relative z-10 bg-gray-50/50 dark:bg-zinc-950/30 border-y border-gray-100 dark:border-zinc-800/50 p-3 sm:p-4 flex items-center justify-center gap-8 sm:gap-12">
               <div className="flex items-center gap-3">
                 <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
                   <Sunrise className="w-5 h-5 text-orange-500" strokeWidth={2} />
                 </motion.div>
                 <div>
                   <div className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Rise</div>
                   <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                     {primaryWeather?.sunrise ? formatInTimeZone(new Date(primaryWeather.sunrise), primaryCity.timezone, 'h:mm a') : '--:--'}
                   </div>
                 </div>
               </div>
               <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
               <div className="flex items-center gap-3">
                 <motion.div animate={{ y: [0, 1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}>
                   <Sunset className="w-5 h-5 text-blue-500" strokeWidth={2} />
                 </motion.div>
                 <div>
                   <div className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Set</div>
                   <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                     {primaryWeather?.sunset ? formatInTimeZone(new Date(primaryWeather.sunset), primaryCity.timezone, 'h:mm a') : '--:--'}
                   </div>
                 </div>
               </div>
            </div>

            {/* BOTTOM: Weather & Controls */}
            <div className="relative z-10 p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Primary Weather Details */}
                  {primaryWeather && !primaryWeatherLoading && (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5" title="Feels Like">
                          <Thermometer className="w-4 h-4" strokeWidth={1.5} />
                          <span>Feels like {Math.round(primaryWeather.feelsLike)}°</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Humidity">
                          <Droplets className="w-4 h-4" strokeWidth={1.5} />
                          <span>{primaryWeather.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Wind Speed">
                          <Wind className="w-4 h-4" strokeWidth={1.5} />
                          <span>{primaryWeather.windSpeed} km/h</span>
                        </div>
                      </div>

                      {/* 7-Day Forecast */}
                      {primaryWeather.daily && primaryWeather.daily.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x max-w-full">
                          {primaryWeather.daily.map((day, i) => {
                            const date = new Date(day.time);
                            const dayName = i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                            return (
                              <div key={day.time} className="snap-start shrink-0 flex flex-col items-center gap-2 min-w-[3.5rem] p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800/50">
                                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{dayName}</span>
                                <WeatherIcon code={day.code} isDay={true} className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                  <span className="text-gray-900 dark:text-white">{Math.round(day.tempMax)}°</span>
                                  <span className="text-gray-400 dark:text-zinc-500">{Math.round(day.tempMin)}°</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-end justify-end mt-auto">
                  {/* Calendar controls moved to header */}
                </div>
              </div>
            </div>
          </div>

          {/* Other Locations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {selectedCities.map((city: City) => (
                <CityCard 
                  key={city.id} 
                  city={city} 
                  primaryCity={primaryCity}
                  time={displayTime} 
                  onRemove={() => removeCity(city.id)} 
                />
              ))}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsSearchOpen('add')}
              className="h-full min-h-[240px] rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-900/20 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 flex items-center justify-center">
                <Plus className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Add Location</span>
            </button>
          </div>
        </div>
      </main>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                  {isSearchOpen === 'primary' ? 'Set Primary' : 'Add Location'}
                </h3>
                
                {isSearchOpen === 'primary' && (
                  <button 
                    onClick={() => {
                      fetchLiveLocation();
                      setIsSearchOpen('none');
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors mb-4"
                  >
                    <Navigation className="w-4 h-4" strokeWidth={1.5} />
                    Use Live Location
                  </button>
                )}

                <input 
                  type="text" 
                  placeholder="Search city or country..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto p-2 flex-1">
                {isSearching ? (
                  <div className="p-8 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" strokeWidth={1.5} />
                    <span className="text-sm">Searching global locations...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1 p-1">
                    {searchResults.map(city => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left group border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                            <HighlightedText text={city.name} highlight={searchQuery} />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-zinc-400 pl-6">
                            <HighlightedText text={city.country} highlight={searchQuery} />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatInTimeZone(displayTime, city.timezone, 'h:mm a')}
                          </div>
                          <div className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-800">
                            {city.timezone.split('/')[1]?.replace('_', ' ') || city.timezone}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-zinc-500 text-sm">
                    No locations found. Try a different search term.
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                <button 
                  onClick={() => setIsSearchOpen('none')}
                  className="w-full py-2.5 rounded-xl bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium text-sm hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
