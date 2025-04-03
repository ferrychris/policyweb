import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart2, LineChart, Activity, FileText, Shield, CheckCircle, AlertCircle, History, GitCompare, PieChart, ScatterChart, Calendar, Filter, Download, ChevronRight, ChevronLeft, X, FileDiff, Users, Clock, Tag, GanttChart, BarChart3, AreaChart } from 'lucide-react';

const PolicyMetricsChart = ({ data, title, className }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [chartType, setChartType] = useState('bar');
    const [selectedBar, setSelectedBar] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('total');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [viewMode, setViewMode] = useState('chart');
    const [sortBy, setSortBy] = useState('value');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [showDiffView, setShowDiffView] = useState(false);

    // Mock version history data
    const versionHistory = {
        'v2.1': {
            date: '2 days ago',
            changes: [
                { type: 'added', text: 'New compliance section' },
                { type: 'modified', text: 'Updated security protocols' },
                { type: 'removed', text: 'Deprecated guidelines' }
            ],
            author: 'John Doe',
            reviewers: ['Alice Smith', 'Bob Johnson'],
            tags: ['security', 'compliance'],
            status: 'approved'
        },
        'v2.0': {
            date: '1 week ago',
            changes: [
                { type: 'added', text: 'New policy sections' },
                { type: 'modified', text: 'Updated formatting' }
            ],
            author: 'Jane Smith',
            reviewers: ['Bob Johnson'],
            tags: ['formatting'],
            status: 'approved'
        },
        'v1.0': {
            date: '1 month ago',
            changes: [
                { type: 'added', text: 'Initial policy document' }
            ],
            author: 'Admin',
            reviewers: [],
            tags: ['initial'],
            status: 'draft'
        }
    };

    // Add mock policy content for comparison
    const policyContent = {
        'v2.1': {
            sections: [
                {
                    title: 'Security Protocols',
                    content: 'Updated security protocols include new encryption standards and access control measures.',
                    status: 'modified'
                },
                {
                    title: 'Compliance Guidelines',
                    content: 'New compliance section added with detailed regulatory requirements.',
                    status: 'added'
                }
            ]
        },
        'v2.0': {
            sections: [
                {
                    title: 'Security Protocols',
                    content: 'Basic security protocols with standard encryption.',
                    status: 'unchanged'
                },
                {
                    title: 'General Guidelines',
                    content: 'General guidelines for policy implementation.',
                    status: 'removed'
                }
            ]
        }
    };

    // Export functionality
    const exportData = (format) => {
        const exportData = {
            title,
            period: selectedPeriod,
            data: sortedData,
            versionHistory,
            metrics: {
                total: currentValue,
                new: data.reduce((sum, item) => sum + item.newPolicies, 0),
                updated: data.reduce((sum, item) => sum + item.updatedPolicies, 0)
            }
        };

        let content;
        let filename;
        let type;

        switch (format) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${selectedPeriod}.json`;
                type = 'application/json';
                break;
            case 'csv':
                content = [
                    ['Period', 'Total Policies', 'New Policies', 'Updated Policies'],
                    ...sortedData.map(item => [
                        item.name,
                        item.value,
                        item.newPolicies,
                        item.updatedPolicies
                    ])
                ].map(row => row.join(',')).join('\n');
                filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${selectedPeriod}.csv`;
                type = 'text/csv';
                break;
            case 'pdf':
                // In a real implementation, you would use a PDF generation library
                console.log('PDF export would be implemented here');
                return;
        }

        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportMenu(false);
    };

    const maxValue = Math.max(...data.map(item => item.value));
    const previousValue = data[data.length - 2]?.value || 0;
    const currentValue = data[data.length - 1]?.value || 0;
    const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

    // Calculate points for different chart types
    const points = data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        const x = (index / (data.length - 1)) * 100;
        return `${x}% ${100 - height}%`;
    }).join(' ');

    const newPolicyPoints = data.map((item, index) => {
        const height = (item.newPolicies / maxValue) * 100;
        const x = (index / (data.length - 1)) * 100;
        return `${x}% ${100 - height}%`;
    }).join(' ');

    const updatedPolicyPoints = data.map((item, index) => {
        const height = (item.updatedPolicies / maxValue) * 100;
        const x = (index / (data.length - 1)) * 100;
        return `${x}% ${100 - height}%`;
    }).join(' ');

    // Sort data based on selected criteria
    const sortedData = [...data].sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? 1 : -1;
        switch (sortBy) {
            case 'new':
                return (b.newPolicies - a.newPolicies) * multiplier;
            case 'updated':
                return (b.updatedPolicies - a.updatedPolicies) * multiplier;
            default:
                return (b.value - a.value) * multiplier;
        }
    });

    // Calculate pie chart data
    const pieData = [
        { name: 'New Policies', value: data.reduce((sum, item) => sum + item.newPolicies, 0), color: '#4ADE80' },
        { name: 'Updated Policies', value: data.reduce((sum, item) => sum + item.updatedPolicies, 0), color: '#FACC15' },
        { name: 'Existing Policies', value: data.reduce((sum, item) => sum + (item.value - item.newPolicies - item.updatedPolicies), 0), color: '#B4A5FF' }
    ];

    const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

    // Update visualization types to use only valid icons
    const visualizationTypes = [
        { id: 'bar', icon: BarChart2, label: 'Bar Chart' },
        { id: 'line', icon: LineChart, label: 'Line Chart' },
        { id: 'area', icon: AreaChart, label: 'Area Chart' },
        { id: 'pie', icon: PieChart, label: 'Pie Chart' },
        { id: 'scatter', icon: ScatterChart, label: 'Scatter Chart' }
    ];

    return (
        <div className={cn(
            "p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30",
            "transition-all duration-200 hover:border-[#B4A5FF]/50",
            className
        )}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#B4A5FF]" />
                            <h3 className="text-lg font-semibold text-[#E2DDFF]">{title}</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-[#2E1D4C]/30 rounded-lg p-1">
                            {visualizationTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setChartType(type.id)}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors",
                                        chartType === type.id ? "bg-[#B4A5FF]/20 text-[#E2DDFF]" : "text-[#B4A5FF] hover:text-[#E2DDFF]"
                                    )}
                                    title={type.label}
                                >
                                    <type.icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#B4A5FF]" />
                            <span className="text-2xl font-bold text-[#E2DDFF]">
                                {currentValue.toLocaleString()} Policies
                            </span>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1 text-sm rounded-full px-2 py-0.5",
                            percentageChange >= 0
                                ? "text-green-400 bg-green-400/10"
                                : "text-red-400 bg-red-400/10"
                        )}>
                            {percentageChange >= 0 ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <AlertCircle className="w-3 h-3" />
                            )}
                            <span>{Math.abs(percentageChange).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#2E1D4C]/30 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedMetric('total')}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                selectedMetric === 'total' ? "bg-[#B4A5FF]/20 text-[#E2DDFF]" : "text-[#B4A5FF] hover:text-[#E2DDFF]"
                            )}
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSelectedMetric('new')}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                selectedMetric === 'new' ? "bg-[#B4A5FF]/20 text-[#E2DDFF]" : "text-[#B4A5FF] hover:text-[#E2DDFF]"
                            )}
                        >
                            <History className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSelectedMetric('updated')}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                selectedMetric === 'updated' ? "bg-[#B4A5FF]/20 text-[#E2DDFF]" : "text-[#B4A5FF] hover:text-[#E2DDFF]"
                            )}
                        >
                            <GitCompare className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                            className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                        >
                            {viewMode === 'chart' ? <PieChart className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setShowVersionHistory(!showVersionHistory)}
                            className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                        >
                            <History className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                        >
                            {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </button>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-[#2E1D4C]/30 text-[#B4A5FF] border border-[#2E1D4C]/50 rounded-lg px-3 py-1.5 text-sm hover:border-[#B4A5FF]/50 transition-colors focus:outline-none focus:border-[#B4A5FF]"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setComparisonMode(!comparisonMode)}
                            className={cn(
                                "p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors",
                                comparisonMode && "bg-[#B4A5FF]/20"
                            )}
                        >
                            <FileDiff className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Menu */}
            <AnimatePresence>
                {showExportMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 right-6 bg-[#2E1D4C] border border-[#B4A5FF]/30 rounded-lg shadow-lg p-2 z-50"
                    >
                        <div className="text-xs text-[#B4A5FF] mb-2">Export Format</div>
                        <div className="space-y-1">
                            <button
                                onClick={() => exportData('json')}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors"
                            >
                                JSON
                            </button>
                            <button
                                onClick={() => exportData('csv')}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => exportData('pdf')}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors"
                            >
                                PDF
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-[300px] relative">
                {viewMode === 'chart' ? (
                    <>
                        {/* Grid lines with labels */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="w-full border-t border-[#2E1D4C]/30 flex items-center"
                                >
                                    <span className="text-xs text-[#B4A5FF] mr-2 w-16 text-right">
                                        {((maxValue * (4 - index)) / 4).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Chart bars */}
                        {(chartType === 'bar' || chartType === 'both') && (
                            <div className="absolute inset-x-16 inset-y-0 flex items-end justify-between gap-2">
                                {sortedData.map((item, index) => {
                                    const height = (item.value / maxValue) * 100;
                                    const isSelected = selectedBar === index;
                                    return (
                                        <motion.div
                                            key={index}
                                            className="flex-1 flex flex-col items-center gap-2"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div
                                                className="w-full group relative cursor-pointer"
                                                onClick={() => setSelectedBar(isSelected ? null : index)}
                                            >
                                                <motion.div
                                                    className={cn(
                                                        "w-full bg-gradient-to-t rounded-lg transition-all duration-300",
                                                        isSelected
                                                            ? "from-[#B4A5FF]/50 to-[#B4A5FF]/30"
                                                            : "from-[#B4A5FF]/30 to-[#B4A5FF]/10 group-hover:from-[#B4A5FF]/40 group-hover:to-[#B4A5FF]/20"
                                                    )}
                                                    style={{ height: `${height}%` }}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {/* Enhanced Tooltip */}
                                                    <AnimatePresence>
                                                        {(isSelected || height === 100) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute -top-32 left-1/2 -translate-x-1/2 bg-[#2E1D4C] text-[#E2DDFF] px-4 py-3 rounded-lg text-sm whitespace-nowrap border border-[#B4A5FF]/30 shadow-lg min-w-[200px]"
                                                            >
                                                                <div className="font-medium mb-2">{item.name}</div>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[#B4A5FF]">Total Policies</span>
                                                                        <span className="font-medium">{item.value.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-green-400">New Policies</span>
                                                                        <span className="font-medium">+{item.newPolicies}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-yellow-400">Updated Policies</span>
                                                                        <span className="font-medium">{item.updatedPolicies}</span>
                                                                    </div>
                                                                </div>
                                                                {showVersionHistory && (
                                                                    <div className="mt-3 pt-3 border-t border-[#B4A5FF]/20">
                                                                        <div className="text-xs text-[#B4A5FF] mb-2">Version History</div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span>v2.1</span>
                                                                                <span className="text-[#B4A5FF]">2 days ago</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span>v2.0</span>
                                                                                <span className="text-[#B4A5FF]">1 week ago</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span>v1.0</span>
                                                                                <span className="text-[#B4A5FF]">1 month ago</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </div>
                                            <motion.span
                                                className={cn(
                                                    "text-xs font-medium transition-colors",
                                                    isSelected ? "text-[#E2DDFF]" : "text-[#B4A5FF]"
                                                )}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 + 0.3 }}
                                            >
                                                {item.name}
                                            </motion.span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Line overlay */}
                        {(chartType === 'line' || chartType === 'both') && (
                            <div className="absolute inset-x-16 inset-y-0 pointer-events-none">
                                <svg className="w-full h-full">
                                    {/* Main line path */}
                                    <motion.path
                                        d={`M 0 ${100 - (data[0].value / maxValue) * 100} ${points}`}
                                        fill="none"
                                        stroke="#B4A5FF"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.5 }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />
                                    {/* New policies line */}
                                    {selectedMetric === 'new' && (
                                        <motion.path
                                            d={`M 0 ${100 - (data[0].newPolicies / maxValue) * 100} ${newPolicyPoints}`}
                                            fill="none"
                                            stroke="#4ADE80"
                                            strokeWidth="2"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.5 }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                        />
                                    )}
                                    {/* Updated policies line */}
                                    {selectedMetric === 'updated' && (
                                        <motion.path
                                            d={`M 0 ${100 - (data[0].updatedPolicies / maxValue) * 100} ${updatedPolicyPoints}`}
                                            fill="none"
                                            stroke="#FACC15"
                                            strokeWidth="2"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.5 }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                        />
                                    )}
                                    {/* Data points */}
                                    {data.map((item, index) => {
                                        const x = (index / (data.length - 1)) * 100;
                                        const y = 100 - (item.value / maxValue) * 100;
                                        return (
                                            <motion.circle
                                                key={index}
                                                cx={`${x}%`}
                                                cy={`${y}%`}
                                                r="4"
                                                fill="#2E1D4C"
                                                stroke="#B4A5FF"
                                                strokeWidth="2"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: index * 0.1 + 0.5 }}
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                        )}
                    </>
                ) : (
                    // Pie Chart View
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-full h-full">
                            {pieData.map((item, index) => {
                                const startAngle = pieData
                                    .slice(0, index)
                                    .reduce((sum, curr) => sum + (curr.value / totalPieValue) * 360, 0);
                                const endAngle = startAngle + (item.value / totalPieValue) * 360;
                                const startRad = (startAngle * Math.PI) / 180;
                                const endRad = (endAngle * Math.PI) / 180;
                                const radius = 100;
                                const x1 = radius * Math.cos(startRad);
                                const y1 = radius * Math.sin(startRad);
                                const x2 = radius * Math.cos(endRad);
                                const y2 = radius * Math.sin(endRad);
                                const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
                                const pathData = [
                                    'M', 0, 0,
                                    'L', x1, y1,
                                    'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
                                    'Z'
                                ].join(' ');

                                return (
                                    <motion.path
                                        key={item.name}
                                        d={pathData}
                                        fill={item.color}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#E2DDFF]">
                                    {totalPieValue.toLocaleString()}
                                </div>
                                <div className="text-sm text-[#B4A5FF]">Total Policies</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none">
                    {data.map((_, index) => (
                        <div
                            key={index}
                            className="h-full border-l border-[#2E1D4C]/20 first:border-l-0 last:border-l-0"
                        />
                    ))}
                </div>
            </div>

            {/* Enhanced Version History */}
            <AnimatePresence>
                {showVersionHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-[#13091F] rounded-xl p-6 z-50"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-[#E2DDFF]">Version History</h3>
                            <button
                                onClick={() => setShowVersionHistory(false)}
                                className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(versionHistory).map(([version, details]) => (
                                <div
                                    key={version}
                                    className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#E2DDFF] font-medium">{version}</span>
                                            <span className="text-xs text-[#B4A5FF]">{details.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {details.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-1 rounded-full bg-[#B4A5FF]/10 text-[#B4A5FF]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        {details.changes.map((change, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    change.type === 'added' && "bg-green-400",
                                                    change.type === 'modified' && "bg-yellow-400",
                                                    change.type === 'removed' && "bg-red-400"
                                                )} />
                                                <span className="text-[#E2DDFF]">{change.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-[#B4A5FF]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{details.author}</span>
                                            </div>
                                            {details.reviewers.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    <span>{details.reviewers.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{details.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Policy Comparison View */}
            <AnimatePresence>
                {comparisonMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-[#13091F] rounded-xl p-6 z-50"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-[#E2DDFF]">Policy Comparison</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowDiffView(!showDiffView)}
                                    className={cn(
                                        "p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors",
                                        showDiffView && "bg-[#B4A5FF]/20"
                                    )}
                                >
                                    <FileDiff className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setComparisonMode(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="text-sm text-[#B4A5FF]">Select Versions to Compare</div>
                                {Object.entries(versionHistory).map(([version, details]) => (
                                    <div
                                        key={version}
                                        className={cn(
                                            "p-3 rounded-lg border cursor-pointer transition-colors",
                                            selectedVersions.includes(version)
                                                ? "bg-[#B4A5FF]/20 border-[#B4A5FF]"
                                                : "bg-[#2E1D4C]/30 border-[#B4A5FF]/20 hover:border-[#B4A5FF]/40"
                                        )}
                                        onClick={() => {
                                            if (selectedVersions.includes(version)) {
                                                setSelectedVersions(selectedVersions.filter(v => v !== version));
                                            } else if (selectedVersions.length < 2) {
                                                setSelectedVersions([...selectedVersions, version]);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#E2DDFF]">{version}</span>
                                            {selectedVersions.includes(version) && (
                                                <CheckCircle className="w-4 h-4 text-[#B4A5FF]" />
                                            )}
                                        </div>
                                        <div className="text-xs text-[#B4A5FF] mt-1">{details.date}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="text-sm text-[#B4A5FF]">Comparison View</div>
                                {selectedVersions.length === 2 ? (
                                    <div className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20">
                                        {showDiffView ? (
                                            <div className="space-y-6">
                                                {policyContent[selectedVersions[0]].sections.map((section, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[#E2DDFF] font-medium">{section.title}</h4>
                                                            <span className={cn(
                                                                "text-xs px-2 py-1 rounded-full",
                                                                section.status === 'added' && "bg-green-400/10 text-green-400",
                                                                section.status === 'modified' && "bg-yellow-400/10 text-yellow-400",
                                                                section.status === 'removed' && "bg-red-400/10 text-red-400",
                                                                section.status === 'unchanged' && "bg-[#B4A5FF]/10 text-[#B4A5FF]"
                                                            )}>
                                                                {section.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-[#B4A5FF]">{section.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-[#B4A5FF]">Changes</span>
                                                    <span className="text-[#E2DDFF]">{versionHistory[selectedVersions[0]].changes.length} items</span>
                                                </div>
                                                {versionHistory[selectedVersions[0]].changes.map((change, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <span className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            change.type === 'added' && "bg-green-400",
                                                            change.type === 'modified' && "bg-yellow-400",
                                                            change.type === 'removed' && "bg-red-400"
                                                        )} />
                                                        <span className="text-[#E2DDFF]">{change.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[#B4A5FF]">
                                        Select two versions to compare
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PolicyMetricsChart; 