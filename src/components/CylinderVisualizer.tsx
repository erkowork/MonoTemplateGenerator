import React from 'react';
import { motion } from 'motion/react';

interface Marker {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  angle: number;
}

interface Props {
  points: number;
  diameter: number;
}

export const CylinderVisualizer: React.FC<Props> = ({ points }) => {
  const radius: number = 80;
  const centerX: number = 100;
  const centerY: number = 100;

  const markers: Marker[] = Array.from({ length: points }).map((_, i) => {
    const angle: number = (i * 360) / points;
    const angleRad: number = (angle - 90) * (Math.PI / 180);
    const x: number = centerX + radius * Math.cos(angleRad);
    const y: number = centerY + radius * Math.sin(angleRad);
    const labelX: number = centerX + (radius + 15) * Math.cos(angleRad);
    const labelY: number = centerY + (radius + 15) * Math.sin(angleRad);
    
    return { x, y, labelX, labelY, angle };
  });

  return (
    <div className="w-full aspect-square max-w-[300px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Outer Circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        
        {/* Center Point */}
        <circle cx={centerX} cy={centerY} r="2" fill="white" />

        {/* Markers */}
        {markers.map((m: Marker, i: number) => (
          <g key={i}>
            <motion.line
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: i * 0.05 }}
              x1={centerX}
              y1={centerY}
              x2={m.x}
              y2={m.y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 + 0.3 }}
              cx={m.x}
              cy={m.y}
              r="4"
              fill="white"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            />
            <text
              x={m.labelX}
              y={m.labelY}
              fill="rgba(255,255,255,0.6)"
              fontSize="10"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="font-mono"
            >
              {m.angle}°
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
