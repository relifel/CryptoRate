import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const customStyles = {
    body: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        backgroundColor: '#ffffff',
        color: '#111827',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        lineHeight: '1.5',
    },
    appContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 40px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 0',
        borderBottom: '1px solid transparent',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        color: '#111827',
        cursor: 'pointer',
    },
    brandMark: {
        width: '8px',
        height: '8px',
        backgroundColor: '#fef08a',
        borderRadius: '1px',
    },
    brandName: {
        fontWeight: '700',
        fontSize: '20px',
        letterSpacing: '-0.02em',
    },
    mainNav: {
        display: 'flex',
        gap: '32px',
    },
    navLink: {
        textDecoration: 'none',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '400',
        transition: 'color 0.2s ease',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        fontFamily: 'inherit',
    },
    navLinkActive: {
        color: '#111827',
        fontWeight: '500',
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    searchContainer: {
        position: 'relative',
    },
    searchInput: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '9999px',
        padding: '10px 16px 10px 36px',
        fontSize: '14px',
        width: '240px',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        color: '#111827',
        outline: 'none',
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '14px',
        height: '14px',
        color: '#9ca3af',
    },
    btnPrimary: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#fef08a',
        color: '#111827',
        border: 'none',
        borderRadius: '9999px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        textDecoration: 'none',
        fontFamily: 'inherit',
    },
    btnIconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '50%',
    },
    marketOverview: {
        margin: '64px 0 48px 0',
        display: 'flex',
        gap: '64px',
    },
    statBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    statLabel: {
        fontSize: '24px',
        color: '#6b7280',
        fontWeight: '400',
        letterSpacing: '-0.01em',
    },
    statValue: {
        fontSize: '48px',
        color: '#111827',
        fontWeight: '700',
        letterSpacing: '-0.03em',
        lineHeight: '1',
    },
    statChange: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500',
        gap: '4px',
    },
    trendUp: { color: '#10b981' },
    trendDown: { color: '#ef4444' },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    filterGroup: {
        display: 'flex',
        gap: '8px',
    },
    filterBtn: {
        background: 'transparent',
        border: '1px solid #f3f4f6',
        color: '#6b7280',
        padding: '8px 16px',
        borderRadius: '9999px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    filterBtnActive: {
        background: '#f9fafb',
        borderColor: '#111827',
        color: '#111827',
        fontWeight: '500',
    },
    tableContainer: {
        width: '100%',
        overflowX: 'auto',
        borderRadius: '24px',
        background: '#ffffff',
        border: '1px solid #f3f4f6',
        padding: '0 8px 24px 8px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    th: {
        padding: '24px 16px 16px 16px',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#9ca3af',
        fontWeight: '500',
        borderBottom: '1px solid #f3f4f6',
    },
    td: {
        padding: '16px',
        borderBottom: '1px solid #f3f4f6',
        fontVariantNumeric: 'tabular-nums',
        fontSize: '15px',
        verticalAlign: 'middle',
    },
    cellCoin: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    coinIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        border: '1px solid #f3f4f6',
    },
    coinDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    coinName: {
        fontWeight: '600',
        color: '#111827',
        lineHeight: '1.2',
    },
    coinSymbol: {
        fontSize: '13px',
        color: '#6b7280',
        lineHeight: '1.2',
    },
    cellPrice: {
        fontWeight: '500',
        textAlign: 'right',
    },
    watchToggle: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: '#e5e7eb',
        transition: 'color 0.2s',
    },
    watchToggleActive: {
        color: '#fef08a',
    },
    sparkline: {
        width: '120px',
        height: '40px',
    },
};

const coins = [
    {
        id: 1,
        rank: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        letter: 'B',
        iconStyle: { background: '#fdf2f8', color: '#db2777', borderColor: '#fce7f3' },
        price: '$64,230.50',
        change1h: '-0.12%',
        change1hType: 'down',
        change24h: '+1.45%',
        change24hType: 'up',
        marketCap: '$1,264,890,123,456',
        volume: '$34,567,890,123',
        sparkType: 'up',
        sparkPath: 'M5 30 Q 20 25, 30 35 T 60 20 T 90 15 T 115 5',
        watchedDefault: true,
    },
    {
        id: 2,
        rank: 2,
        name: 'Ethereum',
        symbol: 'ETH',
        letter: 'E',
        iconStyle: { background: '#f0fdf4', color: '#16a34a', borderColor: '#dcfce7' },
        price: '$3,450.75',
        change1h: '+0.45%',
        change1hType: 'up',
        change24h: '+2.10%',
        change24hType: 'up',
        marketCap: '$415,670,890,123',
        volume: '$18,234,567,890',
        sparkType: 'up',
        sparkPath: 'M5 35 Q 20 30, 40 20 T 80 15 T 100 25 T 115 10',
        watchedDefault: false,
    },
    {
        id: 3,
        rank: 3,
        name: 'Tether',
        symbol: 'USDT',
        letter: 'T',
        iconStyle: { background: '#eff6ff', color: '#2563eb', borderColor: '#dbeafe' },
        price: '$1.00',
        change1h: '0.00%',
        change1hType: 'neutral',
        change24h: '-0.01%',
        change24hType: 'down',
        marketCap: '$104,120,456,789',
        volume: '$45,678,901,234',
        sparkType: 'neutral',
        sparkPath: 'M5 20 L 115 20',
        watchedDefault: false,
    },
    {
        id: 4,
        rank: 4,
        name: 'Solana',
        symbol: 'SOL',
        letter: 'S',
        iconStyle: { background: '#faf5ff', color: '#9333ea', borderColor: '#f3e8ff' },
        price: '$145.20',
        change1h: '-1.20%',
        change1hType: 'down',
        change24h: '-4.50%',
        change24hType: 'down',
        marketCap: '$65,430,210,987',
        volume: '$5,432,109,876',
        sparkType: 'down',
        sparkPath: 'M5 10 Q 25 15, 45 5 T 75 25 T 95 20 T 115 35',
        watchedDefault: true,
    },
    {
        id: 5,
        rank: 5,
        name: 'BNB',
        symbol: 'BNB',
        letter: 'B',
        iconStyle: { background: '#fffbeb', color: '#d97706', borderColor: '#fef3c7' },
        price: '$580.45',
        change1h: '+0.10%',
        change1hType: 'up',
        change24h: '+0.80%',
        change24hType: 'up',
        marketCap: '$86,750,123,456',
        volume: '$2,145,678,901',
        sparkType: 'up',
        sparkPath: 'M5 25 Q 20 25, 40 20 T 70 30 T 90 15 T 115 10',
        watchedDefault: false,
    },
];

const filterCategories = ['All', 'DeFi', 'NFTs & Collectibles', 'Layer 1'];

const WatchToggleIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
);

const CoinRow = ({ coin, watched, onToggleWatch, hovered, onMouseEnter, onMouseLeave }) => {
    const getChangeStyle = (type) => {
        if (type === 'up') return { ...customStyles.trendUp, textAlign: 'right' };
        if (type === 'down') return { ...customStyles.trendDown, textAlign: 'right' };
        return { color: '#9ca3af', textAlign: 'right' };
    };

    const getSparkStroke = (type) => {
        if (type === 'up') return '#10b981';
        if (type === 'down') return '#ef4444';
        return '#9ca3af';
    };

    return (
        <tr
            style={{
                transition: 'background-color 0.1s ease',
                cursor: 'pointer',
                backgroundColor: hovered ? '#f9fafb' : 'transparent',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <td style={customStyles.td}>
                <button
                    style={{
                        ...customStyles.watchToggle,
                        ...(watched ? customStyles.watchToggleActive : {}),
                    }}
                    onClick={() => onToggleWatch(coin.id)}
                >
                    <WatchToggleIcon />
                </button>
            </td>
            <td style={{ ...customStyles.td, color: '#6b7280' }}>{coin.rank}</td>
            <td style={customStyles.td}>
                <div style={customStyles.cellCoin}>
                    <div style={{ ...customStyles.coinIcon, ...coin.iconStyle }}>{coin.letter}</div>
                    <div style={customStyles.coinDetails}>
                        <span style={customStyles.coinName}>{coin.name}</span>
                        <span style={customStyles.coinSymbol}>{coin.symbol}</span>
                    </div>
                </div>
            </td>
            <td style={customStyles.cellPrice}>{coin.price}</td>
            <td style={getChangeStyle(coin.change1hType)}>{coin.change1h}</td>
            <td style={getChangeStyle(coin.change24hType)}>{coin.change24h}</td>
            <td style={{ ...customStyles.td, textAlign: 'right' }}>{coin.marketCap}</td>
            <td style={{ ...customStyles.td, textAlign: 'right' }}>{coin.volume}</td>
            <td style={{ ...customStyles.td, textAlign: 'right' }}>
                <svg style={customStyles.sparkline} viewBox="0 0 120 40">
                    <path
                        d={coin.sparkPath}
                        fill="none"
                        stroke={getSparkStroke(coin.sparkType)}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </td>
        </tr>
    );
};

const App = () => {
    const [activeNav, setActiveNav] = useState('Cryptocurrencies');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchValue, setSearchValue] = useState('');
    const [searchFocused, setSearchFocused] = useState('');
    const [watchedCoins, setWatchedCoins] = useState(
        coins.reduce((acc, coin) => ({ ...acc, [coin.id]: coin.watchedDefault }), {})
    );
    const [hoveredRow, setHoveredRow] = useState(null);
    const [btnHovered, setBtnHovered] = useState(false);

    const navLinks = ['Cryptocurrencies', 'My Assets', 'Watchlist', 'AI Analysis'];

    const handleToggleWatch = (coinId) => {
        setWatchedCoins((prev) => ({ ...prev, [coinId]: !prev[coinId] }));
    };

    const filteredCoins = coins.filter((coin) => {
        const searchLower = searchValue.toLowerCase();
        return (
            coin.name.toLowerCase().includes(searchLower) ||
            coin.symbol.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Router basename="/">
            <div style={customStyles.body}>
                <div style={customStyles.appContainer}>
                    <header style={customStyles.header}>
                        <div style={customStyles.brand}>
                            <div style={customStyles.brandMark}></div>
                            <div style={customStyles.brandName}>Clarify</div>
                        </div>

                        <nav style={customStyles.mainNav}>
                            {navLinks.map((link) => (
                                <button
                                    key={link}
                                    style={{
                                        ...customStyles.navLink,
                                        ...(activeNav === link ? customStyles.navLinkActive : {}),
                                    }}
                                    onClick={() => setActiveNav(link)}
                                >
                                    {link}
                                </button>
                            ))}
                        </nav>

                        <div style={customStyles.headerActions}>
                            <div style={customStyles.searchContainer}>
                                <svg
                                    style={customStyles.searchIcon}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    style={{
                                        ...customStyles.searchInput,
                                        width: searchFocused ? '280px' : '240px',
                                        borderColor: searchFocused ? '#6b7280' : '#e5e7eb',
                                    }}
                                    placeholder="Search coins, exchanges..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                />
                            </div>
                            <button
                                style={{
                                    ...customStyles.btnPrimary,
                                    backgroundColor: btnHovered ? '#fde047' : '#fef08a',
                                }}
                                onMouseEnter={() => setBtnHovered(true)}
                                onMouseLeave={() => setBtnHovered(false)}
                            >
                                Connect
                                <div style={customStyles.btnIconWrapper}>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </header>

                    <main>
                        <section style={customStyles.marketOverview}>
                            <div style={customStyles.statBlock}>
                                <div style={customStyles.statLabel}>Global Market Cap.</div>
                                <div style={customStyles.statValue}>$2.45T</div>
                                <div style={{ ...customStyles.statChange, ...customStyles.trendUp }}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    2.4%{' '}
                                    <span style={{ color: '#6b7280', fontWeight: '400', marginLeft: '4px' }}>24h</span>
                                </div>
                            </div>
                            <div style={customStyles.statBlock}>
                                <div style={customStyles.statLabel}>24h Volume.</div>
                                <div style={customStyles.statValue}>$84.2B</div>
                                <div style={{ ...customStyles.statChange, ...customStyles.trendDown }}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                    1.2%{' '}
                                    <span style={{ color: '#6b7280', fontWeight: '400', marginLeft: '4px' }}>24h</span>
                                </div>
                            </div>
                        </section>

                        <section style={customStyles.toolbar}>
                            <div style={customStyles.filterGroup}>
                                {filterCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        style={{
                                            ...customStyles.filterBtn,
                                            ...(activeFilter === cat ? customStyles.filterBtnActive : {}),
                                        }}
                                        onClick={() => setActiveFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div style={customStyles.filterGroup}>
                                <button style={customStyles.filterBtn}>
                                    Rows: 50
                                    <svg
                                        style={{ width: '12px', height: '12px', marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </section>

                        <section style={customStyles.tableContainer}>
                            <table style={customStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ ...customStyles.th, width: '40px' }}></th>
                                        <th style={{ ...customStyles.th, width: '40px' }}>#</th>
                                        <th style={customStyles.th}>Asset</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>Price</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>1h %</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>24h %</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>Market Cap</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>Volume (24h)</th>
                                        <th style={{ ...customStyles.th, textAlign: 'right' }}>Last 7 Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCoins.map((coin) => (
                                        <CoinRow
                                            key={coin.id}
                                            coin={coin}
                                            watched={watchedCoins[coin.id]}
                                            onToggleWatch={handleToggleWatch}
                                            hovered={hoveredRow === coin.id}
                                            onMouseEnter={() => setHoveredRow(coin.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;