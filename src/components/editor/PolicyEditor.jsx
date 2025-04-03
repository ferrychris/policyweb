import React, { useState, useEffect, useRef } from 'react';
import { generatePolicy, generateSuggestions } from '../../lib/openai';
import { toast } from 'sonner';
import {
    FaSync,
    FaCheck,
    FaTimes,
    FaHistory,
    FaLightbulb,
    FaSpinner
} from 'react-icons/fa';

const PolicyEditor = ({ initialData, onSave, onClose }) => {
    const [content, setContent] = useState('');
    const [displayContent, setDisplayContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [versionHistory, setVersionHistory] = useState([]);
    const [selectedText, setSelectedText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [currentChunk, setCurrentChunk] = useState('');
    const typewriterSpeed = 10; // Adjust speed (milliseconds per character)
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);
    const editorRef = useRef(null);

    const styleConfig = initialData?.styleConfig || {
        fontFamily: 'Roboto, sans-serif',
        headingStyles: {
            fontWeight: 700,
            fontSize: {
                h1: '2.5rem',
                h2: '2rem',
                h3: '1.75rem'
            },
            color: '#E2DDFF',
            marginBottom: '1.5rem'
        },
        typewriterEffect: true,
        removeHashSymbols: true
    };

    useEffect(() => {
        generateInitialPolicy();
    }, []);

    // Typewriter effect for displaying content
    useEffect(() => {
        if (currentChunk && typewriterIndex < currentChunk.length) {
            const timer = setTimeout(() => {
                setDisplayContent(prev => prev + currentChunk[typewriterIndex]);
                setTypewriterIndex(prev => prev + 1);
            }, typewriterSpeed);
            return () => clearTimeout(timer);
        }
    }, [typewriterIndex, currentChunk]);

    const simulateStreamingResponse = async (fullContent) => {
        // Split content into chunks (e.g., by paragraphs or sections)
        const chunks = fullContent.split('\n').filter(chunk => chunk.trim());
        setDisplayContent('');

        for (const chunk of chunks) {
            setCurrentChunk(chunk + '\n');
            setTypewriterIndex(0);

            // Wait for the chunk to be typed out
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (typewriterIndex >= chunk.length) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
            });
        }
    };

    const generateInitialPolicy = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);
        setDisplayContent('');

        try {
            // Start progress animation
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 2;
                });
            }, 300);

            // Generate the policy content
            const generatedContent = await generatePolicy(
                initialData.policyTitle,
                {
                    ...initialData.organizationDetails,
                    regulations: initialData.regulations?.selected,
                    monitoringPreferences: initialData.regulations?.monitoring,
                    existingPolicies: initialData.regulations?.existingPolicies
                }
            );

            clearInterval(progressInterval);
            setGenerationProgress(100);

            // Format the content
            const formattedContent = formatContent(generatedContent);
            setContent(formattedContent);

            // Start typewriter effect
            await simulateStreamingResponse(formattedContent);

            // Add to version history
            setVersionHistory([
                {
                    id: Date.now(),
                    content: formattedContent,
                    timestamp: new Date(),
                    type: 'initial'
                }
            ]);
        } catch (error) {
            console.error('Error generating policy:', error);
            toast.error('Failed to generate policy. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatContent = (rawContent) => {
        if (!rawContent) return '';

        // Remove hash symbols if configured
        if (initialData?.styleConfig?.removeHashSymbols) {
            rawContent = rawContent.replace(/^(#{1,6})\s/gm, (match, hashes) => {
                const level = hashes.length;
                return `<h${level} class="heading-${level}">`;
            });
            rawContent = rawContent.replace(/$/gm, '</h>');
        }

        return rawContent;
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calculate tooltip position
            const editorRect = editorRef.current.getBoundingClientRect();
            const tooltipX = rect.left + (rect.width / 2) - editorRect.left;
            const tooltipY = rect.top - editorRect.top - 40; // 40px above selection

            setTooltipPosition({ x: tooltipX, y: tooltipY });
            setSelectedText(selectedText);
            setShowTooltip(true);
        } else {
            setShowTooltip(false);
        }
    };

    const handleGetSuggestions = async () => {
        setShowTooltip(false);
        setShowSuggestions(true);

        try {
            // Get AI suggestions for the selected text
            const suggestions = await generateSuggestions(selectedText);
            setSuggestions(suggestions);
        } catch (error) {
            console.error('Error getting suggestions:', error);
            toast.error('Failed to get suggestions. Please try again.');
        }
    };

    const handleSuggestionApply = (suggestion) => {
        const newContent = content.replace(selectedText, suggestion);
        setContent(newContent);

        // Add to version history
        setVersionHistory(prev => [...prev, {
            id: Date.now(),
            content: newContent,
            timestamp: new Date(),
            type: 'edit'
        }]);

        setShowSuggestions(false);
    };

    const handleRegeneratePolicy = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            const newContent = await generatePolicy(
                initialData.policyTitle,
                {
                    ...initialData.organizationDetails,
                    regulations: initialData.regulations.selected,
                    monitoringPreferences: initialData.regulations.monitoring,
                    existingPolicies: initialData.regulations.existingPolicies
                }
            );

            setContent(newContent);

            // Add to version history
            setVersionHistory(prev => [...prev, {
                id: Date.now(),
                content: newContent,
                timestamp: new Date(),
                type: 'regenerate'
            }]);
        } catch (error) {
            console.error('Error regenerating policy:', error);
            toast.error('Failed to regenerate policy. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        onSave({
            content,
            versions: versionHistory
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
                    aria-hidden="true"
                />

                <div className="inline-block w-full h-screen max-w-7xl overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:align-middle"
                    style={{ fontFamily: styleConfig.fontFamily }}>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2E1D4C]/30">
                            <div>
                                <h3 className="text-2xl font-bold text-[#E2DDFF]">
                                    Generate {initialData.policyTitle}
                                </h3>
                                <p className="mt-1 text-[#B4A5FF]">
                                    Edit and refine your policy using AI assistance
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-1 gap-4 p-6 h-[calc(100vh-5rem)] overflow-hidden">
                            {/* Main Editor */}
                            <div className="flex-1 flex flex-col h-full">
                                {isGenerating ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-full max-w-xs mx-auto mb-4 h-2 bg-[#2E1D4C] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#B4A5FF] transition-all duration-300"
                                                    style={{ width: `${generationProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[#E2DDFF] mb-2 text-lg">Generating Policy...</p>
                                            <p className="text-[#B4A5FF] text-sm">This may take a moment</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        ref={editorRef}
                                        className="flex-1 p-6 bg-[#2E1D4C]/30 rounded-lg overflow-y-auto mb-4 relative"
                                        onMouseUp={handleTextSelection}
                                    >
                                        <style>
                                            {`
                                                .heading-1 { font-size: ${styleConfig.headingStyles.fontSize.h1}; }
                                                .heading-2 { font-size: ${styleConfig.headingStyles.fontSize.h2}; }
                                                .heading-3 { font-size: ${styleConfig.headingStyles.fontSize.h3}; }
                                                .heading-1, .heading-2, .heading-3 {
                                                    font-weight: ${styleConfig.headingStyles.fontWeight};
                                                    color: ${styleConfig.headingStyles.color};
                                                    margin-bottom: ${styleConfig.headingStyles.marginBottom};
                                                }
                                                @keyframes blink {
                                                    0%, 100% { opacity: 1; }
                                                    50% { opacity: 0; }
                                                }
                                                .cursor::after {
                                                    content: '|';
                                                    animation: blink 1s infinite;
                                                    margin-left: 2px;
                                                    color: #B4A5FF;
                                                }
                                                .tooltip {
                                                    position: absolute;
                                                    transform: translateX(-50%);
                                                    z-index: 50;
                                                }
                                                .tooltip::after {
                                                    content: '';
                                                    position: absolute;
                                                    bottom: -4px;
                                                    left: 50%;
                                                    transform: translateX(-50%);
                                                    border-left: 5px solid transparent;
                                                    border-right: 5px solid transparent;
                                                    border-top: 5px solid #2E1D4C;
                                                }
                                            `}
                                        </style>

                                        {/* Selection Tooltip */}
                                        {showTooltip && (
                                            <div
                                                className="tooltip bg-[#2E1D4C] rounded-lg shadow-lg px-3 py-2"
                                                style={{
                                                    left: `${tooltipPosition.x}px`,
                                                    top: `${tooltipPosition.y}px`
                                                }}
                                            >
                                                <button
                                                    onClick={handleGetSuggestions}
                                                    className="flex items-center gap-2 text-[#E2DDFF] hover:text-[#B4A5FF] transition-colors"
                                                >
                                                    <FaLightbulb className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Fix with AI</span>
                                                </button>
                                            </div>
                                        )}

                                        <div
                                            className={`min-h-full text-[#E2DDFF] focus:outline-none whitespace-pre-wrap text-lg leading-relaxed ${isGenerating || typewriterIndex < currentChunk?.length ? 'cursor' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: displayContent }}
                                        />
                                    </div>
                                )}

                                {/* Editor Controls */}
                                <div className="flex justify-between items-center pt-4 border-t border-[#2E1D4C]/30">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleRegeneratePolicy}
                                            disabled={isGenerating}
                                            className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <FaSync className="mr-2 w-4 h-4" />
                                            Regenerate
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isGenerating || !content}
                                            className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#B4A5FF]/20 text-[#E2DDFF] hover:bg-[#B4A5FF]/30 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <FaCheck className="mr-2 w-4 h-4" />
                                            Save Policy
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="w-80 flex flex-col h-full">
                                {/* Version History */}
                                <div className="flex-1 p-4 bg-[#2E1D4C]/30 rounded-lg overflow-y-auto mb-4">
                                    <h4 className="text-[#E2DDFF] font-medium mb-4">Version History</h4>
                                    <div className="space-y-3">
                                        {versionHistory.map((version) => (
                                            <button
                                                key={version.id}
                                                onClick={() => setContent(version.content)}
                                                className="w-full p-3 text-left rounded-lg bg-[#2E1D4C]/50 hover:bg-[#2E1D4C]/70 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[#E2DDFF] text-sm capitalize">{version.type}</span>
                                                    <span className="text-[#B4A5FF] text-xs">
                                                        {new Date(version.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                {showSuggestions && (
                                    <div className="p-4 bg-[#2E1D4C]/30 rounded-lg max-h-[30vh] overflow-y-auto">
                                        <h4 className="text-[#E2DDFF] font-medium mb-4">AI Suggestions</h4>
                                        <div className="space-y-3">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionApply(suggestion)}
                                                    className="w-full p-3 text-left rounded-lg bg-[#2E1D4C]/50 hover:bg-[#2E1D4C]/70 transition-colors"
                                                >
                                                    <p className="text-[#E2DDFF] text-sm">{suggestion}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyEditor; 