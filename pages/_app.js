// pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('✅ Service Worker registered'))
                .catch((err) => console.error('❌ Service Worker registration failed:', err));
        }
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
