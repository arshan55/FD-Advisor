import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import { formatIndianNumber, generateWhatsAppLink } from '../utils/formatters';
import api from '../utils/api';
import { Share2, Info, TrendingUp, Calculator as CalcIcon, Award } from 'lucide-react';

export default function CalculatorScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isLight } = useTheme();
  const [principal, setPrincipal] = useState(10000);
  const [tenor, setTenor] = useState(12);
  const [rate, setRate] = useState(7.5);
  const [isSenior, setIsSenior] = useState(user?.age >= 60 || false);
  const [fdType, setFdType] = useState('cumulative');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/fd/calculate', {
        principal,
        tenor,
        rate,
        type: fdType,
        isSenior
      });
      setResult(response.data);
    } catch (err) {
      // Fallback to local calculation
      const adjustedRate = isSenior ? rate + 0.5 : rate;
      let maturityAmount, interestEarned, monthlyPayout;

      if (fdType === 'cumulative') {
        maturityAmount = principal + (principal * adjustedRate * tenor) / (100 * 12);
        interestEarned = maturityAmount - principal;
        monthlyPayout = 0;
      } else {
        interestEarned = (principal * adjustedRate * tenor) / (100 * 12);
        maturityAmount = principal;
        monthlyPayout = interestEarned / tenor;
      }

      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + tenor);

      setResult({
        principal,
        tenor_months: tenor,
        interest_rate: adjustedRate,
        fd_type: fdType,
        maturity_amount: Math.round(maturityAmount),
        interest_earned: Math.round(interestEarned),
        monthly_payout: Math.round(monthlyPayout),
        maturity_date: maturityDate.toISOString(),
        is_senior_citizen: isSenior
      });
    } finally {
      setLoading(false);
    }
  };

  const shareOnWhatsApp = () => {
    if (!result) return;
    const msg = `FD Calculator Results:\n\nAmount: ${formatIndianNumber(result.principal)}\nTenor: ${result.tenor_months} months\nRate: ${result.interest_rate}%\nMaturity: ${formatIndianNumber(result.maturity_amount)}\nInterest: ${formatIndianNumber(result.interest_earned)}\n\nShared from FD Mitra App`;
    window.open(generateWhatsAppLink(msg), '_blank');
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];
  const tenorOptions = [
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '1 year' },
    { value: 24, label: '2 years' },
    { value: 36, label: '3 years' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {/* Input Container */}
        <div className={`rounded-xl border p-3 space-y-4 `}>
          
          {/* Principal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-sm font-semibold text-[var(--text-muted)]`}>Amount to Invest</label>
              <span className="text-[var(--accent-green)] font-bold text-xl">{formatIndianNumber(principal)}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {presetAmounts.map(amt => (
                <button
                  key={amt} onClick={() => setPrincipal(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    principal === amt 
                      ? 'bg-[var(--modal-bg)]0 text-[var(--text-main)] shadow-sm' 
                      : ''
                  }`}
                >
                  {formatIndianNumber(amt)}
                </button>
              ))}
            </div>
            <input
              type="range" min={1000} max={1000000} step={1000} value={principal}
              onChange={(e) => setPrincipal(parseInt(e.target.value))}
              className={`w-full h-1.5 rounded-full appearance-none accent-orange-500 `}
            />
          </div>

          {/* Tenor & Rate Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-sm font-semibold text-[var(--text-muted)]`}>Period</label>
                <span className={`font-bold text-base text-[var(--text-main)]`}>{tenor} months</span>
              </div>
              <select 
                value={tenor} onChange={(e) => setTenor(parseInt(e.target.value))}
                className={`w-full p-2.5 rounded-lg text-base font-semibold outline-none border transition-all text-slate-800 bg-slate-100 `}
              >
                {tenorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-sm font-semibold text-[var(--text-muted)]`}>Interest</label>
                <span className={`font-bold text-base text-[var(--accent-green)]`}>{rate}% p.a.</span>
              </div>
              <input
                type="range" min={4} max={12} step={0.1} value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className={`w-full mt-2 h-2 rounded-full appearance-none accent-green-500 bg-slate-200`}
              />
            </div>
          </div>

          <hr className={''} />

          {/* Bottom Options Row */}
          <div className="flex items-center justify-between gap-3">
            {/* FD Type */}
            <div className={`flex flex-1 p-1 rounded-lg border bg-[var(--modal-bg)]`}>
              <button
                onClick={() => setFdType('cumulative')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  fdType === 'cumulative' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] shadow-sm' : 'text-slate-500'
                }`}
              >On Maturity</button>
              <button
                onClick={() => setFdType('non-cumulative')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  fdType === 'non-cumulative' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] shadow-sm' : 'text-slate-500'
                }`}
              >Monthly</button>
            </div>

            {/* Senior toggle inline */}
            <button
              onClick={() => setIsSenior(!isSenior)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                isSenior 
                  ? 'bg-[var(--accent-green)]/10 border-[var(--accent-green)]/30 text-[var(--accent-green)]' 
                  : 'bg-[var(--modal-bg)] border-transparent text-slate-500'
              }`}
            >
              <Award size={16} className={isSenior ? 'text-[var(--accent-green)]' : 'opacity-50'} />
              <span className="text-xs font-bold leading-none select-none">Senior</span>
            </button>
          </div>


          <button
            onClick={calculate} disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] hover:from-orange-600 hover:to-orange-500 rounded-xl text-[var(--text-main)] font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CalcIcon size={16} />Calculate Returns</>}
          </button>

          {/* Results */}
          {result && (
            <div className={`mt-2 p-4 rounded-xl border border-slate-200 bg-[var(--modal-bg)] space-y-4 fade-in `}>
              
              <div className="text-center">
                <p className={`text-sm mb-1 text-[var(--text-muted)]`}>{t('maturityAmount', language)}</p>
                <p className="text-[var(--accent-green)] text-4xl font-bold">{formatIndianNumber(result.maturity_amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border border-slate-200 bg-white`}>
                  <p className={`text-xs mb-1 text-[var(--text-muted)]`}>{t('interestEarned', language)}</p>
                  <p className="text-green-600 font-bold text-lg">{formatIndianNumber(result.interest_earned)}</p>
                </div>
                <div className={`p-3 rounded-xl border border-slate-200 bg-white`}>
                  <p className={`text-xs mb-1 text-[var(--text-muted)]`}>{t('monthlyPayout', language)}</p>
                  <p className={`font-bold text-lg text-[var(--text-main)]`}>
                    {result.monthly_payout > 0 ? formatIndianNumber(result.monthly_payout) : '-'}
                  </p>
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between text-xs mb-2">
                  <span className={'text-[var(--text-muted)] font-medium'}>Principal {formatIndianNumber(result.principal)}</span>
                  <span className="text-green-600 font-medium">Interest {formatIndianNumber(result.interest_earned)}</span>
                </div>
                <div className={`h-2.5 rounded-full overflow-hidden bg-slate-200`}>
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 progress-animate"
                    style={{ width: `${(result.principal / result.maturity_amount) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={shareOnWhatsApp}
                className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  ''
                }`}
              >
                <Share2 size={14} />Share Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
