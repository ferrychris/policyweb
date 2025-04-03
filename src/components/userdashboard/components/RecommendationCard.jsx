import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, FileEdit, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const RecommendationCard = ({ title, description, impact, priority, category, suggestedChanges, estimatedTime }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getImpactColor = (impact) => {
        switch (impact.toLowerCase()) {
            case 'high':
                return 'text-red-400 bg-red-400/10';
            case 'medium':
                return 'text-yellow-400 bg-yellow-400/10';
            case 'low':
                return 'text-green-400 bg-green-400/10';
            default:
                return 'text-[#B4A5FF] bg-[#B4A5FF]/10';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'text-red-400';
            case 'important':
                return 'text-yellow-400';
            case 'normal':
                return 'text-green-400';
            default:
                return 'text-[#B4A5FF]';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 overflow-hidden"
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[#E2DDFF] font-medium">{title}</h4>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                getImpactColor(impact)
                            )}>
                                {impact}
                            </span>
                        </div>
                        <p className="text-[#B4A5FF] text-sm mb-2">{description}</p>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-[#B4A5FF]">
                                <FileEdit className="w-3 h-3" />
                                {category}
                            </div>
                            <div className="flex items-center gap-1 text-[#B4A5FF]">
                                <Clock className="w-3 h-3" />
                                {estimatedTime}
                            </div>
                            <div className={cn(
                                "flex items-center gap-1",
                                getPriorityColor(priority)
                            )}>
                                {priority === 'Urgent' ? (
                                    <AlertCircle className="w-3 h-3" />
                                ) : (
                                    <CheckCircle className="w-3 h-3" />
                                )}
                                {priority}
                            </div>
                        </div>
                    </div>
                    <motion.button
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 hover:bg-[#B4A5FF]/10 rounded-lg transition-colors"
                    >
                        <ChevronDown className="w-5 h-5 text-[#B4A5FF]" />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#2E1D4C]/50"
                    >
                        <div className="p-4">
                            <h5 className="text-[#E2DDFF] text-sm font-medium mb-2">Suggested Changes</h5>
                            <ul className="space-y-2">
                                {suggestedChanges.map((change, index) => (
                                    <li key={index} className="flex items-center gap-2 text-[#B4A5FF] text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B4A5FF]" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 flex gap-2">
                                <button className="px-3 py-1.5 bg-[#B4A5FF]/20 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors text-sm">
                                    Apply Changes
                                </button>
                                <button className="px-3 py-1.5 bg-[#2E1D4C]/50 text-[#B4A5FF] rounded-lg hover:bg-[#2E1D4C]/70 transition-colors text-sm">
                                    Schedule Review
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default RecommendationCard; 