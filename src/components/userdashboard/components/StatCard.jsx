import React from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, change, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                "p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30",
                "transition-all duration-200 hover:border-[#B4A5FF]/50",
                "group relative overflow-hidden",
                className
            )}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B4A5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center gap-4 relative">
                {Icon && (
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="p-3 rounded-lg bg-[#2E1D4C]/30 group-hover:bg-[#2E1D4C]/50 transition-colors"
                    >
                        <Icon className="w-5 h-5 text-[#B4A5FF]" />
                    </motion.div>
                )}
                <div>
                    <p className="text-sm font-medium text-[#B4A5FF]">{label}</p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-2xl font-semibold text-[#E2DDFF]"
                    >
                        {value}
                    </motion.p>
                    {change && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-1 text-xs text-[#B4A5FF]/80"
                        >
                            {change}
                        </motion.p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard; 