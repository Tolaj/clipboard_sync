import { useEffect, useState } from 'react';

export default function Home() {
    const [text, setText] = useState('');
    const [lastText, setLastText] = useState('');
    const API_URL = '/api/clipboard';

    const sync = async () => {
        try {
            const read = await navigator.clipboard.readText();
            if (read !== lastText) {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: read }),
                });
                setLastText(read);
                setText(read);
            }

            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.text !== lastText) {
                await navigator.clipboard.writeText(data.text);
                setLastText(data.text);
                setText(data.text);
            }
        } catch (err) {
            console.log('Clipboard error:', err.message);
        }
    };

    useEffect(() => {
        const interval = setInterval(sync, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h2>📋 Clipboard Sync</h2>
            <textarea
                rows="5"
                cols="40"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <p>Syncs every 3 seconds between devices.</p>
        </main>
    );
}
