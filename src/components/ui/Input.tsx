import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700 ml-1">
        {label}
      </label>
      <motion.div
        className="relative group"
        initial={false}
        animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          className={`
            w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm
            text-gray-800 placeholder-gray-400
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            hover:border-gray-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
            {icon}
          </div>
        )}
      </motion.div>
      {error && <span className="text-xs text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">{error}</span>}
    </div>
  );
};
