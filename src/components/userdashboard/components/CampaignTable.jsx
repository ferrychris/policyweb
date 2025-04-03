import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const PolicyTable = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'asc'
    });

    const sortData = (data, key, direction) => {
        return [...data].sort((a, b) => {
            if (direction === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            }
            return a[key] < b[key] ? 1 : -1;
        });
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedData = sortData(data, sortConfig.key, sortConfig.direction);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'text-green-400 bg-green-400/10';
            case 'pending':
                return 'text-yellow-400 bg-yellow-400/10';
            case 'expired':
                return 'text-red-400 bg-red-400/10';
            default:
                return 'text-[#B4A5FF] bg-[#B4A5FF]/10';
        }
    };

    const getComplianceColor = (value) => {
        if (value >= 98) return 'text-green-400';
        if (value >= 95) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm text-[#B4A5FF] border-b border-[#2E1D4C]/30">
                        <th className="pb-4 font-medium">
                            <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-1 hover:text-[#E2DDFF] transition-colors"
                            >
                                Policy Name
                                {sortConfig.key === 'name' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </th>
                        <th className="pb-4 font-medium">
                            <button
                                onClick={() => handleSort('status')}
                                className="flex items-center gap-1 hover:text-[#E2DDFF] transition-colors"
                            >
                                Status
                                {sortConfig.key === 'status' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </th>
                        <th className="pb-4 font-medium">
                            <button
                                onClick={() => handleSort('lastUpdated')}
                                className="flex items-center gap-1 hover:text-[#E2DDFF] transition-colors"
                            >
                                Last Updated
                                {sortConfig.key === 'lastUpdated' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </th>
                        <th className="pb-4 font-medium">
                            <button
                                onClick={() => handleSort('compliance')}
                                className="flex items-center gap-1 hover:text-[#E2DDFF] transition-colors"
                            >
                                Compliance
                                {sortConfig.key === 'compliance' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </th>
                        <th className="pb-4 font-medium">
                            <button
                                onClick={() => handleSort('reviews')}
                                className="flex items-center gap-1 hover:text-[#E2DDFF] transition-colors"
                            >
                                Reviews
                                {sortConfig.key === 'reviews' && (
                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((policy, index) => (
                        <motion.tr
                            key={policy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-[#E2DDFF] border-b border-[#2E1D4C]/20 last:border-0"
                        >
                            <td className="py-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#B4A5FF]" />
                                    <span>{policy.name}</span>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    getStatusColor(policy.status)
                                )}>
                                    {policy.status}
                                </span>
                            </td>
                            <td className="py-4 text-[#B4A5FF]">{policy.lastUpdated}</td>
                            <td className="py-4">
                                <div className="flex items-center gap-2">
                                    <span className={getComplianceColor(policy.compliance)}>
                                        {policy.compliance}%
                                    </span>
                                    {policy.compliance >= 98 ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                                    )}
                                </div>
                            </td>
                            <td className="py-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#B4A5FF]" />
                                    <span>{policy.reviews}</span>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PolicyTable; 