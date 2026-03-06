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
import { Unit, CalculationResults, TemplateData, SavedState, ThemeType } from './types';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [diameter, setDiameter] = useState<string>('');
  const [points, setPoints] = useState<number>(8);
  const [unit, setUnit] = useState<Unit>('cm');
  const [theme, setTheme] = useState<ThemeType>('night');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Load last calculation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cylinder_calc_last');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDiameter(data.d || '');
        setPoints(data.p || 8);
        setUnit(data.u || 'cm');
        setTheme(data.t || 'night');
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
      const stateToSave = {
        d: diameter,
        p: points,
        u: unit,
        t: theme
      };
      localStorage.setItem('cylinder_calc_last', JSON.stringify(stateToSave));
    }
  };

  const handleReset = (): void => {
    setDiameter('');
    setPoints(8);
    setShowResults(false);
  };

  const handleDownloadPDF = async (): Promise<void> => {
    if (calculations) {
      setIsGeneratingPDF(true);
      setPdfSuccess(false);
      
      const data: TemplateData = {
        diameter: parseFloat(diameter),
        circumference: calculations.circumference,
        points,
        unit
      };
      
      try {
        await generatePDF(data);
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3000);
      } catch (error) {
        console.error("PDF Generation failed", error);
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  const handleThemeChange = (id: ThemeType, e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    const ripple = document.createElement('div');
    ripple.className = 'theme-transition-overlay';
    ripple.style.setProperty('--x', `${x}px`);
    ripple.style.setProperty('--y', `${y}px`);
    ripple.style.setProperty('--color', `var(--bg)`);
    document.body.appendChild(ripple);
    
    requestAnimationFrame(() => {
      ripple.classList.add('theme-transition-active');
      setTheme(id);
      setTimeout(() => {
        ripple.remove();
      }, 800);
    });
  };

  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'coffee', label: 'Coffee', color: '#948979' },
    { id: 'matcha', label: 'Matcha', color: '#a27b5c' },
    { id: 'cosy', label: 'Cosy', color: '#b87c4c' },
    { id: 'sunset', label: 'Sunset', color: '#f08a5d' },
    { id: 'beton', label: 'Beton', color: '#ff9b51' },
    { id: 'gold', label: 'Gold', color: '#fa8112' },
    { id: 'mint', label: 'Mint', color: '#cdb885' },
    { id: 'night', label: 'Night', color: '#9b3922' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start max-w-2xl mx-auto transition-all duration-500"
    >
      {/* Theme Selector */}
      <motion.div 
        variants={itemVariants}
        className="w-full flex justify-center gap-2 mb-8 overflow-x-auto py-2 px-4 no-scrollbar"
      >
        {themes.map((t, idx) => (
          <motion.button
            key={t.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => handleThemeChange(t.id, e)}
            className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${
              theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: t.color }}
            title={t.label}
          />
        ))}
      </motion.div>

      {/* Header */}
      <motion.header 
        variants={itemVariants}
        className="w-full text-center mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">Cylinder Angle</h1>
        <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest font-medium">Template Generator</p>
      </motion.header>

      {/* Main Control Panel */}
      <motion.div 
        variants={itemVariants}
        layout
        className="w-full glass-panel rounded-[2.5rem] p-8 mb-6"
      >
        <div className="space-y-6">
          {/* Diameter Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1 flex items-center gap-2">
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUnit(unit === 'cm' ? 'mm' : 'cm')}
                className="absolute right-3 px-3 py-1 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors"
              >
                {unit.toUpperCase()}
              </motion.button>
            </div>
          </div>

          {/* Points Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1 flex items-center gap-2">
              <Settings size={12} /> Angle Points
            </label>
            <div className="flex gap-2">
              {[4, 8, 12, 16].map((p: number) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPoints(p)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                    points === p ? 'bg-[var(--btn-bg)] text-[var(--btn-text)]' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {p}
                </motion.button>
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
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCalculate}
              disabled={!diameter}
              className="glass-button flex-1 flex items-center justify-center gap-2"
            >
              Calculate <ChevronRight size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="glass-button-secondary p-4"
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {showResults && calculations && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-full space-y-6"
          >
            {/* Visualizer */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-panel rounded-[2.5rem] p-8 flex flex-col items-center"
            >
              <CylinderVisualizer points={points} diameter={parseFloat(diameter)} />
              <div className="grid grid-cols-2 gap-8 w-full mt-8">
                <div className="text-center">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Circumference</p>
                  <p className="text-2xl font-light">{calculations.circumference.toFixed(2)}<span className="text-sm ml-1 text-[var(--text-muted)]">{unit}</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Step Distance</p>
                  <p className="text-2xl font-light">{calculations.stepDistance.toFixed(2)}<span className="text-sm ml-1 text-[var(--text-muted)]">{unit}</span></p>
                </div>
              </div>
            </motion.div>

            {/* Marking List */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-[2.5rem] p-8"
            >
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-4 flex items-center gap-2">
                <Ruler size={12} /> Marking Positions
              </h3>
              <div className="space-y-3">
                {calculations.markingPoints.map((p, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.02 }}
                    className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm font-medium text-[var(--text-muted)]">{p.angle.toFixed(0)}°</span>
                    <span className="font-mono text-sm">{p.position.toFixed(2)} {unit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Export Actions */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 gap-3"
            >
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="glass-button py-5 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isGeneratingPDF ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="animate-spin" size={20} />
                      Generating Template...
                    </motion.div>
                  ) : pdfSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-2 text-emerald-400"
                    >
                      <CheckCircle2 size={20} />
                      Template Ready!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-3"
                    >
                      <FileText size={20} />
                      Generate 1:1 PDF Template
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {isGeneratingPDF && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 h-1 bg-white/30 w-full"
                  />
                )}
              </motion.button>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Info size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  The PDF is generated at 1:1 scale. Ensure "Actual Size" or "Scale: 100%" is selected in your printer settings.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Installation */}
      <motion.footer 
        variants={itemVariants}
        className="mt-12 mb-8 text-center"
      >
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">
          Cylinder Angle Template - by GoldApps - copyright 2026
        </p>
      </motion.footer>
    </motion.div>
  );
}
