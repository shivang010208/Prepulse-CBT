import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalculate = () => {
    try {
      const fullExpr = equation + display;
      // Sanitize input to only allowed characters
      const sanitized = fullExpr.replace(/[^0-9+\-*/().\s]/g, '');
      // Evaluate basic arithmetic safely
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(String(Number(result.toFixed(6))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleScientific = (type: 'sqrt' | 'sq' | 'sin' | 'cos' | 'log' | 'ln') => {
    try {
      const val = parseFloat(display);
      let res = 0;
      if (type === 'sqrt') res = Math.sqrt(val);
      else if (type === 'sq') res = val * val;
      else if (type === 'sin') res = Math.sin((val * Math.PI) / 180);
      else if (type === 'cos') res = Math.cos((val * Math.PI) / 180);
      else if (type === 'log') res = Math.log10(val);
      else if (type === 'ln') res = Math.log(val);

      setDisplay(String(Number(res.toFixed(6))));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exam CBT Calculator</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="my-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
          <div className="h-4 text-xs font-mono text-slate-500 truncate">{equation}</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 truncate tracking-tight">{display}</div>
        </div>

        {/* Scientific Row */}
        <div className="grid grid-cols-4 gap-1.5 mb-2 text-xs">
          <button
            onClick={() => handleScientific('sqrt')}
            className="py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-mono"
          >
            √x
          </button>
          <button
            onClick={() => handleScientific('sq')}
            className="py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-mono"
          >
            x²
          </button>
          <button
            onClick={() => handleScientific('sin')}
            className="py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-mono"
          >
            sin
          </button>
          <button
            onClick={() => handleScientific('log')}
            className="py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-mono"
          >
            log
          </button>
        </div>

        {/* Standard Keypad */}
        <div className="grid grid-cols-4 gap-1.5 text-sm">
          <button onClick={handleClear} className="py-2.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 font-semibold">
            C
          </button>
          <button onClick={handleBackspace} className="py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center">
            <Delete className="w-4 h-4" />
          </button>
          <button onClick={() => handleOperator('/')} className="py-2.5 rounded-lg bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 font-mono">
            ÷
          </button>
          <button onClick={() => handleOperator('*')} className="py-2.5 rounded-lg bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 font-mono">
            ×
          </button>

          {['7', '8', '9'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="py-2.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 font-mono font-medium">
              {d}
            </button>
          ))}
          <button onClick={() => handleOperator('-')} className="py-2.5 rounded-lg bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 font-mono">
            -
          </button>

          {['4', '5', '6'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="py-2.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 font-mono font-medium">
              {d}
            </button>
          ))}
          <button onClick={() => handleOperator('+')} className="py-2.5 rounded-lg bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 font-mono">
            +
          </button>

          {['1', '2', '3'].map((d) => (
            <button key={d} onClick={() => handleDigit(d)} className="py-2.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 font-mono font-medium">
              {d}
            </button>
          ))}
          <button onClick={handleCalculate} className="row-span-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-lg">
            =
          </button>

          <button onClick={() => handleDigit('0')} className="col-span-2 py-2.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 font-mono font-medium">
            0
          </button>
          <button onClick={() => handleDigit('.')} className="py-2.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 font-mono font-semibold">
            .
          </button>
        </div>
      </div>
    </div>
  );
};
