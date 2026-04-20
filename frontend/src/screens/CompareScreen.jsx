import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import { formatIndianNumber } from '../utils/formatters';
import api from '../utils/api';
import { Shield, Info, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BankSafetySheet from '../components/BankSafetySheet';

/* ── Compact expandable bank row ── */
function BankRow({ bank, rate, maturity, interest, isTopRate, isSenior, onBook, onSafety, safetyLabel, formatIndianNumber }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-xl overflow-hidden border transition-all ${
      isTopRate ? 'border-orange-400 shadow-sm' : 'border-slate-200'
    } bg-transparent hover:shadow-md`}>
      {/* Main compact row */}
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--text-main)] font-bold text-sm">{bank.bank_name.charAt(0)}</span>
        </div>
        {/* Name + rate */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-[var(--text-main)] truncate">{bank.bank_name}</span>
            {isTopRate && <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0">★ Best</span>}
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-[var(--accent-green)] font-bold text-base">{rate}%</span>
            {bank.is_dicgc_insured
              ? <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Shield size={12} />DICGC</span>
              : <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full"><Info size={12} />NBFC</span>
            }
          </div>
        </div>
        {/* You get + book */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">You get</p>
            <p className="font-bold text-base text-[var(--text-main)]">{formatIndianNumber(maturity)}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBook(); }}
            className="px-3 py-2 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] text-white text-sm font-bold rounded-lg transition-all press-effect hover:opacity-90 shadow-sm"
          >Book</button>
          {expanded ? <ChevronUp size={18} className="text-[var(--text-muted)] mt-0.5" /> : <ChevronDown size={18} className="text-[var(--text-muted)] mt-0.5" />}
        </div>
      </div>
      {/* Expandable detail strip */}
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-[var(--modal-bg)] flex items-center gap-4 flex-wrap text-sm">
          <span className="text-[var(--text-muted)]">Min: <strong className="text-[var(--text-main)]">{formatIndianNumber(bank.min_amount)}</strong></span>
          <span className="text-[var(--text-muted)]">Interest: <strong className="text-green-600">+{formatIndianNumber(interest)}</strong></span>
          {isSenior && bank.senior_citizen_rate > bank.interest_rate && (
            <span className="text-green-600 font-medium">+{(bank.senior_citizen_rate - bank.interest_rate).toFixed(2)}% senior</span>
          )}
          <button onClick={onSafety} className="ml-auto text-blue-500 font-medium underline underline-offset-2 hover:opacity-80">{safetyLabel}</button>
        </div>
      )}
    </div>
  );
}

export default function CompareScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isLight } = useTheme();
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenor, setTenor] = useState(12);
  const [amount, setAmount] = useState(10000);
  const [isSenior, setIsSenior] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showSafetySheet, setShowSafetySheet] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (banks.length > 0) {
      filterBanks();
    }
  }, [tenor, amount, isSenior, banks]);

  const fetchRates = async () => {
    try {
      const response = await api.get('/api/fd/rates');
      setBanks(response.data);
      setFilteredBanks(response.data);
    } catch (err) {
      console.error('Failed to fetch rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBanks = () => {
    let filtered = banks.filter(bank => bank.min_amount <= amount && bank.max_amount >= amount);

    // Sort by highest rate for senior/non-senior
    filtered = filtered.sort((a, b) => {
      const rateA = isSenior ? a.senior_citizen_rate : a.interest_rate;
      const rateB = isSenior ? b.senior_citizen_rate : b.interest_rate;
      return rateB - rateA;
    });

    setFilteredBanks(filtered);
  };

  const calculateInterest = (bank) => {
    const rate = isSenior ? bank.senior_citizen_rate : bank.interest_rate;
    return (amount * rate * tenor) / (100 * 12);
  };

  const getMaturityAmount = (bank) => {
    return amount + calculateInterest(bank);
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Filters Panel */}
      <div className={`px-3 py-2 space-y-2 border-b flex-shrink-0 `}>
        
        {/* Row 1: Amount & Slider */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold text-[var(--text-muted)] `}>Investment Amount</span>
              <span className="text-base font-bold text-[var(--accent-green)]">{formatIndianNumber(amount)}</span>
            </div>
            <input
              type="range" min={1000} max={100000} step={1000} value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--accent-blue)] bg-slate-200 mt-1`}
            />
          </div>
        </div>

        {/* Row 2: Tenor & Senior */}
        <div className="flex items-center justify-between gap-3">
          {/* Tenor Pills */}
          <div className="flex items-center gap-2 mt-1">
            {[3, 6, 12, 24, 36].map(t => (
              <button
                key={t} onClick={() => setTenor(t)}
                className={`w-10 h-8 rounded-lg text-xs font-bold transition-all border ${
                  tenor === t
                    ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/30 text-[var(--accent-blue)] shadow-sm'
                    : 'bg-[var(--modal-bg)] border-transparent text-slate-500 hover:bg-[var(--modal-bg)] shadow-sm'
                }`}
              >
                {t < 12 ? `${t}M` : `${t / 12}Y`}
              </button>
            ))}
          </div>

          {/* Compact Senior Toggle */}
          <button
            onClick={() => setIsSenior(!isSenior)}
            className={`flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg transition-all border shadow-sm ${
              isSenior 
                ? 'bg-[var(--accent-green)]/10 border-[var(--accent-green)]/30 text-[var(--accent-green)]' 
                : 'bg-[var(--modal-bg)] border-transparent text-slate-500'
            }`}
          >
            <Award size={14} className={isSenior ? 'text-[var(--accent-green)]' : 'opacity-50'} />
            <span className="text-xs font-semibold">Senior (+0.5%)</span>
            <div className={`w-7 h-4 rounded-full relative ml-1 transition-all ${isSenior ? 'bg-[var(--accent-green)]' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isSenior ? 'left-3.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Bank List — compact rows */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className="text-[var(--text-muted)] text-sm">Loading best rates...</p>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">😕</p>
            <p className="text-[var(--text-main)] dark:text-[var(--text-main)] font-medium">No banks match your criteria</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">Try adjusting the amount</p>
          </div>
        ) : (
          filteredBanks.map((bank, index) => {
            const maturity = getMaturityAmount(bank);
            const interest = calculateInterest(bank);
            const rate = isSenior ? bank.senior_citizen_rate : bank.interest_rate;
            const isTopRate = index === 0;

            return (
              <BankRow
                key={bank.id}
                bank={bank} rate={rate} maturity={maturity} interest={interest}
                isTopRate={isTopRate} isSenior={isSenior}
                onBook={() => navigate('/booking', { state: { bank, amount, tenor, isSenior } })}
                onSafety={() => { setSelectedBank(bank); setShowSafetySheet(true); }}
                safetyLabel={t('yehBankSafeHai', language)}
                formatIndianNumber={formatIndianNumber}
                isLight={isLight}
              />
            );
          })
        )}
      </div>

      {showSafetySheet && selectedBank && (
        <BankSafetySheet
          bank={selectedBank}
          language={language}
          onClose={() => setShowSafetySheet(false)}
        />
      )}
    </div>
  );
}
