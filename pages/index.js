import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
    const [text, setText] = useState('');
    const [lastText, setLastText] = useState('');
    const [status, setStatus] = useState('Ready');
    const [isOnline, setIsOnline] = useState(true);
    const API_URL = '/api/clipboard';

    const sync = async () => {
        if (!isOnline) {
            setStatus('Offline - changes will sync when back online');
            return;
        }

        try {
            setStatus('Syncing...');

            // Read local clipboard
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

            // Get remote clipboard
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            if (data.text && data.text !== lastText) {
                await navigator.clipboard.writeText(data.text);
                setLastText(data.text);
                setText(data.text);
            }

            setStatus('Synced at ' + new Date().toLocaleTimeString());
        } catch (err) {
            console.log('Clipboard error:', err.message);
            setStatus('Error: ' + err.message);
            if (err.message.includes('Network')) {
                setIsOnline(false);
            }
        }
    };

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        navigator.clipboard.writeText(newText);
        setLastText(newText);
    };

    useEffect(() => {
        // Check online status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync
        sync();

        // Periodic sync
        const interval = setInterval(sync, 3000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [lastText]);

    return (
        <main style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
            <Head>
                <title>Cloud Clipboard</title>
                <meta name="description" content="Sync your clipboard across devices" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="manifest" href="/manifest.json" />
            </Head>

            <h2>📋 Cloud Clipboard</h2>
            <textarea
                rows="10"
                style={{ width: '100%', padding: 10, fontSize: 16 }}
                value={text}
                onChange={handleTextChange}
                placeholder="Copy or type text here to sync across devices..."
            />
            <div style={{ marginTop: 10, color: isOnline ? 'green' : 'red' }}>
                {status} {!isOnline && '🔴'}
            </div>
            <p>Changes sync automatically between devices.</p>
        </main>
    );
}