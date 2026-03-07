import React from 'react';
import FavoritesPanel from '../components/FavoritesPanel';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getCryptoDisplay } from '../utils/cryptoHelper';

export default function Favorites() {
    const { favorites, latestRates, loadFavorites } = useOutletContext();
    const navigate = useNavigate();

    return (
        <FavoritesPanel
            favorites={favorites}
            latestRates={latestRates}
            getCryptoDisplay={getCryptoDisplay}
            onRefresh={loadFavorites}
            setActiveTab={(tab) => {
                if (tab === 'market') {
                    navigate('/');
                }
            }}
            setSelectedCrypto={(symbol) => {
                // You might want to pass this up or use context to set global selectedCrypto 
                // if navigating to home, but for simplicity we rely on the App.jsx context if needed.
                // Actually, the outlet context handles this.
                window.dispatchEvent(new CustomEvent('SELECT_CRYPTO', { detail: symbol }));
                navigate('/');
            }}
        />
    );
}
