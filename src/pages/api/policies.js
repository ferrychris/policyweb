import { pool } from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { title, content, user_id, package_id } = req.body;

        // Validate required fields
        if (!title || !content || !user_id || !package_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Insert new policy
        const query = `
            INSERT INTO user_policies (
                id,
                user_id,
                package_id,
                title,
                content,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                $1,
                $2,
                $3,
                $4,
                NOW(),
                NOW()
            ) RETURNING id;
        `;

        const values = [user_id, package_id, title, content];
        const result = await pool.query(query, values);

        return res.status(201).json({
            message: 'Policy created successfully',
            policy_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error creating policy:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 