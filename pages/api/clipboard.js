import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const clipboard = await kv.get('clipboard') || '';
        const lastUpdated = await kv.get('lastUpdated') || Date.now();
        return res.status(200).json({ text: clipboard, lastUpdated });
    }

    if (req.method === 'POST') {
        const text = req.body.text || '';
        await kv.set('clipboard', text);
        await kv.set('lastUpdated', Date.now());
        return res.status(200).json({ status: 'ok', clipboard: text });
    }

    return res.status(405).end();
}
