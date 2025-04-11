import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    FaUserPlus,
    FaTrash,
    FaEnvelope,
    FaUserCircle,
    FaSpinner,
    FaCheck,
    FaCrown
} from 'react-icons/fa';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import SubscriptionGate from '../common/SubscriptionGate';
import { FEATURES } from '../../hooks/useSubscription';

export const TeamManagement = ({ onClose }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMembers, setIsFetchingMembers] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [teamId, setTeamId] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchTeamMembers(user.id);
            }
        };
        
        fetchUser();
    }, []);

    const fetchTeamMembers = async (userId) => {
        setIsFetchingMembers(true);
        try {
            // First get the team ID
            const { data: teamData, error: teamError } = await supabase
                .from('team_profiles')
                .select('id, name')
                .eq('owner_id', userId)
                .single();

            if (teamError && teamError.code !== 'PGRST116') {
                console.error('Error fetching team:', teamError);
                return;
            }

            if (teamData) {
                setTeamId(teamData.id);
                
                // Then get team members
                const { data: membersData, error: membersError } = await supabase
                    .from('team_members')
                    .select(`
                        id,
                        role,
                        status,
                        invited_email,
                        user_id,
                        users:user_id (email, first_name, last_name)
                    `)
                    .eq('team_id', teamData.id);

                if (membersError) {
                    console.error('Error fetching team members:', membersError);
                    return;
                }

                // Transform data to match the component expectations
                const formattedMembers = membersData.map(member => ({
                    id: member.id,
                    email: member.invited_email || (member.users?.email || ''),
                    name: member.users ? `${member.users.first_name || ''} ${member.users.last_name || ''}`.trim() : 'Invited User',
                    role: member.role,
                    status: member.status
                }));

                setTeamMembers(formattedMembers || []);
            } else {
                setTeamMembers([]);
            }
        } catch (error) {
            console.error('Error in team fetch:', error);
            toast.error('Failed to load team members');
            setTeamMembers([]);
        } finally {
            setIsFetchingMembers(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!teamId) {
                // Create a new team if it doesn't exist
                const { data: newTeam, error: createError } = await supabase
                    .from('team_profiles')
                    .insert({
                        owner_id: user.id,
                        name: `${user.user_metadata?.name || 'Team'}'s Team`
                    })
                    .select('id')
                    .single();

                if (createError) throw createError;
                setTeamId(newTeam.id);
            }

            // Now invite the team member
            const { error: inviteError } = await supabase
                .from('team_members')
                .insert({
                    team_id: teamId,
                    invited_email: inviteEmail,
                    role: role,
                    status: 'invited'
                });

            if (inviteError) throw inviteError;

            // Send invitation email via Edge Function
            const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
                body: { 
                    teamId,
                    email: inviteEmail,
                    inviterName: user.user_metadata?.name || user.email
                }
            });

            if (emailError) {
                console.error('Error sending invitation email:', emailError);
                // We still continue as the DB record was created
            }

            toast.success('Invitation sent successfully');
            setInviteEmail('');
            setRole('viewer');
            setShowInviteForm(false);
            fetchTeamMembers(user.id); // Refresh the list
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error('Failed to send invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            toast.success('Team member removed successfully');
            // Update the local state
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        } catch (error) {
            console.error('Error removing team member:', error);
            toast.error('Failed to remove team member');
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            const { error } = await supabase
                .from('team_members')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;

            // Update the local state
            setTeamMembers(prev => prev.map(member => 
                member.id === memberId ? { ...member, role: newRole } : member
            ));
            toast.success('Role updated successfully');
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    return (
        <SubscriptionGate feature={FEATURES.TEAM_MANAGEMENT}>
            <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Team Management</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Add Invite Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowInviteForm(true)}
                        className="flex items-center px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors"
                    >
                        <FaUserPlus className="mr-2" />
                        Invite Member
                    </button>
                </div>

                {/* Invite Form Modal */}
                {showInviteForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-[#13091F] rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-[#E2DDFF] mb-4">Invite Team Member</h3>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-[#B4A5FF] mb-2">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B4A5FF]" />
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[#B4A5FF] mb-2">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-2 bg-[#2E1D4C]/30 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteForm(false)}
                                        className="px-4 py-2 text-[#B4A5FF] hover:text-[#E2DDFF] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center px-4 py-2 bg-[#B4A5FF]/20 text-[#E2DDFF] rounded-lg hover:bg-[#B4A5FF]/30 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck className="mr-2" />
                                                Send Invitation
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Team Members List */}
                <div className="space-y-4">
                    {isFetchingMembers ? (
                        <div className="flex items-center justify-center py-8">
                            <FaSpinner className="w-6 h-6 text-[#B4A5FF] animate-spin" />
                            <span className="ml-2 text-[#B4A5FF]">Loading team members...</span>
                        </div>
                    ) : teamMembers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[#B4A5FF]">No team members found</p>
                            <p className="text-[#B4A5FF]/60 text-sm mt-2">
                                Click "Invite Member" to add someone to your team
                            </p>
                        </div>
                    ) : (
                        teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-[#2E1D4C]/30 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <FaUserCircle className="w-10 h-10 text-[#B4A5FF]" />
                                    <div>
                                        <h4 className="text-[#E2DDFF] font-medium">{member.name}</h4>
                                        <p className="text-[#B4A5FF] text-sm">{member.email}</p>
                                        {member.status === 'invited' && (
                                            <span className="text-yellow-400 text-xs">Invited - Pending</span>
                                        )}
                                    </div>
                                    {member.role === 'owner' && (
                                        <FaCrown className="ml-2 text-yellow-500" title="Owner" />
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    {member.role !== 'owner' && (
                                        <>
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="px-3 py-1 bg-[#2E1D4C]/50 border border-[#B4A5FF]/20 rounded-lg text-[#E2DDFF] focus:outline-none focus:border-[#B4A5FF]"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                title="Remove member"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SubscriptionGate>
    );
};

export default TeamManagement; 