import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  description?: string;
  trend?: number[];
}

const EnhancedMetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  color,
  gradient,
  description,
  trend = []
}) => {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const renderMiniChart = () => {
    if (trend.length === 0) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 15;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-16 h-6" viewBox="0 0 60 20">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-60"
        />
      </svg>
    );
  };

  return (
    <div className={`${gradient} border border-opacity-20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${color}/20 rounded-xl group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className={`${color.replace('bg-', 'text-')} text-sm font-medium`}>{title}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {change !== undefined && (
              <div className={`flex items-center gap-2 ${
                changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{formatChange(change)}</span>
              </div>
            )}
            {description && (
              <p className="text-slate-400 text-xs mt-1">{description}</p>
            )}
          </div>
          
          {trend.length > 0 && (
            <div className={`${color.replace('bg-', 'text-')} ml-4`}>
              {renderMiniChart()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMetricsCard;