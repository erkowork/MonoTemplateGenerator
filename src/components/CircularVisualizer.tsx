import React from 'react';
import { motion } from 'motion/react';

interface CircularVisualizerProps {
  points: number;
  diameter: number;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({ points, diameter }) => {
  const radius = 80;
  const center = 100;
  
  const anglePoints = Array.from({ length: points }).map((_, i) => (i * 360) / points);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        {/* Outer Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="opacity-20"
        />
        
        {/* Inner Circle (Pipe Wall) */}
        <circle
          cx={center}
          cy={center}
          r={radius - 4}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-40"
        />

        {/* Angle Markers */}
        {anglePoints.map((angle, i) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const x1 = center + (radius - 10) * Math.cos(rad);
          const y1 = center + (radius - 10) * Math.sin(rad);
          const x2 = center + (radius + 10) * Math.cos(rad);
          const y2 = center + (radius + 10) * Math.sin(rad);
          
          const textX = center + (radius + 25) * Math.cos(rad);
          const textY = center + (radius + 25) * Math.sin(rad);

          return (
            <g key={i}>
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                x={textX}
                y={textY}
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-[10px] font-bold fill-current opacity-60"
              >
                {angle}°
              </motion.text>
            </g>
          );
        })}

        {/* Center Indicator */}
        <circle cx={center} cy={center} r="2" fill="var(--accent)" />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Ø {diameter}</span>
      </div>
    </div>
  );
};
