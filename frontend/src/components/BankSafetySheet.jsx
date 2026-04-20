import { Shield, Info, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatIndianNumber } from '../utils/formatters';

export default function BankSafetySheet({ bank, language, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-[#0A1628] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto bottom-sheet safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-transparent/20 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-[var(--text-main)] text-xl font-bold">{bank.bank_name}</h2>
            {bank.rbi_license_number && (
              <p className="text-[var(--text-muted)] text-sm mt-1 flex items-center gap-1">
                <Shield size={12} />
                RBI: {bank.rbi_license_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-transparent/10 rounded-full transition-all press-effect"
          >
            <X size={24} />
          </button>
        </div>

        {/* DICGC Section */}
        <div className="mb-6">
          <div className={`p-4 rounded-2xl ${
            bank.is_dicgc_insured
              ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30'
              : 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${
                bank.is_dicgc_insured ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {bank.is_dicgc_insured ? (
                  <CheckCircle size={24} className="text-green-400" />
                ) : (
                  <AlertTriangle size={24} className="text-yellow-400" />
                )}
              </div>
              <div>
                <span className={`font-semibold block ${
                  bank.is_dicgc_insured ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {bank.is_dicgc_insured ? 'DICGC Insured' : 'NBFC - Not DICGC Insured'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {bank.is_dicgc_insured ? 'Government backed safety' : 'Higher risk, higher returns'}
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {bank.is_dicgc_insured
                ? 'Agar yeh bank collapse bhi ho jaye, toh DICGC (Deposit Insurance and Credit Guarantee Corporation) aapko ₹5,00,000 tak ka paisa wapas dega. Yeh ek government guarantee hai!'
                : 'Is bank mein FD karne se pehle sochna chahiye. Yeh NBFC hai, matlab DICGC ki ₹5 lakh ki guarantee nahi milegi. Interest rate higher hai, lekin risk bhi zyada hai.'}
            </p>
          </div>
        </div>

        {/* Interest Rates */}
        <div className="mb-6">
          <h3 className="text-[var(--text-main)] font-semibold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-saffron rounded-full" />
            Interest Rates
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-[var(--text-muted)] text-xs mb-2">Regular Rate</p>
              <p className="text-[var(--text-main)] text-2xl font-bold">{bank.interest_rate}%</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-4">
              <p className="text-[var(--text-muted)] text-xs mb-2">Senior Citizen Rate</p>
              <p className="text-green-400 text-2xl font-bold">{bank.senior_citizen_rate}%</p>
              {bank.senior_citizen_rate > bank.interest_rate && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={10} />
                  +{(bank.senior_citizen_rate - bank.interest_rate).toFixed(2)}% extra
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FD Types */}
        <div className="mb-6">
          <h3 className="text-[var(--text-main)] font-semibold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-saffron rounded-full" />
            Available FD Types
          </h3>
          <div className="flex gap-3">
            {bank.cumulative_available && (
              <span className="px-4 py-2 bg-gradient-to-r from-saffron/20 to-saffron/10 border border-saffron/30 text-saffron rounded-xl text-sm font-medium">
                Cumulative
              </span>
            )}
            {bank.non_cumulative_available && (
              <span className="px-4 py-2 bg-transparent/10 border border-white/20 text-[var(--text-main)] rounded-xl text-sm font-medium">
                Non-Cumulative
              </span>
            )}
          </div>
        </div>

        {/* Amount Range */}
        <div className="mb-6">
          <h3 className="text-[var(--text-main)] font-semibold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-saffron rounded-full" />
            Investment Range
          </h3>
          <div className="glass-card rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[var(--text-muted)] text-xs mb-1">Minimum</p>
                <p className="text-[var(--text-main)] font-semibold">{formatIndianNumber(bank.min_amount)}</p>
              </div>
              <div className="h-8 w-px bg-transparent/10" />
              <div className="text-right">
                <p className="text-[var(--text-muted)] text-xs mb-1">Maximum</p>
                <p className="text-[var(--text-main)] font-semibold">{formatIndianNumber(bank.max_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-gradient-to-br from-saffron/10 to-saffron/5 border border-saffron/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-saffron" />
            <span className="text-[var(--text-main)] font-medium">Safety Tips</span>
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-saffron mt-1">•</span>
              HDFC, SBI jaise government-related banks mein FD sabse safe maani jaati hai
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron mt-1">•</span>
              Small Finance Banks higher rates dete hain, lekin thoda risk zyada hota hai
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron mt-1">•</span>
              NBFCs (jaise Bajaj Finance) DICGC insured nahi hain
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron mt-1">•</span>
              Always verify bank ka RBI license number check karein
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
