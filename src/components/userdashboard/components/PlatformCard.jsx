import React from 'react';
import { cn } from '../../../lib/utils';
import { Globe, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const PlatformCard = ({ name, status, lastSync, policies, className }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-400';
            case 'pending':
                return 'text-yellow-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-[#B4A5FF]';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'error':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Globe className="w-4 h-4" />;
        }
    };

    return (
        <div className={cn(
            "p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30",
            "transition-all duration-200 hover:border-[#B4A5FF]/50",
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#2E1D4C]/30">
                        <Globe className="w-5 h-5 text-[#B4A5FF]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#E2DDFF]">{name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                                "flex items-center gap-1 text-sm",
                                getStatusColor(status)
                            )}>
                                {getStatusIcon(status)}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            {lastSync && (
                                <span className="text-xs text-[#B4A5FF]/60">
                                    Last sync: {lastSync}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-[#B4A5FF]">Active Policies</p>
                    <p className="text-2xl font-semibold text-[#E2DDFF]">{policies}</p>
                </div>
            </div>
        </div>
    );
};

export default PlatformCard; 