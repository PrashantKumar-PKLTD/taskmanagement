import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface DataPoint {
  time: string;
  value: number;
  label: string;
}

interface InteractiveChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  height?: number;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  data,
  color = '#ef4444',
  height = 200
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const createPath = () => {
    const width = 400;
    const stepX = width / (data.length - 1);
    
    let path = '';
    
    data.forEach((point, index) => {
      const x = index * stepX;
      const y = height - ((point.value - minValue) / range) * (height - 40);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = (index - 1) * stepX;
        const prevY = height - ((data[index - 1].value - minValue) / range) * (height - 40);
        const cpX1 = prevX + stepX * 0.4;
        const cpX2 = x - stepX * 0.4;
        path += ` C ${cpX1} ${prevY} ${cpX2} ${y} ${x} ${y}`;
      }
    });
    
    return path;
  };

  const createAreaPath = () => {
    const linePath = createPath();
    if (!linePath) return '';
    
    const width = 400;
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {hoveredPoint && (
          <div className="bg-slate-700 rounded-lg px-3 py-2 text-sm">
            <div className="text-white font-medium">{hoveredPoint.label}</div>
            <div className="text-slate-400">{hoveredPoint.time}</div>
          </div>
        )}
      </div>

      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * (height / 4)}
              x2="400"
              y2={i * (height / 4)}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.2"
            />
          ))}
          
          {/* Area */}
          <path
            d={createAreaPath()}
            fill="url(#chartGradient)"
            style={{
              transform: `scaleY(${animationProgress})`,
              transformOrigin: 'bottom',
              transition: 'transform 1s ease-out'
            }}
          />
          
          {/* Line */}
          <path
            d={createPath()}
            fill="none"
            stroke={color}
            strokeWidth="3"
            filter="url(#glow)"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000 * (1 - animationProgress),
              transition: 'stroke-dashoffset 1.5s ease-out'
            }}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = height - ((point.value - minValue) / range) * (height - 40);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                className="hover:r-6 transition-all cursor-pointer"
                style={{
                  opacity: animationProgress,
                  transform: `scale(${animationProgress})`,
                  transition: `all 0.3s ease-out ${index * 0.1}s`
                }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
          {data.map((point, index) => (
            <span key={index}>{point.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveChart;