import { motion } from 'framer-motion';
import type { ReactNode, MouseEventHandler } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  onClick,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-bg-card hover:bg-bg-secondary text-text-primary border border-white/20',
    danger: 'bg-lose hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-text-primary'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        children
      )}
    </motion.button>
  );
}
