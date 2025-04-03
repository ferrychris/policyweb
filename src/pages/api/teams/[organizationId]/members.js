import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    const { organizationId } = req.query;
    
    switch (req.method) {
        case 'GET':
            try {
                const { data: members, error } = await supabase
                    .from('team_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        created_at,
                        users (
                            name,
                            email
                        )
                    `)
                    .eq('organization_id', organizationId)
                    .order('role', { ascending: true, nullsLast: false })
                    .order('created_at', { ascending: true });

                if (error) {
                    throw error;
                }

                // Transform the data to match the expected format
                const formattedMembers = members.map(member => ({
                    id: member.id,
                    name: member.users.name,
                    email: member.users.email,
                    role: member.role,
                    created_at: member.created_at
                }));

                return res.status(200).json({ members: formattedMembers });
            } catch (error) {
                console.error('Error fetching team members:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

        case 'PATCH':
            try {
                const { memberId } = req.query;
                const { role } = req.body;

                if (!memberId || !role) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }

                const { data: member, error } = await supabase
                    .from('team_members')
                    .update({ 
                        role: role,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', memberId)
                    .eq('organization_id', organizationId)
                    .neq('role', 'owner')
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                if (!member) {
                    return res.status(404).json({ message: 'Team member not found or cannot be updated' });
                }

                return res.status(200).json({ member });
            } catch (error) {
                console.error('Error updating team member role:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

        case 'DELETE':
            try {
                const { memberId } = req.query;

                if (!memberId) {
                    return res.status(400).json({ message: 'Missing member ID' });
                }

                const { error } = await supabase
                    .from('team_members')
                    .delete()
                    .eq('id', memberId)
                    .eq('organization_id', organizationId)
                    .neq('role', 'owner');

                if (error) {
                    throw error;
                }

                return res.status(200).json({ message: 'Team member removed successfully' });
            } catch (error) {
                console.error('Error removing team member:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
            return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
} 