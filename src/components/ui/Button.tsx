import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type ButtonProps = React.ComponentProps<typeof motion.button> & {
    visualVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    visualVariant = 'primary',
    isLoading,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:pointer-events-none relative overflow-hidden";

    const variantsMap = {
        primary: "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25",
        secondary: "bg-accent text-primary-dark hover:bg-accent-dark",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        ghost: "text-gray-600 hover:text-primary hover:bg-gray-100",
    };

    return (
        <motion.button
            ref={ref}
            className={`${baseStyles} ${variantsMap[visualVariant]} ${className}`}
            disabled={disabled || isLoading}
            whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </motion.button>
    );
});

Button.displayName = "Button";
