import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  FileText, 
  RotateCcw, 
  ChevronRight, 
  Info,
  Maximize2,
  Ruler
} from 'lucide-react';
import { CylinderVisualizer } from './components/CylinderVisualizer';
import { generatePDF } from './utils/pdfGenerator';
import { Unit, CalculationResults, TemplateData, SavedState } from './types';

export default function App() {
  const [diameter, setDiameter] = useState<string>('');
  const [points, setPoints] = useState<number>(8);
  const [unit, setUnit] = useState<Unit>('cm');
  const [showResults, setShowResults] = useState<boolean>(false);

  // Load last calculation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cylinder_calc_last');
    if (saved) {
      try {
        const { d, p, u }: SavedState = JSON.parse(saved);
        setDiameter(d);
        setPoints(p);
        setUnit(u);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Memoized calculation logic
  const calculations = useMemo<CalculationResults | null>(() => {
    const d: number = parseFloat(diameter);
    if (isNaN(d) || d <= 0) return null;

    const circumference: number = Math.PI * d;
    const stepDistance: number = circumference / points;
    const markingPoints = Array.from({ length: points + 1 }).map((_, i) => ({
      angle: (i * 360) / points,
      position: i * stepDistance
    }));

    return {
      circumference,
      stepDistance,
      markingPoints
    };
  }, [diameter, points]);

  const handleCalculate = (): void => {
    if (calculations) {
      setShowResults(true);
      const stateToSave: SavedState = {
        d: diameter,
        p: points,
        u: unit
      };
      localStorage.setItem('cylinder_calc_last', JSON.stringify(stateToSave));
    }
  };

  const handleReset = (): void => {
    setDiameter('');
    setPoints(8);
    setShowResults(false);
  };

  const handleDownloadPDF = (): void => {
    if (calculations) {
      const data: TemplateData = {
        diameter: parseFloat(diameter),
        circumference: calculations.circumference,
        points,
        unit
      };
      generatePDF(data);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start max-w-2xl mx-auto">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center mb-8"
      >
        <h1 className="text-3xl font-light tracking-tight mb-2">Cylinder Angle</h1>
        <p className="text-white/40 text-sm uppercase tracking-widest font-medium">Template Generator</p>
      </motion.header>

      {/* Main Control Panel */}
      <motion.div 
        layout
        className="w-full glass-panel rounded-[2.5rem] p-8 mb-6"
      >
        <div className="space-y-6">
          {/* Diameter Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase ml-1 flex items-center gap-2">
              <Maximize2 size={12} /> Diameter
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={diameter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiameter(e.target.value)}
                placeholder="0.00"
                className="glass-input w-full text-2xl font-light pr-16"
              />
              <button 
                onClick={() => setUnit(unit === 'cm' ? 'mm' : 'cm')}
                className="absolute right-3 px-3 py-1 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors"
              >
                {unit.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Points Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase ml-1 flex items-center gap-2">
              <Settings size={12} /> Angle Points
            </label>
            <div className="flex gap-2">
              {[4, 8, 12, 16].map((p: number) => (
                <button
                  key={p}
                  onClick={() => setPoints(p)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                    points === p ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              <input
                type="number"
                value={points}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoints(parseInt(e.target.value) || 0)}
                className="w-16 glass-input text-center py-3"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleCalculate}
              disabled={!diameter}
              className="glass-button flex-1 flex items-center justify-center gap-2"
            >
              Calculate <ChevronRight size={18} />
            </button>
            <button 
              onClick={handleReset}
              className="glass-button-secondary p-4"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && calculations && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full space-y-6"
          >
            {/* Visualizer */}
            <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col items-center">
              <CylinderVisualizer points={points} diameter={parseFloat(diameter)} />
              <div className="grid grid-cols-2 gap-8 w-full mt-8">
                <div className="text-center">
                  <p className="text-xs font-semibold text-white/40 uppercase mb-1">Circumference</p>
                  <p className="text-2xl font-light">{calculations.circumference.toFixed(2)}<span className="text-sm ml-1 text-white/40">{unit}</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white/40 uppercase mb-1">Step Distance</p>
                  <p className="text-2xl font-light">{calculations.stepDistance.toFixed(2)}<span className="text-sm ml-1 text-white/40">{unit}</span></p>
                </div>
              </div>
            </div>

            {/* Marking List */}
            <div className="glass-panel rounded-[2.5rem] p-8">
              <h3 className="text-xs font-semibold text-white/40 uppercase mb-4 flex items-center gap-2">
                <Ruler size={12} /> Marking Positions
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {calculations.markingPoints.map((p, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm font-medium text-white/60">{p.angle.toFixed(0)}°</span>
                    <span className="font-mono text-sm">{p.position.toFixed(2)} {unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleDownloadPDF}
                className="glass-button py-5 flex items-center justify-center gap-3"
              >
                <FileText size={20} /> Generate 1:1 PDF Template
              </button>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Info size={16} className="text-white/40 mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/40 leading-relaxed">
                  The PDF is generated at 1:1 scale. Ensure "Actual Size" or "Scale: 100%" is selected in your printer settings.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Installation */}
      <footer className="mt-12 mb-8 text-center">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
          Precision Engineering Tool v1.0
        </p>
      </footer>
    </div>
  );
}
