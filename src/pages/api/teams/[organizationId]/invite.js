import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../../../../lib/email';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    const { organizationId } = req.query;
    const { email, role, invitedBy } = req.body;

    try {
        // Check if user is already a member
        const { data: existingMember, error: memberError } = await supabase
            .from('team_members')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('user_email', email)
            .single();

        if (memberError && memberError.code !== 'PGRST116') {
            throw memberError;
        }

        if (existingMember) {
            return res.status(400).json({ message: 'User is already a team member' });
        }

        // Create invitation
        const { data: invitation, error: inviteError } = await supabase
            .from('team_invitations')
            .insert([
                {
                    organization_id: organizationId,
                    email: email,
                    role: role,
                    invited_by: invitedBy,
                    status: 'pending',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
                }
            ])
            .select()
            .single();

        if (inviteError) {
            throw inviteError;
        }

        // Get organization details
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();

        if (orgError) {
            throw orgError;
        }

        const orgName = org?.name || 'Organization';

        // Send invitation email
        await sendEmail({
            to: email,
            subject: `Invitation to join ${orgName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #13091F; color: #E2DDFF; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #E2DDFF; margin-bottom: 20px;">You've been invited to join ${orgName}</h2>
                        <p style="color: #B4A5FF; margin-bottom: 15px;">You've been invited to join the team as a ${role}.</p>
                        <p style="color: #B4A5FF; margin-bottom: 25px;">Click the button below to accept the invitation:</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/accept/${invitation.id}" 
                           style="display: inline-block; background-color: rgba(180, 165, 255, 0.2); color: #E2DDFF; 
                                  padding: 12px 24px; border-radius: 8px; text-decoration: none; 
                                  border: 1px solid rgba(180, 165, 255, 0.2);">
                            Accept Invitation
                        </a>
                        <p style="color: #B4A5FF; margin-top: 25px; font-size: 14px;">
                            This invitation will expire in 7 days.
                        </p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({
            message: 'Invitation sent successfully',
            inviteId: invitation.id
        });
    } catch (error) {
        console.error('Error sending invitation:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 