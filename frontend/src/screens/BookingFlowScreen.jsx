import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translations';
import { formatIndianNumber, validatePhone } from '../utils/formatters';
import api from '../utils/api';
import { ArrowLeft, Check, Shield, Loader2, TrendingUp, Calendar, Wallet, FileText, UserCheck, Award } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const STEPS = ['amount', 'tenor', 'payout', 'bank', 'summary', 'kyc', 'confirm'];

export default function BookingFlowScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);

  const [amount, setAmount] = useState(location.state?.amount || 10000);
  const [tenor, setTenor] = useState(location.state?.tenor || 12);
  const [payoutType, setPayoutType] = useState('cumulative');
  const [selectedBank, setSelectedBank] = useState(location.state?.bank || null);
  const [isSenior] = useState(location.state?.isSenior || user?.age >= 60);

  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [nomineeName, setNomineeName] = useState('');

  const [calculation, setCalculation] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (selectedBank && amount && tenor) {
      calculateMaturity();
    }
  }, [selectedBank, amount, tenor, payoutType, isSenior]);

  const fetchBanks = async () => {
    try {
      const response = await api.get('/api/fd/rates');
      setBanks(response.data);
    } catch (err) {
      console.error('Failed to fetch banks:', err);
    }
  };

  const calculateMaturity = async () => {
    if (!selectedBank) return;
    try {
      const rate = isSenior ? selectedBank.senior_citizen_rate : selectedBank.interest_rate;
      const response = await api.post('/api/fd/calculate', {
        principal: amount,
        tenor,
        rate,
        type: payoutType,
        isSenior
      });
      setCalculation(response.data);
    } catch (err) {
      const rate = isSenior ? selectedBank.senior_citizen_rate + 0.5 : selectedBank.interest_rate;
      const interest = (amount * rate * tenor) / (100 * 12);
      const maturity = payoutType === 'cumulative' ? amount + interest : amount;
      setCalculation({
        principal: amount,
        tenor_months: tenor,
        interest_rate: rate,
        maturity_amount: Math.round(maturity),
        interest_earned: Math.round(interest),
        monthly_payout: payoutType === 'non-cumulative' ? Math.round(interest / tenor) : 0
      });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/booking/create', {
        bank_id: selectedBank.id,
        principal_amount: amount,
        tenor_months: tenor,
        interest_rate: calculation.interest_rate,
        fd_type: payoutType,
        nominee_name: nomineeName
      });
      setBooking(response.data);

      if (aadhaar && pan) {
        await api.post('/api/kyc/submit', {
          aadhaar,
          pan,
          nominee_name: nomineeName
        });
      }

      await api.patch(`/api/booking/${response.data.id}/status`, {
        status: 'confirmed'
      });

      setCurrentStep(STEPS.length - 1);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    const titles = {
      amount: t('selectAmount', language),
      tenor: t('selectTenor', language),
      payout: t('payoutPreference', language),
      bank: t('selectBank', language),
      summary: 'Summary',
      kyc: t('kycRequired', language),
      confirm: 'Booking Confirmed!'
    };
    return titles[STEPS[currentStep]];
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];
  const tenorOptions = [
    { value: 3, label: '3 महीने' },
    { value: 6, label: '6 महीने' },
    { value: 12, label: '1 साल' },
    { value: 24, label: '2 साल' },
    { value: 36, label: '3 साल' }
  ];

  const stepIcons = {
    amount: Wallet,
    tenor: Calendar,
    payout: TrendingUp,
    bank: Shield,
    summary: FileText,
    kyc: UserCheck,
    confirm: Award
  };

  return (
    <div className="h-full flex flex-col bg-cream dark:bg-dark-navy overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-navy border-b border-white/10 px-4 py-3 safe-top flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-black/10 dark:hover:bg-transparent/10 rounded-xl transition-all press-effect"
            >
              <ArrowLeft className="text-text-primary dark:text-text-primary-dark" size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-saffron/20 rounded-xl flex items-center justify-center">
                {(() => {
                  const StepIcon = stepIcons[STEPS[currentStep]];
                  return <StepIcon size={20} className="text-saffron" />;
                })()}
              </div>
              <div>
                <h1 className="text-text-primary dark:text-text-primary-dark font-bold text-lg">{getStepTitle()}</h1>
                <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-xs">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i <= currentStep
                  ? 'bg-gradient-to-r from-saffron to-saffron-light'
                  : 'bg-gray-200 dark:bg-transparent/10'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Amount */}
        {STEPS[currentStep] === 'amount' && (
          <div className="space-y-6 fade-in">
            <p className="text-[var(--text-muted)] text-center text-lg">
              Kitna paisa aap FD mein rakhna chahte hain?
            </p>
            <div className="text-center">
              <p className="text-5xl font-bold bg-gradient-to-r from-saffron to-saffron-light bg-clip-text text-transparent">
                {formatIndianNumber(amount)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-5 rounded-2xl text-lg font-medium transition-all press-effect ${
                    amount === amt
                      ? 'bg-gradient-to-r from-saffron to-saffron-light text-[var(--text-main)] shadow-lg glow-saffron'
                      : 'bg-transparent/5 text-[var(--text-muted)] hover:bg-transparent/10 hover:text-[var(--text-main)] border border-white/10'
                  }`}
                >
                  {formatIndianNumber(amt)}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={1000}
              max={1000000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className="w-full accent-saffron h-2 bg-transparent/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Step 2: Tenor */}
        {STEPS[currentStep] === 'tenor' && (
          <div className="space-y-4 fade-in">
            <p className="text-[var(--text-muted)] text-center text-lg mb-6">
              Kitni der ke liye?
            </p>
            <div className="space-y-3">
              {tenorOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTenor(opt.value)}
                  className={`w-full py-5 rounded-2xl text-lg font-medium transition-all press-effect text-left px-6 ${
                    tenor === opt.value
                      ? 'bg-gradient-to-r from-saffron to-saffron-light text-[var(--text-main)] shadow-lg'
                      : 'bg-transparent/5 text-[var(--text-muted)] hover:bg-transparent/10 hover:text-[var(--text-main)] border border-white/10'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {tenor === opt.value && <Check size={20} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Payout */}
        {STEPS[currentStep] === 'payout' && (
          <div className="space-y-4 fade-in">
            <p className="text-[var(--text-muted)] text-center text-lg mb-6">
              Aapko paisa kab chahiye?
            </p>
            <button
              onClick={() => setPayoutType('cumulative')}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all press-effect ${
                payoutType === 'cumulative'
                  ? 'border-saffron bg-saffron/10 shadow-lg'
                  : 'border-white/20 bg-transparent/5 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  payoutType === 'cumulative' ? 'bg-saffron text-[var(--text-main)]' : 'bg-transparent/10 text-[var(--text-muted)]'
                }`}>
                  <TrendingUp size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[var(--text-main)] font-semibold text-lg">{t('zyadaPaisa', language)}</p>
                  <p className="text-[var(--text-muted)] text-sm">Compound interest - grow faster</p>
                </div>
              </div>
              <p className="text-[var(--text-muted)] text-sm pl-16">
                Interest principal mein add hoga. End mein zyada paisa milega.
              </p>
            </button>
            <button
              onClick={() => setPayoutType('non-cumulative')}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all press-effect ${
                payoutType === 'non-cumulative'
                  ? 'border-saffron bg-saffron/10 shadow-lg'
                  : 'border-white/20 bg-transparent/5 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  payoutType === 'non-cumulative' ? 'bg-saffron text-[var(--text-main)]' : 'bg-transparent/10 text-[var(--text-muted)]'
                }`}>
                  <Wallet size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[var(--text-main)] font-semibold text-lg">{t('monthlyPaisa', language)}</p>
                  <p className="text-[var(--text-muted)] text-sm">Regular income stream</p>
                </div>
              </div>
              <p className="text-[var(--text-muted)] text-sm pl-16">
                Har mahine interest milega. Principal end mein wapas aayega.
              </p>
            </button>
          </div>
        )}

        {/* Step 4: Bank */}
        {STEPS[currentStep] === 'bank' && (
          <div className="space-y-4 fade-in">
            <p className="text-[var(--text-muted)] text-center text-lg mb-4">
              Kaunsa bank choose karein?
            </p>
            {banks.slice(0, 6).map(bank => {
              const rate = isSenior ? bank.senior_citizen_rate : bank.interest_rate;
              return (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all press-effect ${
                    selectedBank?.id === bank.id
                      ? 'border-saffron bg-saffron/10 shadow-lg'
                      : 'border-white/20 bg-transparent/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-transparent/10 rounded-xl flex items-center justify-center">
                        <span className="text-saffron font-bold text-lg">
                          {bank.bank_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[var(--text-main)] font-semibold">{bank.bank_name}</p>
                        {bank.is_dicgc_insured && (
                          <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                            <Shield size={10} /> DICGC Insured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-saffron text-2xl font-bold">{rate}%</p>
                      {isSenior && (
                        <p className="text-green-400 text-xs">+0.5% Senior</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 5: Summary */}
        {STEPS[currentStep] === 'summary' && calculation && (
          <div className="space-y-6 fade-in">
            <div className="glass-card rounded-3xl p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Shield size={16} />
                    Bank
                  </span>
                  <span className="text-[var(--text-main)] font-medium">{selectedBank?.bank_name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Wallet size={16} />
                    Amount
                  </span>
                  <span className="text-[var(--text-main)] font-medium">{formatIndianNumber(amount)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Calendar size={16} />
                    Tenor
                  </span>
                  <span className="text-[var(--text-main)] font-medium">{tenor} months</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <TrendingUp size={16} />
                    Rate
                  </span>
                  <span className="text-saffron font-bold">{calculation.interest_rate}%</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Maturity Amount</span>
                  <span className="text-saffron text-3xl font-bold">
                    {formatIndianNumber(calculation.maturity_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: KYC */}
        {STEPS[currentStep] === 'kyc' && (
          <div className="space-y-6 fade-in">
            <div className="bg-gradient-to-br from-saffron/10 to-saffron/5 border border-saffron/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={20} className="text-saffron" />
                <p className="text-[var(--text-main)] font-semibold">Secure KYC Verification</p>
              </div>
              <p className="text-sm text-gray-300">
                KYC verification ke liye yeh details zaroori hain. Aapka data secure hai.
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <label className="text-[var(--text-muted)] text-sm mb-3 block">
                  Aadhaar (last 4 digits)
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(-4))}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full bg-transparent/10 rounded-xl px-4 py-4 text-[var(--text-main)] text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-[var(--text-muted)] text-sm mb-3 block">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCTY1234X"
                  maxLength={10}
                  className="w-full bg-transparent/10 rounded-xl px-4 py-4 text-[var(--text-main)] text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron transition-all uppercase"
                />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-[var(--text-muted)] text-sm mb-3 block">
                  Nominee Name (optional)
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="Family member name"
                  className="w-full bg-transparent/10 rounded-xl px-4 py-4 text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-saffron transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Confirm */}
        {STEPS[currentStep] === 'confirm' && (
          <div className="text-center py-8 fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl">
              <Check className="text-[var(--text-main)]" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-main)] mb-3">Booking Confirmed!</h2>
            <p className="text-[var(--text-muted)] mb-8 text-lg">
              Aapki FD booking successfully ho gayi hai.
            </p>
            {booking && (
              <div className="glass-card rounded-2xl p-6 text-left max-w-sm mx-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-[var(--text-muted)] text-sm mb-1">Booking ID</p>
                    <p className="text-[var(--text-main)] font-mono bg-transparent/10 rounded-lg px-3 py-2">
                      {booking.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm mb-1">Maturity Amount</p>
                    <p className="text-saffron text-2xl font-bold">
                      {formatIndianNumber(booking.maturity_amount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 glass-navy border-t border-white/10 px-4 py-4 safe-bottom flex-shrink-0">
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={
              loading ||
              (STEPS[currentStep] === 'bank' && !selectedBank) ||
              (STEPS[currentStep] === 'amount' && !amount)
            }
            className="w-full py-4 bg-gradient-to-r from-saffron to-saffron-light hover:shadow-xl hover:glow-saffron disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-[var(--text-main)] font-semibold transition-all press-effect flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {currentStep === 4 ? 'Confirm Booking' : t('next', language)}
          </button>
        ) : (
          <button
            onClick={() => navigate('/my-fds')}
            className="w-full py-4 bg-gradient-to-r from-saffron to-saffron-light hover:shadow-xl rounded-2xl text-[var(--text-main)] font-semibold transition-all press-effect"
          >
            View My FDs
          </button>
        )}
      </div>
    </div>
  );
}
