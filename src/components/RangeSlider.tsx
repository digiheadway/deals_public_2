import { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  label?: string;
}

export function RangeSlider({ 
  min, 
  max, 
  step = 1, 
  value, 
  onChange, 
  formatValue = (v) => v.toString(),
  label 
}: RangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const [activeSlider, setActiveSlider] = useState<'min' | 'max' | null>(null);
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = (val: number) => Math.round(((val - min) / (max - min)) * 100);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, min, max]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, min, max]);

  // Update z-index based on active slider
  useEffect(() => {
    if (activeSlider === 'min' && minValRef.current && maxValRef.current) {
      minValRef.current.style.zIndex = '6';
      maxValRef.current.style.zIndex = '4';
    } else if (activeSlider === 'max' && minValRef.current && maxValRef.current) {
      minValRef.current.style.zIndex = '4';
      maxValRef.current.style.zIndex = '6';
    }
  }, [activeSlider]);

  // Sync with external value changes
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  // Check if values are at min/max (not applied)
  const isMinAtStart = minVal === min;
  const isMaxAtEnd = maxVal === max;

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(+event.target.value, maxVal - step);
    setMinVal(newMin);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(+event.target.value, minVal + step);
    setMaxVal(newMax);
    onChange([minVal, newMax]);
  };

  const handleMinMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveSlider('min');
    // Immediately bring min to front
    if (minValRef.current) {
      minValRef.current.style.zIndex = '7';
    }
    if (maxValRef.current) {
      maxValRef.current.style.zIndex = '3';
    }
  };

  const handleMaxMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveSlider('max');
    // Immediately bring max to front
    if (maxValRef.current) {
      maxValRef.current.style.zIndex = '7';
    }
    if (minValRef.current) {
      minValRef.current.style.zIndex = '3';
    }
  };

  const handleMinTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveSlider('min');
    if (minValRef.current) {
      minValRef.current.style.zIndex = '7';
    }
    if (maxValRef.current) {
      maxValRef.current.style.zIndex = '3';
    }
  };

  const handleMaxTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setActiveSlider('max');
    if (maxValRef.current) {
      maxValRef.current.style.zIndex = '7';
    }
    if (minValRef.current) {
      minValRef.current.style.zIndex = '3';
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const clickedValue = min + percentage * (max - min);
    const clampedValue = Math.max(min, Math.min(max, clickedValue));
    
    // Determine which thumb is closer
    const distanceToMin = Math.abs(clampedValue - minVal);
    const distanceToMax = Math.abs(clampedValue - maxVal);
    
    if (distanceToMin < distanceToMax) {
      // Move min thumb
      const newMin = Math.min(clampedValue, maxVal - step);
      setMinVal(newMin);
      onChange([newMin, maxVal]);
      setActiveSlider('min');
    } else {
      // Move max thumb
      const newMax = Math.max(clampedValue, minVal + step);
      setMaxVal(newMax);
      onChange([minVal, newMax]);
      setActiveSlider('max');
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div 
        ref={containerRef}
        className="relative" 
        style={{ height: '40px', paddingTop: '10px', paddingBottom: '10px' }}
        onClick={handleTrackClick}
      >
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-lg -translate-y-1/2 pointer-events-none"></div>
        {/* Active range */}
        <div
          ref={range}
          className="absolute top-1/2 h-2 bg-blue-600 rounded-lg -translate-y-1/2 pointer-events-none"
        ></div>
        {/* Input sliders - Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          ref={minValRef}
          onChange={handleMinChange}
          onMouseDown={handleMinMouseDown}
          onTouchStart={handleMinMouseDown}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-1/2 left-0 right-0 w-full h-2 -translate-y-1/2 cursor-pointer"
          style={{
            background: 'transparent',
            WebkitAppearance: 'none',
            appearance: 'none',
            zIndex: activeSlider === 'min' ? 6 : 5,
            pointerEvents: 'all',
          }}
        />
        {/* Input sliders - Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          ref={maxValRef}
          onChange={handleMaxChange}
          onMouseDown={handleMaxMouseDown}
          onTouchStart={handleMaxMouseDown}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-1/2 left-0 right-0 w-full h-2 -translate-y-1/2 cursor-pointer"
          style={{
            background: 'transparent',
            WebkitAppearance: 'none',
            appearance: 'none',
            zIndex: activeSlider === 'max' ? 6 : 4,
            pointerEvents: 'all',
          }}
        />
      </div>
      <style>{`
        input[type="range"] {
          pointer-events: all;
          -webkit-tap-highlight-color: transparent;
          padding: 8px 0;
          margin: -8px 0;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #2563eb;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          margin-top: -9px;
          pointer-events: all;
          position: relative;
          z-index: 20;
          touch-action: none;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid #2563eb;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          pointer-events: all;
          position: relative;
          z-index: 20;
          touch-action: none;
          -moz-appearance: none;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        }
        input[type="range"]::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: 2px;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 2px;
          cursor: pointer;
        }
      `}</style>
      <div className="flex justify-between mt-3 text-xs text-gray-600">
        <span className={isMinAtStart ? 'text-gray-400' : 'text-gray-700 font-medium'}>
          {isMinAtStart ? 'Min' : formatValue(minVal)}
        </span>
        <span className={isMaxAtEnd ? 'text-gray-400' : 'text-gray-700 font-medium'}>
          {isMaxAtEnd ? 'Max' : formatValue(maxVal)}
        </span>
      </div>
    </div>
  );
}

