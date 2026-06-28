// Balance Component - Direct port from Balance.svelte
import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import CryptoImg from '../CryptoImg';
import { cryptos } from '../../data/cryptos';
import './Balance.css';

function Balance({ balance, onAddMoney }) {
    const { activeCurrency, t } = useWallet();
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0];
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const balanceFormatted = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const addMoneyAmounts = [100, 500, 1000];

    return (
        <div className="balance-container">
            <div className="balance-display">
                <span className="balance-symbol"><CryptoImg crypto={selectedCrypto} size={14} /></span>
                <span className="balance-value">$ {balanceFormatted}</span>
            </div>
            <div className="balance-popover-wrapper">
                <button
                    className="add-btn"
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                >
                    {t('game.add')}
                </button>
                {isPopoverOpen && (
                    <div className="add-money-popover">
                        <p className="add-money-title">{t('game.add_money')}</p>
                        <div className="add-money-buttons">
                            {addMoneyAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    className="add-money-btn"
                                    onClick={() => {
                                        onAddMoney(amount);
                                        setIsPopoverOpen(false);
                                    }}
                                >
                                    +<CryptoImg crypto={selectedCrypto} size={12} /> ${amount}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Balance;
