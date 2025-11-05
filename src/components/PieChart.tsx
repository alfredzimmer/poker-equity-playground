'use client';

import { useEffect, useRef, useReducer } from 'react';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

interface AnimatedSegment {
  label: string;
  color: string;
  currentPercentage: number;
  targetPercentage: number;
}

export default function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const segmentsRef = useRef<AnimatedSegment[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  
  // Initialize or update segments
  useEffect(() => {
    const newSegments = data.map((item) => {
      const targetPercentage = total > 0 ? (item.value / total) * 100 : 0;
      const existing = segmentsRef.current.find(s => s.label === item.label);
      
      return {
        label: item.label,
        color: item.color,
        currentPercentage: existing?.currentPercentage ?? 0,
        targetPercentage
      };
    });

    segmentsRef.current = newSegments;
    
    // Animate
    const startTime = Date.now();
    const duration = 800; // ms - slower for smoother animation
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); // ease-out quartic - smoother
      
      let hasChanges = false;
      segmentsRef.current = segmentsRef.current.map(segment => {
        const diff = segment.targetPercentage - segment.currentPercentage;
        if (Math.abs(diff) > 0.1) {
          hasChanges = true;
          // Lerp towards target
          const newPercentage = segment.currentPercentage + diff * easeProgress;
          return {
            ...segment,
            currentPercentage: progress >= 1 ? segment.targetPercentage : newPercentage
          };
        }
        return { ...segment, currentPercentage: segment.targetPercentage };
      });
      
      forceUpdate();
      
      if (hasChanges && progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, total]);

  const segments = segmentsRef.current;
  
  // Always render chart, even with no data
  let currentAngle = -90; // Start from top
  const paths = segments.length > 0 ? segments.map((segment) => {
    const angle = (segment.currentPercentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Special case: if this is 100% (or very close), draw a full circle
    if (segment.currentPercentage >= 99.9) {
      return {
        ...segment,
        path: 'full-circle' // Special marker
      };
    }

    // Calculate path for pie slice
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + 90 * Math.cos(startRad);
    const y1 = 100 + 90 * Math.sin(startRad);
    const x2 = 100 + 90 * Math.cos(endRad);
    const y2 = 100 + 90 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...segment,
      path: angle > 0.1 ? `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z` : ''
    };
  }) : [];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Win Probability Distribution
      </h3>
      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 200 200" className="w-64 h-64">
          {paths.map((segment, index) => (
            segment.path && (
              <g key={segment.label}>
                {segment.path === 'full-circle' ? (
                  // Draw a full circle for 100%
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill={segment.color}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ) : (
                  // Draw normal pie slice
                  <path
                    d={segment.path}
                    fill={segment.color}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                )}
              </g>
            )
          ))}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="45" fill="white" className="dark:fill-gray-800" />
          {/* Show message when no data */}
          {segments.length === 0 && (
            <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-xs">
              No data
            </text>
          )}
        </svg>
        
        {/* Legend */}
        <div className="grid grid-cols-1 gap-2 w-full">
          {paths.map((segment, index) => (
            segment.currentPercentage > 0.1 && (
              <div key={segment.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {segment.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {segment.currentPercentage.toFixed(1)}%
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
