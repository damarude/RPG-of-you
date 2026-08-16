
import React, { useState, useMemo, useEffect } from 'react';
import { Proficiency } from '../types';
import { Hexagon, Undo2, Zap } from 'lucide-react';

interface TendencyRadarProps {
  proficiencies: Proficiency[];
}

interface DataPoint {
  label: string;
  value: number;
  fullMark: number;
  color?: string; // Optional override
}

export const TendencyRadar: React.FC<TendencyRadarProps> = ({ proficiencies }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Data Processing ---
  
  const chartData: DataPoint[] = useMemo(() => {
    let rawData: DataPoint[] = [];
    let maxVal = 100;

    if (!selectedCategory) {
      // 1. Overview Mode: Aggregate by Category
      const categoryMap: Record<string, number> = {};
      
      proficiencies.forEach(p => {
        // Use exponential weight so higher levels impact the graph more visually
        const weight = p.level; 
        categoryMap[p.category] = (categoryMap[p.category] || 0) + weight;
      });

      const categories = Object.keys(categoryMap);
      
      // Normalize relative to the highest category to fill the graph nicely
      maxVal = Math.max(...Object.values(categoryMap), 10); // Minimum scale of 10 to avoid weird looking graphs on lvl 1
      
      rawData = categories.map(cat => ({
        label: cat,
        value: categoryMap[cat],
        fullMark: maxVal * 1.1 // Add 10% buffer
      }));

    } else {
      // 2. Drill-down Mode: Specific Skills in Category
      const skills = proficiencies
        .filter(p => p.category === selectedCategory)
        .sort((a, b) => b.level - a.level)
        .slice(0, 12); // Top 12 skills

      const maxLevel = Math.max(...skills.map(s => s.level), 10);
      maxVal = maxLevel;

      rawData = skills.map(s => ({
        label: s.name,
        value: s.level,
        fullMark: maxLevel * 1.1
      }));
    }

    // --- Padding Logic ---
    // A radar chart needs at least 3 points to form a polygon area.
    // If we have < 3, we add "ghost" points with 0 value. 
    // This creates a shape that "points" strongly to the existing data.
    const result = [...rawData].sort((a,b) => b.value - a.value).slice(0, 12);
    
    while (result.length < 3) {
        result.push({
            label: '', // Empty label
            value: 0,  // Center of graph
            fullMark: maxVal * 1.1
        });
    }

    return result;
  }, [proficiencies, selectedCategory]);

  // Trigger animation effect on change
  useEffect(() => {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
  }, [chartData]);

  // --- Visual Constants ---
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 40; // Padding for labels
  const totalPoints = chartData.length;
  
  // Theme Colors
  const themeColor = selectedCategory ? '#22d3ee' : '#fbbf24'; // Cyan for Skill, Amber for Overview
  const fillColor = selectedCategory ? 'rgba(34, 211, 238, 0.3)' : 'rgba(251, 191, 36, 0.3)';
  const strokeColor = selectedCategory ? '#06b6d4' : '#d97706';

  // --- Math Helpers ---
  const angleSlice = (Math.PI * 2) / totalPoints;

  const getCoordinates = (value: number, index: number, max: number) => {
    // -Math.PI / 2 rotates graph so first point is at top (12 o'clock)
    const angle = index * angleSlice - Math.PI / 2;
    const r = (value / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate Polygon Points String
  const polygonPoints = chartData.map((d, i) => {
    const coords = getCoordinates(isAnimating ? d.value * 0.1 : d.value, i, d.fullMark); // Animate scale
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Generate Background Grid (3 levels)
  const renderGrid = () => {
    return [1, 0.66, 0.33].map((scale, idx) => {
      const gridPoints = chartData.map((d, i) => {
        const coords = getCoordinates(d.fullMark * scale, i, d.fullMark);
        return `${coords.x},${coords.y}`;
      }).join(' ');
      
      return (
        <polygon 
          key={idx} 
          points={gridPoints} 
          fill="transparent" 
          stroke="#334155" 
          strokeWidth="1" 
          className="opacity-50"
        />
      );
    });
  };

  // Generate Axis Lines
  const renderAxis = () => {
    return chartData.map((d, i) => {
      const start = { x: center, y: center };
      const end = getCoordinates(d.fullMark, i, d.fullMark);
      return (
        <line 
          key={i} 
          x1={start.x} y1={start.y} 
          x2={end.x} y2={end.y} 
          stroke="#334155" 
          strokeWidth="1" 
          className="opacity-30"
        />
      );
    });
  };

  const handleClick = (point: DataPoint) => {
      if (!selectedCategory && point.label) {
          setSelectedCategory(point.label);
      }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Hexagon size={16} className={selectedCategory ? "text-cyan-400" : "text-yellow-500"} />
                    {selectedCategory ? `${selectedCategory} Tendency` : 'Class Tendency'}
                </h3>
                <p className="text-[10px] text-slate-500">
                    {selectedCategory ? 'Specific proficiency distribution.' : 'Click a node to inspect specific skills.'}
                </p>
            </div>
            {selectedCategory && (
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
                >
                    <Undo2 size={12} /> Return
                </button>
            )}
        </div>

        {/* Chart Container */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center">
            {proficiencies.length === 0 ? (
                <div className="text-center text-slate-500 text-xs italic">
                    <Zap size={32} className="mx-auto mb-2 opacity-20"/>
                    No data recorded yet.
                </div>
            ) : (
                <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl overflow-visible">
                    {/* Background Grid */}
                    <g>{renderGrid()}</g>
                    <g>{renderAxis()}</g>

                    {/* The Data Polygon */}
                    <polygon 
                        points={polygonPoints} 
                        fill={fillColor} 
                        stroke={themeColor} 
                        strokeWidth="2"
                        className="transition-all duration-700 ease-out"
                        style={{ filter: `drop-shadow(0 0 10px ${strokeColor})` }}
                    />

                    {/* Interactive Dots & Labels */}
                    {chartData.map((d, i) => {
                        const coords = getCoordinates(isAnimating ? d.value * 0.1 : d.value, i, d.fullMark);
                        const labelCoords = getCoordinates(d.fullMark * 1.15, i, d.fullMark);
                        const isGhost = !d.label;

                        if (isGhost) return null; // Don't render text/dots for padding points

                        return (
                            <g key={i} className="group/node" onClick={() => handleClick(d)} style={{ cursor: !selectedCategory ? 'pointer' : 'default' }}>
                                {/* Label */}
                                <text 
                                    x={labelCoords.x} 
                                    y={labelCoords.y} 
                                    textAnchor="middle" 
                                    dominantBaseline="middle"
                                    className={`text-[10px] font-bold uppercase fill-slate-400 transition-all duration-300 ${!selectedCategory ? 'group-hover/node:fill-white group-hover/node:text-[12px]' : ''}`}
                                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                                >
                                    {d.label}
                                </text>
                                
                                {/* Value Text (On Hover) */}
                                <text 
                                    x={coords.x} 
                                    y={coords.y - 15} 
                                    textAnchor="middle"
                                    className="text-[10px] fill-white font-mono opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none shadow-black drop-shadow-md font-bold bg-black"
                                >
                                    {d.value}
                                </text>

                                {/* Vertex Dot */}
                                <circle 
                                    cx={coords.x} 
                                    cy={coords.y} 
                                    r="4" 
                                    fill={themeColor} 
                                    stroke="#0f172a" 
                                    strokeWidth="2"
                                    className="transition-all duration-300 group-hover/node:r-6 group-hover/node:stroke-white"
                                />
                            </g>
                        );
                    })}
                </svg>
            )}
        </div>
        
        {/* Decorative Background Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-3xl opacity-20 pointer-events-none rounded-full ${selectedCategory ? 'bg-cyan-500' : 'bg-yellow-500'}`}></div>
    </div>
  );
};
