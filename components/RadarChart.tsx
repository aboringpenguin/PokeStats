import React from 'react';
import { PokemonStat } from '../types';

interface RadarChartProps {
  stats: PokemonStat;
}

const RadarChart: React.FC<RadarChartProps> = ({ stats }) => {
  const size = 220;
  const center = size / 2;
  const labels: (keyof PokemonStat)[] = ['hp', 'attack', 'defense', 'speed', 'sp_def', 'sp_atk'];
  const maxStat = 200; // A reasonable max for plotting

  const points = labels.map((label, i) => {
    const value = stats[label];
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = center + (value / maxStat) * center * 0.8 * Math.cos(angle);
    const y = center + (value / maxStat) * center * 0.8 * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const axisPoints = labels.map((_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = center + center * 0.95 * Math.cos(angle);
    const y = center + center * 0.95 * Math.sin(angle);
    return { x, y };
  });

  const gridLines = [0.25, 0.5, 0.75, 1].map(scale => {
    return labels.map((_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = center + center * 0.8 * scale * Math.cos(angle);
      const y = center + center * 0.8 * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  const labelText = (label: string) => {
      const parts = label.split('_');
      if (parts.length > 1) return `${parts[0].charAt(0).toUpperCase()}.${parts[1].toUpperCase()}`;
      return label.toUpperCase();
  }

  return (
    <svg width={size} height={size} viewBox={`-15 -15 ${size + 30} ${size + 30}`}>
      {/* Grid Lines */}
      {gridLines.map((line, i) => (
        <polygon key={i} points={line} fill="none" stroke="#4A5568" strokeWidth="1" />
      ))}

      {/* Axes */}
      {axisPoints.map((point, i) => (
        <line key={i} x1={center} y1={center} x2={point.x} y2={point.y} stroke="#4A5568" strokeWidth="1" />
      ))}
      
      {/* Data Polygon */}
      <polygon points={points} fill="rgba(33, 150, 243, 0.5)" stroke="#2196F3" strokeWidth="2" />

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = center + center * 1.05 * Math.cos(angle);
        const y = center + center * 1.05 * Math.sin(angle);
        return (
          <text
            key={label}
            x={x}
            y={y}
            fill="#A0AEC0"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {labelText(label)}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;