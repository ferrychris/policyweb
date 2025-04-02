import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Edit3 } from 'react-feather';
import { cn } from '../../lib/utils';
import { generatePolicyContent, refinePolicyContent } from '../../lib/api';
import TypeWriter from './TypeWriter';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';

const PolicyWizardView = ({ policyType, formData, subscription, onBack }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [displayContent, setDisplayContent] = useState('');
    const [versions, setVersions] = useState([]);
    const [lastSavedContent, setLastSavedContent] = useState('');
    const [showMobileVersions, setShowMobileVersions] = useState(false);

    // Start generation automatically when component mounts
    useEffect(() => {
        handleGeneratePolicy();
    }, []);

    // Add debounced version saving
    const addVersion = debounce((content, source = 'Generation') => {
        // Only save if content is significantly different (more than 10% change)
        const contentDiff = getContentDifference(content, lastSavedContent);
        if (contentDiff > 0.1 || source === 'Generation') {
            const newVersion = {
                id: Date.now().toString(),
                content,
                timestamp: new Date(),
                source,
                preview: content.substring(0, 150) + '...'
            };
            setVersions(prev => [newVersion, ...prev]);
            setLastSavedContent(content);
            return newVersion.id;
        }
        return null;
    }, 1000);

    // Helper function to calculate content difference
    const getContentDifference = (newContent, oldContent) => {
        if (!oldContent) return 1;
        const longerLength = Math.max(newContent.length, oldContent.length);
        const editDistance = levenshteinDistance(newContent, oldContent);
        return editDistance / longerLength;
    };

    // Levenshtein distance calculation
    const levenshteinDistance = (str1, str2) => {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],    // deletion
                        dp[i][j - 1],    // insertion
                        dp[i - 1][j - 1] // substitution
                    );
                }
            }
        }
        return dp[m][n];
    };

    const handleGeneratePolicy = async () => {
        setIsGenerating(true);
        try {
            const packageType = subscription?.package?.key || 'basic';

            // Generate the policy using the API
            const content = await generatePolicyContent(policyType.title, formData.details, packageType);

            // Set the content for typewriter effect
            setDisplayContent('');
            setCurrentContent(content);

            // Add the generated content to versions
            addVersion(content, 'Generation');

        } catch (error) {
            console.error('Error generating policy:', error);
            toast.error('Failed to generate policy. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefinement = async (refinementRequest) => {
        if (!refinementRequest.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            // Refine the policy using the API
            const content = await refinePolicyContent(
                policyType.title,
                formData.details,
                currentContent,
                refinementRequest
            );

            // Set the content for typewriter effect
            setDisplayContent('');
            setCurrentContent(content);

            // Add new version if significant changes
            addVersion(content, 'Refinement');

        } catch (error) {
            console.error('Error processing refinement:', error);
            toast.error('Failed to refine policy. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRestoreVersion = (version) => {
        setDisplayContent('');
        setCurrentContent(version.content);
        addVersion(version.content, 'Restored');
        toast.success('Version restored successfully');
    };

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
                    <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <button
                                onClick={onBack}
                                className="flex-shrink-0 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                                {policyType.title}
                            </h2>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {formData.details.companyName}
                        </div>
                    </div>
                </div>

                {/* Content Display */}
                <div className="flex-1 overflow-y-auto">
                    <div className="h-full flex justify-center p-4 sm:p-6">
                        <div className="w-full max-w-screen-xl">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse mb-4 sm:mb-6">
                                        🤖
                                    </div>
                                    <div className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-center">
                                        {currentContent ? 'Refining Policy...' : 'Generating Policy...'}
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
                                        This may take a few moments
                                    </div>
                                </div>
                            ) : currentContent ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-8 min-h-[calc(100vh-12rem)] shadow-lg">
                                        <TypeWriter
                                            content={currentContent}
                                            onComplete={() => setDisplayContent(currentContent)}
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse mb-4 sm:mb-6">
                                        🤖
                                    </div>
                                    <div className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-center">
                                        Preparing to Generate Your Policy
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
                                        Generation will begin automatically...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                {currentContent && (
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleGeneratePolicy}
                                    disabled={isGenerating}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto",
                                        "bg-indigo-500 hover:bg-indigo-600",
                                        "text-white font-medium",
                                        "transition-colors duration-200",
                                        isGenerating && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <span>Regenerate</span>
                                    {isGenerating && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        const refinement = window.prompt('How would you like to refine the policy?');
                                        if (refinement) {
                                            handleRefinement(refinement);
                                        }
                                    }}
                                    disabled={isGenerating || !currentContent}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto",
                                        "bg-white dark:bg-gray-800",
                                        "border border-gray-200 dark:border-gray-700",
                                        "text-gray-700 dark:text-gray-300",
                                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                                        "transition-colors duration-200",
                                        (isGenerating || !currentContent) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Refine</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Version History Sidebar - Hidden on mobile, shown as bottom sheet */}
            <div className={cn(
                "hidden lg:flex lg:w-96 border-l border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800",
                "flex-col"
            )}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Version History
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Only significant changes are saved
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                onClick={() => handleRestoreVersion(version)}
                                className={cn(
                                    "p-4 rounded-lg cursor-pointer",
                                    "bg-gray-50 dark:bg-gray-900/50",
                                    "border border-gray-200 dark:border-gray-700",
                                    "hover:border-indigo-500 dark:hover:border-indigo-400",
                                    "transition-all duration-200",
                                    currentContent === version.content && "ring-2 ring-indigo-500"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {version.source}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(version.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {version.preview}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Version History Bottom Sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                    <button
                        onClick={() => setShowMobileVersions(prev => !prev)}
                        className="flex items-center justify-between w-full"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                Version History
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {versions.length} versions saved
                            </p>
                        </div>
                        <ArrowRight className={cn(
                            "w-5 h-5 text-gray-400 transform transition-transform",
                            showMobileVersions ? "rotate-90" : ""
                        )} />
                    </button>
                </div>
                {showMobileVersions && (
                    <div className="max-h-[50vh] overflow-y-auto p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    onClick={() => {
                                        handleRestoreVersion(version);
                                        setShowMobileVersions(false);
                                    }}
                                    className={cn(
                                        "p-4 rounded-lg cursor-pointer",
                                        "bg-gray-50 dark:bg-gray-900/50",
                                        "border border-gray-200 dark:border-gray-700",
                                        "hover:border-indigo-500 dark:hover:border-indigo-400",
                                        "transition-all duration-200",
                                        currentContent === version.content && "ring-2 ring-indigo-500"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {version.source}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(version.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {version.preview}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyWizardView;
