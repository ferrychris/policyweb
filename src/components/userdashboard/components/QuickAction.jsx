import React from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

const QuickAction = ({ icon: Icon, label, description, onClick, className }) => {
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex items-center gap-4 p-6 w-full",
                "bg-[#13091F] rounded-xl border border-[#2E1D4C]/30",
                "hover:border-[#B4A5FF]/50 transition-all duration-200",
                "group relative overflow-hidden",
                className
            )}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B4A5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {Icon && (
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 rounded-lg bg-[#2E1D4C]/30 group-hover:bg-[#2E1D4C]/50 transition-colors relative"
                >
                    <Icon className="w-5 h-5 text-[#B4A5FF]" />
                </motion.div>
            )}
            <div className="text-left relative">
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium text-[#E2DDFF]"
                >
                    {label}
                </motion.p>
                {description && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xs text-[#B4A5FF]"
                    >
                        {description}
                    </motion.p>
                )}
            </div>
        </motion.button>
    );
};

export default QuickAction; 