import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, useMotionValue, animate, useTransform, MotionValue, useMotionValueEvent } from 'motion/react';
import { cn } from '../lib/utils';

interface WheelColumnProps<T> {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  format?: (value: T) => string;
}

function WheelColumn<T>({ items, value, onChange, label, format = (v) => String(v) }: WheelColumnProps<T>) {
  const itemHeight = 40;
  const containerHeight = 120;
  const offset = (containerHeight - itemHeight) / 2; // 40px

  const currentIndex = items.indexOf(value);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const y = useMotionValue(-currentIndex * itemHeight);
  const targetY = useRef(y.get());

  useMotionValueEvent(y, "change", (latestY) => {
    let index = Math.round(-latestY / itemHeight);
    index = Math.max(0, Math.min(index, items.length - 1));
    if (index !== activeIndex) {
      setActiveIndex(index);
      onChange(items[index]);
    }
  });

  useEffect(() => {
    if (!isDragging && currentIndex !== activeIndex) {
      const newY = -currentIndex * itemHeight;
      targetY.current = newY;
      animate(y, newY, { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 });
    }
  }, [currentIndex, isDragging, itemHeight, y, activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scrolling
      
      // Update the target Y position based on scroll delta
      targetY.current = targetY.current - e.deltaY * 0.6;
      targetY.current = Math.max(-(items.length - 1) * itemHeight, Math.min(0, targetY.current));
      
      // Smoothly animate towards the target Y
      animate(y, targetY.current, { type: 'spring', stiffness: 800, damping: 60, mass: 0.5 });
      
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      
      // Snap to nearest item after scrolling stops
      wheelTimeout.current = setTimeout(() => {
        let index = Math.round(-targetY.current / itemHeight);
        index = Math.max(0, Math.min(index, items.length - 1));
        targetY.current = -index * itemHeight;
        animate(y, targetY.current, { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 });
      }, 150);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [items, itemHeight, y]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const currentY = y.get();
    const projectedY = currentY + info.velocity.y * 0.2;
    
    let newIndex = Math.round(-projectedY / itemHeight);
    newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    
    targetY.current = -newIndex * itemHeight;
    animate(y, targetY.current, { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 });
    
    if (newIndex !== currentIndex) {
      onChange(items[newIndex]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="bg-gray-50 dark:bg-zinc-900/50 rounded-full w-12 sm:w-16 overflow-hidden border border-gray-100 dark:border-zinc-800 relative h-[120px]"
      >
        {/* Highlight band */}
        <div className="absolute top-[40px] left-0 right-0 h-[40px] bg-blue-50 dark:bg-blue-900/20 border-y border-blue-100 dark:border-blue-800/30 pointer-events-none z-0" />
        
        <div className="relative w-full h-full z-10" style={{ touchAction: 'none', perspective: '800px' }}>
          <motion.div
            drag="y"
            dragConstraints={{
              top: -(items.length - 1) * itemHeight,
              bottom: 0
            }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ y, paddingTop: offset, paddingBottom: offset }}
            className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
          >
            {items.map((item, i) => (
              <WheelItem 
                key={i} 
                item={item} 
                i={i} 
                y={y} 
                itemHeight={itemHeight} 
                currentIndex={activeIndex} 
                onChange={onChange} 
                isDragging={isDragging} 
                value={value} 
                format={format} 
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface WheelItemProps<T> {
  key?: React.Key;
  item: T;
  i: number;
  y: MotionValue<number>;
  itemHeight: number;
  currentIndex: number;
  onChange: (value: T) => void;
  isDragging: boolean;
  value: T;
  format: (value: T) => string;
}

function WheelItem<T>({ item, i, y, itemHeight, currentIndex, onChange, isDragging, value, format }: WheelItemProps<T>) {
  const itemY = useTransform(y, (latestY) => i * itemHeight + latestY);
  
  const rotateX = useTransform(itemY, (iy) => {
    const degrees = (iy / itemHeight) * -25;
    return Math.max(-60, Math.min(60, degrees));
  });
  
  const scale = useTransform(itemY, (iy) => {
    const distance = Math.abs(iy);
    return Math.max(0.7, 1 - (distance / (itemHeight * 6)));
  });
  
  const opacity = useTransform(itemY, (iy) => {
    const distance = Math.abs(iy);
    return Math.max(0.1, 1 - (distance / (itemHeight * 2.5)));
  });
  
  const z = useTransform(itemY, (iy) => {
    const distance = Math.abs(iy);
    return -distance * 0.3;
  });

  const isSelected = i === currentIndex;
  const distance = Math.abs(i - currentIndex);

  return (
    <motion.div 
      className="h-[40px] w-full flex items-center justify-center shrink-0"
      style={{ rotateX, scale, opacity, z, transformOrigin: 'center center -40px' }}
      onClick={() => {
        if (!isDragging && item !== value) {
          onChange(item);
        }
      }}
    >
      <span className={cn(
        "transition-all duration-200 flex items-center justify-center leading-none",
        isSelected 
          ? "text-blue-600 dark:text-blue-500 text-xl sm:text-2xl font-black drop-shadow-md scale-110" 
          : distance === 1
            ? "text-gray-300 dark:text-zinc-600 text-base sm:text-xl font-bold hover:text-gray-400 dark:hover:text-zinc-500 cursor-pointer"
            : "text-gray-200 dark:text-zinc-700 text-sm sm:text-lg font-medium opacity-50"
      )}>
        {format(item)}
      </span>
    </motion.div>
  );
}

interface TimeWheelPickerProps {
  sliderMinutes: number;
  onChange: (minutes: number) => void;
}

export function TimeWheelPicker({ sliderMinutes, onChange }: TimeWheelPickerProps) {
  const hour24 = Math.floor(sliderMinutes / 60);
  const minute = sliderMinutes % 60;
  
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampms = ['AM', 'PM'];

  const handleHourChange = (newHour12: number) => {
    let newHour24 = newHour12 === 12 ? 0 : newHour12;
    if (ampm === 'PM') newHour24 += 12;
    onChange(newHour24 * 60 + minute);
  };

  const handleMinuteChange = (newMin: number) => {
    onChange(hour24 * 60 + newMin);
  };

  const handleAmpmChange = (newAmpm: string) => {
    if (newAmpm === ampm) return;
    let newHour24 = hour24;
    if (newAmpm === 'PM') newHour24 += 12;
    else newHour24 -= 12;
    onChange(newHour24 * 60 + minute);
  };

  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-2 sm:p-5 flex items-start shadow-sm w-fit mx-auto xl:mx-0 shrink-0">
      <WheelColumn items={hours} value={hour12} onChange={handleHourChange} label="HR" />
      <div className="w-3 sm:w-6 flex items-center justify-center text-gray-300 dark:text-zinc-700 font-black text-xl sm:text-2xl h-[120px] pb-0.5">:</div>
      <WheelColumn items={minutes} value={minute} onChange={handleMinuteChange} label="MIN" format={(v) => v.toString().padStart(2, '0')} />
      <div className="w-2 sm:w-4" />
      <WheelColumn items={ampms} value={ampm} onChange={handleAmpmChange} label="PD" />
    </div>
  );
}
