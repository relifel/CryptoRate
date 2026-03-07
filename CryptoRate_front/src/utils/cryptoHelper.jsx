import React from 'react';

// 加密货币配置
export const cryptoConfig = {
    BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        basePrice: 45000,
        color: '#FFD700',
        icon: '₿',
        volume24h: '28.5B'
    },
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        basePrice: 2800,
        color: '#627EEA',
        icon: 'Ξ',
        volume24h: '15.2B'
    },
    BNB: {
        name: 'Binance Coin',
        symbol: 'BNB',
        basePrice: 320,
        color: '#F3BA2F',
        icon: 'Ⓑ',
        volume24h: '2.8B'
    }
};

// 获取币种显示配置（未配置的币种使用默认值）
export const getCryptoDisplay = (symbol) => {
    return cryptoConfig[symbol] || {
        name: symbol,
        symbol,
        basePrice: 0,
        color: '#6b7280',
        icon: '◆',
        volume24h: '-'
    };
};

// 生成蜡烛图数据（K线图）
export const generateCandlestickData = (basePrice) => {
    const data = [];
    let currentPrice = basePrice;

    for (let i = 0; i < 50; i++) {
        const open = currentPrice;
        const volatility = basePrice * 0.02;
        const change = (Math.random() - 0.5) * volatility;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        const volume = Math.random() * 1000 + 500;

        data.push({
            time: i,
            open,
            high,
            low,
            close,
            volume,
            isUp: close >= open
        });

        currentPrice = close;
    }
    return data;
};

// 自定义蜡烛图形状
export const Candlestick = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const { open, high, low, close, isUp } = payload;
    const color = isUp ? '#10B981' : '#EF4444';
    const wickX = x + width / 2;

    // 计算y坐标
    const yHigh = y;
    const yLow = y + height;
    const yOpen = y + (high - open) / (high - low) * height;
    const yClose = y + (high - close) / (high - low) * height;

    return (
        <g>
            {/* 上下影线 */}
            <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth={1} />
            {/* 实体 */}
            <rect
                x={x}
                y={Math.min(yOpen, yClose)}
                width={width}
                height={Math.abs(yClose - yOpen) || 1}
                fill={color}
                opacity={0.9}
            />
        </g>
    );
};
