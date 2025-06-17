let clipboard = '';
let lastUpdated = Date.now();

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json({ text: clipboard, lastUpdated });
    } else if (req.method === 'POST') {
        clipboard = req.body.text || '';
        lastUpdated = Date.now();
        return res.status(200).json({ status: 'ok', clipboard });
    } else {
        return res.status(405).end(); // Method Not Allowed
    }
}
