import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await supabase.auth.admin.sendEmail(to, {
            template: 'invite',
            subject: subject,
            data: {
                invitation_url: `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept`,
                email_content: html
            }
        });

        if (error) {
            throw error;
        }

        console.log('Email sent successfully');
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}; 