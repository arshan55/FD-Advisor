import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import { formatIndianNumber, getDaysRemaining, getMaturityTimeline } from '../utils/formatters';
import api from '../utils/api';
import { Download, Share2, Loader2, Wallet, TrendingUp, Clock } from 'lucide-react';

export default function MyFdsScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isLight } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/api/booking/${user.id}`);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReceipt = async (bookingId) => {
    try {
      const response = await api.get(`/api/booking/${bookingId}/receipt`);
      return response.data;
    } catch (err) {
      console.error('Failed to get receipt:', err);
      return null;
    }
  };

  const handleDownloadReceipt = (booking) => {
    const receiptContent = `
=========================================
            FD MITRA RECEIPT
=========================================
Booking ID    : ${booking.id}
Date          : ${new Date(booking.created_at).toLocaleString('hi-IN')}
Status        : ${booking.status.toUpperCase()}
=========================================
Bank          : ${booking.bank_name}
Principal     : Rs. ${booking.principal_amount}
Interest Rate : ${booking.interest_rate}% p.a.
Maturity Date : ${new Date(booking.maturity_date).toLocaleDateString('hi-IN')}
Maturity Amt. : Rs. ${booking.maturity_amount}
=========================================
Nominee       : ${booking.nominee_name || 'N/A'}
=========================================
Thank you for using FD Mitra!
    `;
    const blob = new Blob([receiptContent.trim()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`FD_Mitra_Receipt_\${booking.id.substring(0, 8)}.txt\`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const shareOnWhatsApp = (booking) => {
    const msg = `FD Details:\n\nBank: ${booking.bank_name}\nAmount: ${formatIndianNumber(booking.principal_amount)}\nMaturity: ${formatIndianNumber(booking.maturity_amount)}\nDate: ${new Date(booking.maturity_date).toLocaleDateString('hi-IN')}\n\nShared from FD Mitra App`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-[var(--text-muted)] border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getTotalValue = () => {
    return bookings.reduce((sum, b) => sum + (b.maturity_amount || 0), 0);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className={''}>Loading your FDs...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 fade-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 `}>
              <Wallet size={32} />
            </div>
            <h3 className={`text-lg font-bold mb-1 `}>No FDs Yet</h3>
            <p className={`text-xs text-center mb-6 max-w-xs `}>
              Aapne abhi tak koi FD book nahi kiya hai. Start investing now!
            </p>
            <button
              onClick={() => navigate('/compare')}
              className="px-6 py-2.5 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] hover:from-orange-600 hover:to-orange-500 text-[var(--text-main)] shadow-sm font-bold rounded-xl transition-all press-effect"
            >
              Book Your First FD
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Portfolio Summary */}
            <div className={`border rounded-2xl p-4 mb-2 flex items-center justify-between ${
              ''
            }`}>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={16} className="text-[var(--accent-green)]" />
                  <span className={`text-xs font-bold uppercase text-[var(--text-muted)]`}>Total Portfolio</span>
                </div>
                <p className={`text-2xl font-bold `}>{formatIndianNumber(getTotalValue())}</p>
              </div>
              <div className="text-right">
                <p className="text-[var(--accent-green)] font-bold text-lg">{bookings.length}</p>
                <p className={`text-xs font-medium text-[var(--text-muted)]`}>Active FD{bookings.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* FD Cards */}
            {bookings.map((booking, index) => {
              const daysRemaining = getDaysRemaining(booking.maturity_date);
              const timeline = getMaturityTimeline(booking.maturity_date, booking.created_at);

              return (
                <div
                  key={booking.id}
                  className={`rounded-xl border p-4 fade-in transition-all ${
                    ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--bg-color)] font-bold text-base">{booking.bank_name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className={`font-bold text-base leading-tight `}>{booking.bank_name}</h3>
                        <p className="text-[var(--accent-green)] font-bold">{formatIndianNumber(booking.maturity_amount)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-px mb-3 rounded-lg overflow-hidden border bg-[var(--modal-bg)]`}>
                    <div className={`p-3 `}>
                      <p className={`text-xs mb-0.5 text-[var(--text-muted)]`}>Principal</p>
                      <p className={`font-bold text-base text-[var(--text-main)]`}>{formatIndianNumber(booking.principal_amount)}</p>
                    </div>
                    <div className={`p-3 `}>
                      <p className={`text-xs mb-0.5 text-[var(--text-muted)]`}>Interest Rate</p>
                      <p className={`font-bold text-base text-[var(--text-main)]`}>{booking.interest_rate}% p.a.</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className={'text-[var(--text-muted)] font-medium'}>
                        {new Date(booking.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`font-semibold bg-white/10 px-2 flex py-0.5 rounded text-xs text-[var(--text-main)]`}>
                        {daysRemaining} days left
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden bg-white/10`}>
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-full transition-all"
                        style={{ width: `${timeline.percentComplete}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 text-center text-[var(--text-muted)] font-medium`}>
                      Matures on <strong className={'text-[var(--text-main)] font-bold'}>{new Date(booking.maturity_date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareOnWhatsApp(booking)}
                      className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all border ${
                        ''
                      }`}
                    >
                      <Share2 size={12} /> Share
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(booking)}
                      className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all border ${
                        ''
                      }`}
                    >
                      <Download size={12} /> {t('downloadReceipt', language)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
