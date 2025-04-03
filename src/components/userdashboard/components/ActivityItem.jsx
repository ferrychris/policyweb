import React from 'react';
import { cn } from '../../../lib/utils';

const ActivityItem = ({ icon: Icon, title, description, time, className }) => {
    return (
        <div className={cn(
            "flex items-start gap-4 p-4",
            "bg-[#13091F] rounded-lg border border-[#2E1D4C]/30",
            "hover:border-[#B4A5FF]/50 transition-all duration-200",
            className
        )}>
            {Icon && (
                <div className="p-2 rounded-lg bg-[#2E1D4C]/30">
                    <Icon className="w-4 h-4 text-[#B4A5FF]" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#E2DDFF] truncate">
                        {title}
                    </p>
                    <span className="text-sm text-[#B4A5FF] whitespace-nowrap">
                        {time}
                    </span>
                </div>
                {description && (
                    <p className="mt-1 text-sm text-[#B4A5FF]/80">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ActivityItem; 