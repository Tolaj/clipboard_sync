import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
    const edgeConfig = createClient(process.env.EDGE_CONFIG);

    try {
        if (req.method === 'GET') {
            const edgeData = await edgeConfig.getAll() || {};
            const clipboard = edgeData.clipboard || '';
            const lastUpdated = edgeData.lastUpdated || 0;

            // Set cache headers for PWA
            res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');

            return res.status(200).json({
                text: clipboard,
                lastUpdated
            });
        }

        if (req.method === 'POST') {
            const { text } = req.body;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({ error: 'Invalid text' });
            }

            await setEdgeStorage(text);
            return res.status(200).json({
                status: 'ok',
                clipboard: text
            });
        }

        return res.status(405).end(); // Method Not Allowed
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const setEdgeStorage = async (clipboard) => {
    try {
        const response = await fetch(
            `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${process.env.EDGE_VERCEL_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [
                        {
                            operation: 'update',
                            key: 'clipboard',
                            value: clipboard,
                        },
                        {
                            operation: 'update',
                            key: 'lastUpdated',
                            value: Date.now(),
                        }
                    ],
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Edge config update failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Edge Storage Error:', error);
        throw error;
    }
}