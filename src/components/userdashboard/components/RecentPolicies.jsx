import React from 'react';
import { FileText, Download } from 'lucide-react';
import { cn } from '../../../lib/utils';

const PolicyItem = ({ title, lastEdited, onDownload }) => (
    <div className={cn(
        "flex items-center justify-between p-4 rounded-lg",
        "bg-[#13091F] border border-[#2E1D4C]/30",
        "hover:border-[#B4A5FF]/50 transition-all duration-200"
    )}>
        <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-[#2E1D4C]/30">
                <FileText className="w-4 h-4 text-[#B4A5FF]" />
            </div>
            <div>
                <p className="text-sm font-medium text-[#E2DDFF]">{title}</p>
                <p className="text-xs text-[#B4A5FF]">{lastEdited}</p>
            </div>
        </div>
        <button
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-[#2E1D4C]/30 transition-colors"
        >
            <Download className="w-4 h-4 text-[#B4A5FF]" />
        </button>
    </div>
);

const RecentPolicies = ({ policies, onViewAll, className }) => {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#E2DDFF]">Recent Policies</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                >
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {policies.map((policy, index) => (
                    <PolicyItem
                        key={policy.id || index}
                        title={policy.title}
                        lastEdited={policy.lastEdited}
                        onDownload={() => policy.onDownload?.(policy)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentPolicies; 