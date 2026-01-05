import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Organic blobs moving in background */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-vivid/10 blur-[130px]"
                animate={{
                    x: [0, -70, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />
            <motion.div
                className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent/30 blur-[100px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
            />
        </div>
    );
};
