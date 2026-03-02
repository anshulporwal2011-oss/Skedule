import { motion } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  CloudDrizzle,
  CloudSun,
  CloudMoon
} from 'lucide-react';

export function WeatherIcon({ code, isDay, className }: { code: number, isDay: boolean, className?: string }) {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  // 85, 86: Snow showers slight and heavy
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail

  const wrapperClass = "inline-flex items-center justify-center";

  if (code === 0) {
    return (
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        {isDay ? <Sun className={className} /> : <Moon className={className} />}
      </motion.div>
    );
  }
  if (code === 1 || code === 2) {
    return (
      <motion.div
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        {isDay ? <CloudSun className={className} /> : <CloudMoon className={className} />}
      </motion.div>
    );
  }
  if (code === 3) {
    return (
      <motion.div
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <Cloud className={className} />
      </motion.div>
    );
  }
  if (code === 45 || code === 48) {
    return (
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], x: [-1, 1, -1] }}
        transition={{ duration: 6, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <CloudFog className={className} />
      </motion.div>
    );
  }
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
    return (
      <motion.div
        animate={{ y: [0, 1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <CloudDrizzle className={className} />
      </motion.div>
    );
  }
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) {
    return (
      <motion.div
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <CloudRain className={className} />
      </motion.div>
    );
  }
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
    return (
      <motion.div
        animate={{ y: [0, 1.5, 0], x: [-0.5, 0.5, -0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <CloudSnow className={className} />
      </motion.div>
    );
  }
  if (code === 95 || code === 96 || code === 99) {
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className={wrapperClass}
      >
        <CloudLightning className={className} />
      </motion.div>
    );
  }

  // Fallback
  return (
    <motion.div
      animate={{ x: [-1, 1, -1] }}
      transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      className={wrapperClass}
    >
      <Cloud className={className} />
    </motion.div>
  );
}
