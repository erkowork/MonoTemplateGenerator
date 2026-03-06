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

export const CylinderVisualizer: React.FC<Props> = ({ points, diameter }) => {
  const centerX = 100;
  const centerY = 100;
  const ellipseRadiusX = 60;
  const ellipseRadiusY = 25;

  const markers = Array.from({ length: points }).map((_, i) => {
    const angle = (i * 360) / points;
    const angleRad = (angle - 90) * (Math.PI / 180);
    const x = centerX + ellipseRadiusX * Math.cos(angleRad);
    const y = centerY + ellipseRadiusY * Math.sin(angleRad);
    return { x, y, angle };
  });

  return (
    <div className="w-full aspect-square max-w-[200px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        {/* Back half of bottom ellipse */}
        <path
          d={`M ${centerX - ellipseRadiusX} ${centerY + 60} A ${ellipseRadiusX} ${ellipseRadiusY} 0 0 0 ${centerX + ellipseRadiusX} ${centerY + 60}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 2"
          className="opacity-20"
        />

        {/* Vertical lines */}
        <line x1={centerX - ellipseRadiusX} y1={centerY} x2={centerX - ellipseRadiusX} y2={centerY + 60} stroke="currentColor" strokeWidth="2" className="opacity-20" />
        <line x1={centerX + ellipseRadiusX} y1={centerY} x2={centerX + ellipseRadiusX} y2={centerY + 60} stroke="currentColor" strokeWidth="2" className="opacity-20" />

        {/* Front half of bottom ellipse */}
        <path
          d={`M ${centerX - ellipseRadiusX} ${centerY + 60} A ${ellipseRadiusX} ${ellipseRadiusY} 0 0 1 ${centerX + ellipseRadiusX} ${centerY + 60}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-40"
        />

        {/* Top ellipse (Pipe mouth) */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={ellipseRadiusX}
          ry={ellipseRadiusY}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-60"
        />

        {/* Markers on the top edge */}
        {markers.map((m, i) => (
          <g key={i}>
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              cx={m.x}
              cy={m.y}
              r="3"
              fill="var(--accent)"
            />
            {/* Vertical marking line on the cylinder surface */}
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              x1={m.x}
              y1={m.y}
              x2={m.x}
              y2={m.y + 40}
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="opacity-40"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
