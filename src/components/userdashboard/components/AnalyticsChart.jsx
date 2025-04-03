import React from 'react';
import { cn } from '../../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsChart = ({ data, title, className }) => {
    return (
        <div className={cn(
            "p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30",
            "transition-all duration-200 hover:border-[#B4A5FF]/50",
            className
        )}>
            <h3 className="text-lg font-semibold text-[#E2DDFF] mb-4">{title}</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2E1D4C" />
                        <XAxis
                            dataKey="name"
                            stroke="#B4A5FF"
                            tick={{ fill: '#B4A5FF' }}
                        />
                        <YAxis
                            stroke="#B4A5FF"
                            tick={{ fill: '#B4A5FF' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#13091F',
                                border: '1px solid #2E1D4C',
                                borderRadius: '8px',
                                color: '#E2DDFF'
                            }}
                            labelStyle={{ color: '#B4A5FF' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#B4A5FF"
                            strokeWidth={2}
                            dot={{ fill: '#2E1D4C', stroke: '#B4A5FF', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsChart; 