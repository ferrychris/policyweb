import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import {
    FaFileAlt,
    FaShieldAlt,
    FaPlus,
    FaTrash,
    FaSave,
    FaDownload,
    FaEye,
    FaHistory,
    FaUsers,
    FaTag,
    FaClock,
    FaExclamationCircle,
    FaCheckCircle,
    FaMagic,
    FaSearch,
    FaFilter,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaCopy,
    FaUndo,
    FaRedo,
    FaBookOpen,
    FaFileExcel,
    FaFileCode,
    FaFileImage,
    FaFilePdf,
    FaFileWord,
    FaFilePowerpoint,
    FaFileArchive,
    FaFileVideo,
    FaFileAudio,
    FaFileCsv,
    FaFileAlt as FaFileTemplate,
    FaChevronRight,
    FaSync,
    FaFileDownload,
    FaTimes,
    FaCog,
    FaHandshake,
    FaRocket,
    FaGraduationCap,
    FaBell
} from 'react-icons/fa';

// Add more industry-specific policy templates
const policyTemplates = {
    'security': {
        title: 'Security Policy Template',
        description: 'A comprehensive security policy template covering access control, data protection, and incident response.',
        sections: [
            {
                title: 'Access Control',
                content: 'Define access control policies and procedures...',
                subsections: [
                    { title: 'User Authentication', content: 'Specify authentication requirements...' },
                    { title: 'Password Management', content: 'Outline password policies...' }
                ]
            },
            {
                title: 'Data Protection',
                content: 'Establish data protection guidelines...',
                subsections: [
                    { title: 'Data Classification', content: 'Define data classification levels...' },
                    { title: 'Encryption Standards', content: 'Specify encryption requirements...' }
                ]
            }
        ]
    },
    'healthcare': {
        title: 'Healthcare Compliance Policy',
        description: 'HIPAA-compliant policy template for healthcare organizations covering patient data, privacy, and security.',
        sections: [
            {
                title: 'Patient Data Protection',
                content: 'Define procedures for handling PHI...',
                subsections: [
                    { title: 'Data Access Controls', content: 'Specify who can access patient data...' },
                    { title: 'Data Breach Protocol', content: 'Outline response procedures...' }
                ]
            },
            {
                title: 'HIPAA Compliance',
                content: 'Ensure adherence to HIPAA regulations...',
                subsections: [
                    { title: 'Privacy Rule', content: 'Implement privacy requirements...' },
                    { title: 'Security Rule', content: 'Define security measures...' }
                ]
            }
        ]
    },
    'finance': {
        title: 'Financial Services Policy',
        description: 'Comprehensive policy template for financial institutions covering compliance, risk management, and operations.',
        sections: [
            {
                title: 'Risk Management',
                content: 'Define risk assessment and mitigation procedures...',
                subsections: [
                    { title: 'Risk Assessment', content: 'Outline risk evaluation process...' },
                    { title: 'Mitigation Strategies', content: 'Define risk reduction measures...' }
                ]
            },
            {
                title: 'Regulatory Compliance',
                content: 'Ensure adherence to financial regulations...',
                subsections: [
                    { title: 'KYC Requirements', content: 'Define customer verification procedures...' },
                    { title: 'Anti-Money Laundering', content: 'Specify AML protocols...' }
                ]
            }
        ]
    },
    'education': {
        title: 'Educational Institution Policy',
        description: 'Policy template for educational institutions covering student data, academic integrity, and campus safety.',
        sections: [
            {
                title: 'Student Data Protection',
                content: 'Define procedures for handling student information...',
                subsections: [
                    { title: 'FERPA Compliance', content: 'Implement FERPA requirements...' },
                    { title: 'Data Retention', content: 'Specify data storage policies...' }
                ]
            },
            {
                title: 'Academic Integrity',
                content: 'Establish academic honesty guidelines...',
                subsections: [
                    { title: 'Plagiarism Policy', content: 'Define plagiarism prevention...' },
                    { title: 'Code of Conduct', content: 'Outline student behavior expectations...' }
                ]
            }
        ]
    },
    'technology': {
        title: 'Technology Company Policy',
        description: 'Policy template for tech companies covering software development, data privacy, and intellectual property.',
        sections: [
            {
                title: 'Software Development',
                content: 'Define development standards and practices...',
                subsections: [
                    { title: 'Code Review Process', content: 'Specify review requirements...' },
                    { title: 'Version Control', content: 'Outline version management...' }
                ]
            },
            {
                title: 'Intellectual Property',
                content: 'Establish IP protection guidelines...',
                subsections: [
                    { title: 'Patent Policy', content: 'Define patent procedures...' },
                    { title: 'Copyright Management', content: 'Specify copyright protocols...' }
                ]
            }
        ]
    }
};

const PolicyGenerator = () => {
    const [policy, setPolicy] = useState({
        title: '',
        description: '',
        category: '',
        sections: [],
        tags: [],
        reviewers: [],
        deadline: '',
        priority: 'medium',
        status: 'draft',
        type: ''
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPolicyTypeModal, setShowPolicyTypeModal] = useState(false);
    const [newPolicy, setNewPolicy] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'draft',
        type: ''
    });

    const [activeSection, setActiveSection] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showReviewers, setShowReviewers] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);

    // Add export customization options
    const [exportOptions, setExportOptions] = useState({
        includeMetadata: true,
        includeVersionHistory: true,
        includeReviewers: true,
        includeTags: true,
        format: 'json',
        template: 'default'
    });

    // Policy types data
    const policyTypes = [
        {
            id: 'ai-ethics',
            title: 'AI Ethics Policy',
            description: 'Create guidelines for ethical AI development',
            icon: FaShieldAlt
        },
        {
            id: 'risk-management',
            title: 'AI Risk Management Policy',
            description: 'Manage risks associated with AI systems',
            icon: FaExclamationCircle
        },
        {
            id: 'data-governance',
            title: 'Data Governance Policy',
            description: 'Establish data handling standards',
            icon: FaFileAlt
        },
        {
            id: 'ai-security',
            title: 'AI Security Policy',
            description: 'Security controls for AI systems',
            icon: FaShieldAlt
        },
        {
            id: 'model-management',
            title: 'Model Management Policy',
            description: 'Model development and monitoring',
            icon: FaCog
        },
        {
            id: 'human-oversight',
            title: 'Human Oversight Policy',
            description: 'Human-AI collaboration guidelines',
            icon: FaUsers
        },
        {
            id: 'ai-compliance',
            title: 'AI Compliance Policy',
            description: 'Regulatory compliance framework',
            icon: FaCheckCircle
        },
        {
            id: 'use-case',
            title: 'Use Case Evaluation Policy',
            description: 'Use case assessment framework',
            icon: FaSearch
        },
        {
            id: 'procurement',
            title: 'Procurement & Vendor Policy',
            description: 'Guidelines for AI procurement and vendor management',
            icon: FaHandshake
        },
        {
            id: 'deployment',
            title: 'Responsible AI Deployment',
            description: 'Best practices for responsible AI deployment',
            icon: FaRocket
        },
        {
            id: 'training',
            title: 'Training & Capability Policy',
            description: 'AI training and capability development guidelines',
            icon: FaGraduationCap
        },
        {
            id: 'incident',
            title: 'Incident Response Policy',
            description: 'Create protocols for AI incidents',
            icon: FaBell
        }
    ];

    // Function to handle policy type selection
    const handlePolicyTypeSelect = (typeId) => {
        const selectedType = policyTypes.find(type => type.id === typeId);
        setNewPolicy(prev => ({
            ...prev,
            type: typeId,
            title: `${selectedType.title} - Draft`,
            category: 'AI Governance'
        }));
        setShowPolicyTypeModal(false);
        setShowCreateModal(true);
    };

    const addSection = () => {
        setPolicy(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: Date.now(),
                    title: '',
                    content: '',
                    subsections: []
                }
            ]
        }));
    };

    const updateSection = (sectionId, field, value) => {
        setPolicy(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? { ...section, [field]: value }
                    : section
            )
        }));
    };

    const addSubsection = (sectionId) => {
        setPolicy(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        subsections: [
                            ...section.subsections,
                            {
                                id: Date.now(),
                                title: '',
                                content: ''
                            }
                        ]
                    }
                    : section
            )
        }));
    };

    const removeSection = (sectionId) => {
        setPolicy(prev => ({
            ...prev,
            sections: prev.sections.filter(section => section.id !== sectionId)
        }));
    };

    const addTag = (tag) => {
        if (!policy.tags.includes(tag)) {
            setPolicy(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
    };

    const removeTag = (tag) => {
        setPolicy(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const addReviewer = (reviewer) => {
        if (!policy.reviewers.includes(reviewer)) {
            setPolicy(prev => ({
                ...prev,
                reviewers: [...prev.reviewers, reviewer]
            }));
        }
    };

    const removeReviewer = (reviewer) => {
        setPolicy(prev => ({
            ...prev,
            reviewers: prev.reviewers.filter(r => r !== reviewer)
        }));
    };

    const savePolicy = () => {
        // Implement save functionality
        console.log('Saving policy:', policy);
    };

    // Add undo/redo functionality
    const saveToHistory = (newPolicy) => {
        setUndoStack(prev => [...prev, policy]);
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length > 0) {
            const previousPolicy = undoStack[undoStack.length - 1];
            setRedoStack(prev => [...prev, policy]);
            setPolicy(previousPolicy);
            setUndoStack(prev => prev.slice(0, -1));
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
            const nextPolicy = redoStack[redoStack.length - 1];
            setUndoStack(prev => [...prev, policy]);
            setPolicy(nextPolicy);
            setRedoStack(prev => prev.slice(0, -1));
        }
    };

    // Add template application
    const applyTemplate = (template) => {
        saveToHistory(policy);
        setPolicy({
            ...template,
            id: Date.now(),
            status: 'draft',
            tags: [],
            reviewers: []
        });
        setShowTemplates(false);
    };

    // Add more sophisticated AI suggestions
    const generateAISuggestions = () => {
        // Enhanced AI suggestions based on policy content
        const suggestions = [];

        // Check for missing critical sections
        if (!policy.sections.some(s => s.title.toLowerCase().includes('compliance'))) {
            suggestions.push({
                type: 'section',
                title: 'Add Compliance Section',
                description: 'Consider adding a compliance section to ensure regulatory requirements are met.',
                priority: 'high',
                action: () => {
                    saveToHistory(policy);
                    setPolicy(prev => ({
                        ...prev,
                        sections: [
                            ...prev.sections,
                            {
                                id: Date.now(),
                                title: 'Compliance Requirements',
                                content: 'Outline compliance requirements and procedures...',
                                subsections: []
                            }
                        ]
                    }));
                }
            });
        }

        // Check for security considerations
        if (!policy.sections.some(s => s.title.toLowerCase().includes('security'))) {
            suggestions.push({
                type: 'section',
                title: 'Add Security Section',
                description: 'Consider adding a security section to protect sensitive information and assets.',
                priority: 'high',
                action: () => {
                    saveToHistory(policy);
                    setPolicy(prev => ({
                        ...prev,
                        sections: [
                            ...prev.sections,
                            {
                                id: Date.now(),
                                title: 'Security Measures',
                                content: 'Define security protocols and procedures...',
                                subsections: []
                            }
                        ]
                    }));
                }
            });
        }

        // Check for reviewer diversity
        if (policy.reviewers.length < 2) {
            suggestions.push({
                type: 'reviewer',
                title: 'Add Additional Reviewers',
                description: 'Consider adding more reviewers for better policy validation.',
                priority: 'medium',
                action: () => {
                    saveToHistory(policy);
                    addReviewer('Legal Team');
                    addReviewer('Compliance Officer');
                }
            });
        }

        // Check for policy completeness
        if (policy.sections.length < 3) {
            suggestions.push({
                type: 'completeness',
                title: 'Enhance Policy Structure',
                description: 'Consider adding more sections to make the policy more comprehensive.',
                priority: 'medium',
                action: () => {
                    saveToHistory(policy);
                    setPolicy(prev => ({
                        ...prev,
                        sections: [
                            ...prev.sections,
                            {
                                id: Date.now(),
                                title: 'Implementation Guidelines',
                                content: 'Define how the policy will be implemented...',
                                subsections: []
                            },
                            {
                                id: Date.now() + 1,
                                title: 'Monitoring and Review',
                                content: 'Specify how the policy will be monitored and reviewed...',
                                subsections: []
                            }
                        ]
                    }));
                }
            });
        }

        setAiSuggestions(suggestions);
    };

    // Enhanced export functionality
    const exportPolicy = (format) => {
        const exportData = {
            ...policy,
            exportDate: new Date().toISOString(),
            version: '1.0',
            metadata: exportOptions.includeMetadata ? {
                createdBy: 'Current User',
                lastModified: new Date().toISOString(),
                category: policy.category,
                status: policy.status,
                priority: policy.priority
            } : undefined,
            versionHistory: exportOptions.includeVersionHistory ? [
                {
                    version: '1.0',
                    date: new Date().toISOString(),
                    changes: 'Initial version'
                }
            ] : undefined,
            reviewers: exportOptions.includeReviewers ? policy.reviewers : undefined,
            tags: exportOptions.includeTags ? policy.tags : undefined
        };

        let content;
        let filename;
        let type;

        switch (format) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                filename = `${policy.title.toLowerCase().replace(/\s+/g, '-')}.json`;
                type = 'application/json';
                break;
            case 'csv':
                content = [
                    ['Section', 'Content', 'Subsections'],
                    ...policy.sections.map(section => [
                        section.title,
                        section.content,
                        section.subsections.map(sub => `${sub.title}: ${sub.content}`).join('; ')
                    ])
                ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                filename = `${policy.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
                type = 'text/csv';
                break;
            case 'pdf':
                // In a real implementation, you would use a PDF generation library
                console.log('PDF export would be implemented here');
                return;
            case 'docx':
                // In a real implementation, you would use a DOCX generation library
                console.log('DOCX export would be implemented here');
                return;
            case 'html':
                content = `
                    <html>
                        <head>
                            <title>${policy.title}</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    max-width: 800px;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                h1 { 
                                    color: #333;
                                    border-bottom: 2px solid #eee;
                                    padding-bottom: 10px;
                                }
                                h2 { 
                                    color: #666;
                                    margin-top: 30px;
                                }
                                .metadata {
                                    background: #f5f5f5;
                                    padding: 15px;
                                    border-radius: 5px;
                                    margin: 20px 0;
                                }
                                .tag {
                                    display: inline-block;
                                    background: #e0e0e0;
                                    padding: 3px 8px;
                                    border-radius: 12px;
                                    margin: 2px;
                                    font-size: 0.9em;
                                }
                                .reviewer {
                                    display: inline-block;
                                    background: #e3f2fd;
                                    padding: 3px 8px;
                                    border-radius: 12px;
                                    margin: 2px;
                                    font-size: 0.9em;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>${policy.title}</h1>
                            ${exportOptions.includeMetadata ? `
                                <div class="metadata">
                                    <p><strong>Category:</strong> ${policy.category}</p>
                                    <p><strong>Status:</strong> ${policy.status}</p>
                                    <p><strong>Priority:</strong> ${policy.priority}</p>
                                    <p><strong>Last Modified:</strong> ${new Date().toLocaleDateString()}</p>
                                </div>
                            ` : ''}
                            <p>${policy.description}</p>
                            ${exportOptions.includeTags ? `
                                <div>
                                    ${policy.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                            ${exportOptions.includeReviewers ? `
                                <div>
                                    <h3>Reviewers:</h3>
                                    ${policy.reviewers.map(reviewer => `<span class="reviewer">${reviewer}</span>`).join('')}
                                </div>
                            ` : ''}
                            ${policy.sections.map(section => `
                                <h2>${section.title}</h2>
                                <p>${section.content}</p>
                                ${section.subsections.length > 0 ? `
                                    <h3>Subsections:</h3>
                                    ${section.subsections.map(subsection => `
                                        <h4>${subsection.title}</h4>
                                        <p>${subsection.content}</p>
                                    `).join('')}
                                ` : ''}
                            `).join('')}
                        </body>
                    </html>
                `;
                filename = `${policy.title.toLowerCase().replace(/\s+/g, '-')}.html`;
                type = 'text/html';
                break;
        }

        if (content) {
            const blob = new Blob([content], { type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        setShowExportOptions(false);
    };

    const handleCreatePolicy = () => {
        setPolicy({
            ...newPolicy,
            sections: [],
            tags: [],
            reviewers: [],
            deadline: ''
        });
        setShowCreateModal(false);
        setNewPolicy({
            title: '',
            description: '',
            category: '',
            priority: 'medium',
            status: 'draft',
            type: ''
        });
    };

    // Policy Type Selection Modal
    const PolicyTypeModal = () => (
        <AnimatePresence>
            {showPolicyTypeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                >
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowPolicyTypeModal(false)} />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#13091F] rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-[#2E1D4C]/30 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#E2DDFF]">Select Policy Type</h3>
                                    <p className="mt-1 text-[#B4A5FF]">Choose a policy type to get started</p>
                                </div>
                                <button
                                    onClick={() => setShowPolicyTypeModal(false)}
                                    className="p-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {policyTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => handlePolicyTypeSelect(type.id)}
                                        className="flex flex-col p-6 rounded-lg bg-[#2E1D4C]/30 border border-[#2E1D4C]/50 hover:border-[#B4A5FF]/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-lg bg-[#2E1D4C] group-hover:bg-[#B4A5FF]/20 transition-colors">
                                                <type.icon className="w-6 h-6 text-[#B4A5FF] group-hover:text-[#E2DDFF]" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-[#E2DDFF]">{type.title}</h4>
                                        </div>
                                        <p className="text-sm text-[#B4A5FF] group-hover:text-[#E2DDFF]">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="p-6 rounded-xl bg-[#13091F] border border-[#2E1D4C]/30">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FaShieldAlt className="w-5 h-5 text-[#B4A5FF]" />
                        <h3 className="text-lg font-semibold text-[#E2DDFF]">Policy Generator</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            policy.status === 'draft' && "bg-yellow-400/10 text-yellow-400",
                            policy.status === 'review' && "bg-blue-400/10 text-blue-400",
                            policy.status === 'approved' && "bg-green-400/10 text-green-400"
                        )}>
                            {policy.status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPolicyTypeModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        Create New Policy
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaEye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaHistory className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowReviewers(!showReviewers)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaUsers className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaFileTemplate className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaSearch className="w-4 h-4" />
                    </button>
                    <button
                        onClick={undo}
                        disabled={undoStack.length === 0}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors disabled:opacity-50"
                    >
                        <FaUndo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={redoStack.length === 0}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors disabled:opacity-50"
                    >
                        <FaRedo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                        className="p-1.5 bg-[#2E1D4C]/30 text-[#B4A5FF] rounded-lg hover:bg-[#B4A5FF]/20 transition-colors"
                    >
                        <FaMagic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={savePolicy}
                        className="p-1.5 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                    >
                        <FaSave className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="p-1.5 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                    >
                        <FaFileExcel className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Render Policy Type Modal */}
            <PolicyTypeModal />

            {/* Create Policy Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#E2DDFF]">Create New Policy</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#B4A5FF] mb-2">Policy Title</label>
                                    <input
                                        type="text"
                                        value={newPolicy.title}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg px-4 py-2 text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                        placeholder="Enter policy title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#B4A5FF] mb-2">Category</label>
                                    <select
                                        value={newPolicy.category}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg px-4 py-2 text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                    >
                                        <option value="">Select category</option>
                                        <option value="security">Security</option>
                                        <option value="compliance">Compliance</option>
                                        <option value="hr">HR</option>
                                        <option value="finance">Finance</option>
                                        <option value="operations">Operations</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#B4A5FF] mb-2">Description</label>
                                    <textarea
                                        value={newPolicy.description}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg px-4 py-2 text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF] h-24"
                                        placeholder="Enter policy description"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#B4A5FF] mb-2">Priority</label>
                                        <select
                                            value={newPolicy.priority}
                                            onChange={(e) => setNewPolicy(prev => ({ ...prev, priority: e.target.value }))}
                                            className="w-full bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg px-4 py-2 text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#B4A5FF] mb-2">Status</label>
                                        <select
                                            value={newPolicy.status}
                                            onChange={(e) => setNewPolicy(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg px-4 py-2 text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="review">In Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreatePolicy}
                                        className="px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                                    >
                                        Create Policy
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <div className="container mx-auto p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Policy Generator</h1>
                                <p className="text-gray-600">Create and manage your policies</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <FaFileTemplate className="w-4 h-4" />
                                    Templates
                                </button>
                                <button
                                    onClick={() => setShowAIAssistant(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <FaMagic className="w-4 h-4" />
                                    AI Assistant
                                </button>
                                <button
                                    onClick={() => setShowExportOptions(!showExportOptions)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <FaFileDownload className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - Policy Editor */}
                            <div className="col-span-8">
                                {/* Basic Information */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={policy.title}
                                                onChange={(e) => setPolicy(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter policy title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <select
                                                value={policy.category}
                                                onChange={(e) => setPolicy(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select category</option>
                                                <option value="security">Security</option>
                                                <option value="compliance">Compliance</option>
                                                <option value="hr">HR</option>
                                                <option value="finance">Finance</option>
                                                <option value="operations">Operations</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority
                                            </label>
                                            <select
                                                value={policy.priority}
                                                onChange={(e) => setPolicy(prev => ({ ...prev, priority: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={policy.status}
                                                onChange={(e) => setPolicy(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="review">In Review</option>
                                                <option value="approved">Approved</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={policy.description}
                                                onChange={(e) => setPolicy(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows="3"
                                                placeholder="Enter policy description"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Policy Content */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold">Policy Content</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowPreview(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                <FaEye className="w-4 h-4" />
                                                Preview
                                            </button>
                                            <button
                                                onClick={savePolicy}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <FaSave className="w-4 h-4" />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {policy.sections.map((section, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                                        className="text-lg font-medium px-2 py-1 border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Section title"
                                                    />
                                                    <button
                                                        onClick={() => removeSection(section.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {section.content.map((content, contentIndex) => (
                                                        <div key={contentIndex} className="flex gap-2">
                                                            <select
                                                                value={content.type}
                                                                onChange={(e) => {
                                                                    const updatedContents = section.content.map((c, i) =>
                                                                        i === contentIndex ? { ...c, type: e.target.value } : c
                                                                    );
                                                                    updateSection(section.id, 'content', updatedContents);
                                                                }}
                                                                className="px-2 py-1 border border-gray-300 rounded"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="list">List</option>
                                                                <option value="table">Table</option>
                                                            </select>
                                                            {content.type === 'text' && (
                                                                <textarea
                                                                    value={content.text}
                                                                    onChange={(e) => {
                                                                        const updatedContents = section.content.map((c, i) =>
                                                                            i === contentIndex ? { ...c, text: e.target.value } : c
                                                                        );
                                                                        updateSection(section.id, 'content', updatedContents);
                                                                    }}
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    rows="3"
                                                                    placeholder="Enter content"
                                                                />
                                                            )}
                                                            {content.type === 'list' && (
                                                                <div className="flex-1 space-y-2">
                                                                    {content.items.map((item, itemIndex) => (
                                                                        <div key={itemIndex} className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={item}
                                                                                onChange={(e) => {
                                                                                    const updatedItems = content.items.map((i, iIndex) =>
                                                                                        iIndex === itemIndex ? e.target.value : i
                                                                                    );
                                                                                    const updatedContents = section.content.map((c, i) =>
                                                                                        i === contentIndex ? { ...c, items: updatedItems } : c
                                                                                    );
                                                                                    updateSection(section.id, 'content', updatedContents);
                                                                                }}
                                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                placeholder="List item"
                                                                            />
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    const updatedItems = content.items.filter((_, i) => i !== itemIndex);
                                                                                    const updatedContents = section.content.map((c, i) =>
                                                                                        i === contentIndex ? { ...c, items: updatedItems } : c
                                                                                    );
                                                                                    updateSection(section.id, 'content', updatedContents);
                                                                                }}
                                                                                className="text-gray-400 hover:text-red-500"
                                                                            >
                                                                                <FaTrash className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            const updatedContents = section.content.map((c, i) =>
                                                                                i === contentIndex ? { ...c, items: [...c.items, ''] } : c
                                                                            );
                                                                            updateSection(section.id, 'content', updatedContents);
                                                                        }}
                                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <FaPlus className="w-4 h-4" />
                                                                        Add Item
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {content.type === 'table' && (
                                                                <div className="flex-1">
                                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                                        <input
                                                                            type="number"
                                                                            value={content.rows}
                                                                            onChange={(e) => {
                                                                                const updatedContents = section.content.map((c, i) =>
                                                                                    i === contentIndex ? { ...c, rows: parseInt(e.target.value) } : c
                                                                                );
                                                                                updateSection(section.id, 'content', updatedContents);
                                                                            }}
                                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            placeholder="Rows"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={content.columns}
                                                                            onChange={(e) => {
                                                                                const updatedContents = section.content.map((c, i) =>
                                                                                    i === contentIndex ? { ...c, columns: parseInt(e.target.value) } : c
                                                                                );
                                                                                updateSection(section.id, 'content', updatedContents);
                                                                            }}
                                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            placeholder="Columns"
                                                                        />
                                                                    </div>
                                                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                                                        <table className="w-full">
                                                                            <tbody>
                                                                                {Array.from({ length: content.rows }).map((_, rowIndex) => (
                                                                                    <tr key={rowIndex}>
                                                                                        {Array.from({ length: content.columns }).map((_, colIndex) => (
                                                                                            <td key={colIndex} className="border border-gray-300 p-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={content.data[rowIndex]?.[colIndex] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const updatedData = content.data.map((r, i) =>
                                                                                                            i === rowIndex ? r.map((c, j) =>
                                                                                                                j === colIndex ? e.target.value : c
                                                                                                            ) : r
                                                                                                        );
                                                                                                        const updatedContents = section.content.map((c, i) =>
                                                                                                            i === contentIndex ? { ...c, data: updatedData } : c
                                                                                                        );
                                                                                                        updateSection(section.id, 'content', updatedContents);
                                                                                                    }}
                                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                                                    placeholder="Cell content"
                                                                                                />
                                                                                            </td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const updatedContents = section.content.filter((_, i) => i !== contentIndex);
                                                                    updateSection(section.id, 'content', updatedContents);
                                                                }}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            updateSection(section.id, 'content', [...section.content, { type: 'text', text: '' }]);
                                                        }}
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        <FaPlus className="w-4 h-4" />
                                                        Add Content
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                updateSection(section.id, 'content', [...section.content, { type: 'text', text: '' }]);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-dashed border-blue-200 rounded-lg hover:border-blue-300"
                                        >
                                            <FaPlus className="w-4 h-4" />
                                            Add Section
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Categories and AI Recommendations */}
                            <div className="col-span-4 space-y-6">
                                {/* Policy Categories */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-lg font-semibold mb-4">Policy Categories</h2>
                                    <div className="space-y-2">
                                        {Object.entries(policyTemplates).map(([category, template]) => (
                                            <button
                                                key={category}
                                                onClick={() => applyTemplate(template)}
                                                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                                            >
                                                <span className="capitalize">{category}</span>
                                                <FaChevronRight className="w-4 h-4 text-gray-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Recommendations */}
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-lg font-semibold mb-4">AI Recommendations</h2>
                                    <div className="space-y-4">
                                        {aiSuggestions.map((suggestion, index) => (
                                            <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <FaSparkles className="w-4 h-4 text-blue-500 mt-0.5" />
                                                    <p className="text-sm text-blue-700">{suggestion.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={generateAISuggestions}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:border-blue-300"
                                        >
                                            <FaSync className="w-4 h-4" />
                                            Generate New Suggestions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#E2DDFF]">Policy Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#E2DDFF] mb-2">{policy.title}</h2>
                                    <p className="text-[#B4A5FF]">{policy.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {policy.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="bg-[#B4A5FF]/10 text-[#B4A5FF] px-2 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    {policy.sections.map(section => (
                                        <div key={section.id}>
                                            <h3 className="text-xl font-semibold text-[#E2DDFF] mb-2">{section.title}</h3>
                                            <p className="text-[#B4A5FF] whitespace-pre-wrap">{section.content}</p>
                                            {section.subsections.length > 0 && (
                                                <div className="mt-4 space-y-4">
                                                    {section.subsections.map(subsection => (
                                                        <div key={subsection.id}>
                                                            <h4 className="text-lg font-medium text-[#E2DDFF] mb-2">{subsection.title}</h4>
                                                            <p className="text-[#B4A5FF] whitespace-pre-wrap">{subsection.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#E2DDFF]">Version History</h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Mock version history */}
                                <div className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#E2DDFF] font-medium">v1.0</span>
                                        <span className="text-xs text-[#B4A5FF]">2 hours ago</span>
                                    </div>
                                    <div className="text-sm text-[#B4A5FF]">Initial draft created</div>
                                </div>
                                <div className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#E2DDFF] font-medium">v1.1</span>
                                        <span className="text-xs text-[#B4A5FF]">1 hour ago</span>
                                    </div>
                                    <div className="text-sm text-[#B4A5FF]">Added security section</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviewers Modal */}
            <AnimatePresence>
                {showReviewers && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#E2DDFF]">Reviewers</h3>
                                <button
                                    onClick={() => setShowReviewers(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {policy.reviewers.map(reviewer => (
                                    <div
                                        key={reviewer}
                                        className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FaUsers className="w-4 h-4 text-[#B4A5FF]" />
                                                <span className="text-[#E2DDFF]">{reviewer}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#B4A5FF]">Pending Review</span>
                                                <button
                                                    onClick={() => removeReviewer(reviewer)}
                                                    className="p-1 text-[#B4A5FF] hover:text-red-400 transition-colors"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const reviewer = prompt('Enter reviewer name:');
                                        if (reviewer) addReviewer(reviewer);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-[#B4A5FF]/20 text-[#E2DDFF] px-4 py-2 rounded-lg hover:bg-[#B4A5FF]/30"
                                >
                                    <FaPlus className="w-4 h-4" />
                                    Add Reviewer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Templates Modal */}
            <AnimatePresence>
                {showTemplates && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#E2DDFF]">Policy Templates</h3>
                                    <p className="text-[#B4A5FF] mt-1">Choose a template to start creating your policy</p>
                                </div>
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(policyTemplates).map(([key, template]) => (
                                    <div
                                        key={key}
                                        onClick={() => applyTemplate(template)}
                                        className="group bg-[#2E1D4C]/30 rounded-xl p-6 border border-[#B4A5FF]/20 cursor-pointer hover:border-[#B4A5FF]/40 transition-all duration-300 hover:bg-[#2E1D4C]/40"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#B4A5FF]/10 rounded-lg group-hover:bg-[#B4A5FF]/20 transition-colors">
                                                    <FaShieldAlt className="w-5 h-5 text-[#B4A5FF]" />
                                                </div>
                                                <h4 className="text-lg font-medium text-[#E2DDFF]">{template.title}</h4>
                                            </div>
                                            <FaChevronRight className="w-5 h-5 text-[#B4A5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-[#B4A5FF] text-sm mb-4">{template.description}</p>
                                        <div className="space-y-2">
                                            {template.sections.map((section, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-[#B4A5FF]/80">
                                                    <FaFileAlt className="w-4 h-4" />
                                                    <span>{section.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-[#B4A5FF]/10">
                                            <div className="flex items-center gap-2 text-sm text-[#B4A5FF]">
                                                <FaUsers className="w-4 h-4" />
                                                <span>Recommended Reviewers: Legal Team, Compliance Officer</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Assistant Modal */}
            <AnimatePresence>
                {showAIAssistant && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13091F] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-[#E2DDFF]">AI Assistant</h3>
                                <button
                                    onClick={() => setShowAIAssistant(false)}
                                    className="p-1.5 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={generateAISuggestions}
                                    className="w-full flex items-center justify-center gap-2 bg-[#B4A5FF]/20 text-[#E2DDFF] px-4 py-2 rounded-lg hover:bg-[#B4A5FF]/30"
                                >
                                    <FaMagic className="w-4 h-4" />
                                    Generate Suggestions
                                </button>
                                {aiSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#2E1D4C]/30 rounded-lg p-4 border border-[#B4A5FF]/20"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[#E2DDFF] font-medium">{suggestion.title}</h4>
                                            <button
                                                onClick={suggestion.action}
                                                className="text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        <p className="text-sm text-[#B4A5FF]">{suggestion.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Export Options */}
            <AnimatePresence>
                {showExportOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 right-6 bg-[#2E1D4C] border border-[#B4A5FF]/30 rounded-lg shadow-lg p-4 z-50 w-80"
                    >
                        <div className="text-sm text-[#B4A5FF] mb-4">Export Options</div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-[#E2DDFF]">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeMetadata}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                                        className="rounded border-[#B4A5FF]/20"
                                    />
                                    Include Metadata
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#E2DDFF]">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeVersionHistory}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeVersionHistory: e.target.checked }))}
                                        className="rounded border-[#B4A5FF]/20"
                                    />
                                    Include Version History
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#E2DDFF]">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeReviewers}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeReviewers: e.target.checked }))}
                                        className="rounded border-[#B4A5FF]/20"
                                    />
                                    Include Reviewers
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#E2DDFF]">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions.includeTags}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeTags: e.target.checked }))}
                                        className="rounded border-[#B4A5FF]/20"
                                    />
                                    Include Tags
                                </label>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs text-[#B4A5FF]">Export Format</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => exportPolicy('json')}
                                        className="text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <FaFileCode className="w-4 h-4" />
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => exportPolicy('csv')}
                                        className="text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <FaFileCsv className="w-4 h-4" />
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => exportPolicy('pdf')}
                                        className="text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        {/* <FilePdf className="w-4 h-4" /> */}
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => exportPolicy('docx')}
                                        className="text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        {/* <FileWord className="w-4 h-4" /> */}
                                        DOCX
                                    </button>
                                    <button
                                        onClick={() => exportPolicy('html')}
                                        className="text-left px-3 py-1.5 text-sm text-[#E2DDFF] hover:bg-[#B4A5FF]/20 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <FaFileAlt className="w-4 h-4" />
                                        HTML
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PolicyGenerator; 