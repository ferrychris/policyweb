import React, { useState, useEffect } from 'react';
import { X, Users, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import PolicyEditor from '../editor/PolicyEditor';
import { toast } from 'sonner';
import axios from 'axios';
import TeamManagement from '../teams/TeamManagement';
import SubscriptionGate from '../common/SubscriptionGate';
import { FEATURES } from '../../hooks/useSubscription';
import PolicyTypeSelector from './PolicyTypeSelector';

const PolicyGenerator = ({ userId, packageId, policyTitle, organizationId }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [policyData, setPolicyData] = useState({
        title: policyTitle,
        packageId: packageId,
        userId: userId,
        organizationId: organizationId
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showTeamManagement, setShowTeamManagement] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handlePackageSelect = async (packageType) => {
        setSelectedPackage(packageType);
        setIsProcessing(true);

        try {
            // Here we'll show the payment UI
            setShowPayment(true);

            // After successful payment:
            const response = await axios.post('/api/subscriptions/purchase', {
                packageType,
                userId,
                organizationId
            });

            if (response.data.success) {
                toast.success('Package purchased successfully!');
                setShowEditor(true);
            } else {
                throw new Error('Failed to process payment');
            }
        } catch (error) {
            console.error('Error processing package selection:', error);
            toast.error('Failed to process package selection. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const savePolicy = async (policyContent) => {
        try {
            const response = await axios.post('/api/policies', {
                title: policyData.title,
                content: policyContent.content,
                user_id: policyData.userId,
                package_id: selectedPackage, // Use the selected package
                organization_id: policyData.organizationId
            });

            if (response.status === 200 || response.status === 201) {
                toast.success('Policy saved successfully');
                return true;
            }
            throw new Error('Failed to save policy');
        } catch (error) {
            console.error('Error saving policy:', error);
            toast.error('Failed to save policy. Please try again.');
            return false;
        }
    };

    const handleEditorSave = async (data) => {
        setIsSaving(true);
        try {
            const saved = await savePolicy(data);
            if (saved) {
                setShowEditor(false);
            }
        } catch (error) {
            console.error('Error in handleEditorSave:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditorClose = () => {
        setShowEditor(false);
    };

    // Add Roboto font
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const startGeneration = () => {
        setShowEditor(true);
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#B4A5FF] mb-4" />
                <p className="text-white">Processing your selection...</p>
            </div>
        );
    }

    if (showTeamManagement) {
        return (
            <TeamManagement
                organizationId={organizationId}
                onClose={() => setShowTeamManagement(false)}
            />
        );
    }

    if (!selectedPackage || !showEditor) {
        return (
            <div className="w-full h-full bg-[#13091F] p-6">
                <PolicyTypeSelector
                    onSelect={handlePackageSelect}
                    currentSubscription={null}
                />
            </div>
        );
    }

    return (
        <SubscriptionGate feature={FEATURES.POLICY_GENERATION}>
            <div className="w-full h-[calc(100vh-4rem)] relative flex">
                {/* Main Content */}
                <div className={cn(
                    "flex-1 transition-all duration-300",
                    showSidebar ? "mr-80" : "mr-0"
                )}>
                    {showEditor ? (
                        <div className="h-full">
                            <PolicyEditor
                                initialData={{
                                    ...policyData,
                                    styleConfig: {
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
                                    }
                                }}
                                onSave={handleEditorSave}
                                onClose={handleEditorClose}
                            />
                        </div>
                    ) : (
                        <div className="bg-[#13091F] rounded-xl p-6 shadow-xl h-full font-['Roboto']">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-[#E2DDFF]">
                                    Generate New Policy
                                </h2>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowTeamManagement(true)}
                                        className="px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors font-medium"
                                    >
                                        <Users className="w-5 h-5 mr-2" />
                                        Team
                                    </button>
                                    <button
                                        onClick={startGeneration}
                                        className="px-6 py-3 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors font-medium"
                                    >
                                        Start Generation
                                    </button>
                                </div>
                            </div>
                            <p className="text-[#B4A5FF] text-lg">
                                Click the button above to start generating your policy using AI assistance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Team Management Sidebar */}
                <div className={cn(
                    "fixed right-0 top-0 h-full w-80 bg-[#13091F] border-l border-[#2E1D4C] transition-transform duration-300 transform z-10",
                    showSidebar ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="flex items-center justify-center w-10 h-20 bg-[#13091F] border-l border-t border-b border-[#2E1D4C] rounded-l-lg text-[#E2DDFF] hover:text-[#B4A5FF] transition-colors"
                        >
                            {showSidebar ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                        </button>
                    </div>
                    <div className="h-full overflow-y-auto">
                        {showTeamManagement ? (
                            <TeamManagement
                                userId={userId}
                                organizationId={organizationId}
                                onClose={() => setShowTeamManagement(false)}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </SubscriptionGate>
    );
};

export default PolicyGenerator;