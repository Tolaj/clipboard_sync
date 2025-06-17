import { createClient } from '@vercel/edge-config';
export default async function handler(req, res) {
    const edgeConfig = createClient(process.env.EDGE_CONFIG);

    if (req.method === 'GET') {
        let edgeData = await edgeConfig.getAll() || '';
        const clipboard = edgeData.clipboard
        const lastUpdated = edgeData.lastUpdated

        return res.status(200).json({ text: clipboard, lastUpdated });
    }

    if (req.method === 'POST') {
        const { text } = req.body;
        setEdgeStorage(text)
        return res.status(200).json({ status: 'ok', clipboard: text });
    }

    return res.status(405).end(); // Method Not Allowed
}

const setEdgeStorage = async (clipboard) => {
    try {
        const updateEdgeConfig = await fetch(
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
        const result = await updateEdgeConfig.json();
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}