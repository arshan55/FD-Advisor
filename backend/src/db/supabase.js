import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

class MockDB {
  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.fdRates = new Map();
    this.bookings = new Map();
    this.jargonTerms = new Map();
    this.otps = new Map();
    this.initializeData();
  }

  initializeData() {
    // Seed FD rates for 6 banks
    const banks = [
      { id: '1', bank_name: 'Suryoday Small Finance Bank', bank_logo_url: '/banks/suryoday.png', min_amount: 1000, max_amount: 10000000, tenor_months: 12, interest_rate: 8.50, senior_citizen_rate: 8.75, is_dicgc_insured: true, rbi_license_number: 'RBI/BSF/2015/86', cumulative_available: true, non_cumulative_available: true },
      { id: '2', bank_name: 'AU Small Finance Bank', bank_logo_url: '/banks/au.png', min_amount: 1000, max_amount: 5000000, tenor_months: 12, interest_rate: 8.00, senior_citizen_rate: 8.50, is_dicgc_insured: true, rbi_license_number: 'RBI/ASF/2016/42', cumulative_available: true, non_cumulative_available: true },
      { id: '3', bank_name: 'Jana Small Finance Bank', bank_logo_url: '/banks/jana.png', min_amount: 1000, max_amount: 5000000, tenor_months: 12, interest_rate: 8.25, senior_citizen_rate: 8.75, is_dicgc_insured: true, rbi_license_number: 'RBI/JSF/2017/15', cumulative_available: true, non_cumulative_available: true },
      { id: '4', bank_name: 'SBI', bank_logo_url: '/banks/sbi.png', min_amount: 1000, max_amount: 10000000, tenor_months: 12, interest_rate: 6.80, senior_citizen_rate: 7.30, is_dicgc_insured: true, rbi_license_number: 'RBI/SBI/1955/01', cumulative_available: true, non_cumulative_available: true },
      { id: '5', bank_name: 'HDFC Bank', bank_logo_url: '/banks/hdfc.png', min_amount: 5000, max_amount: 10000000, tenor_months: 12, interest_rate: 7.00, senior_citizen_rate: 7.50, is_dicgc_insured: true, rbi_license_number: 'RBI/HDFC/1994/08', cumulative_available: true, non_cumulative_available: true },
      { id: '6', bank_name: 'Bajaj Finance FD', bank_logo_url: '/banks/bajaj.png', min_amount: 25000, max_amount: 5000000, tenor_months: 12, interest_rate: 8.10, senior_citizen_rate: 8.35, is_dicgc_insured: false, rbi_license_number: 'NBFC', cumulative_available: true, non_cumulative_available: true },
    ];
    banks.forEach(bank => this.fdRates.set(bank.id, bank));

    // Seed jargon terms
    const jargons = [
      { id: '1', term: 'Fixed Deposit', hindi_explanation: 'FD ek aisa investment hai jahan aap paisa ek baar rakhte ho aur ek fixed interest paate ho.', bhojpuri_explanation: 'FD ke kaam hai ki rakhwa paisa ek baar aur baad mein baap-daulat pao.', marathi_explanation: 'FD हा एक गुंतवणूक आहे ज्यामध्ये तुम्ही एकदा पैसे ठेवता आणि निश्चित व्याज मिळवता.', tamil_explanation: 'FD என்பது ஒரு முதலீடு ஆகும், அதில் நீங்கள் ஒரு முறை பணத்தை டெபாசிட் செய்கிறீர்கள்.', analogy: 'Jaise aap ghar lease pe dete ho, waise hi FD mein paisa "lease" karte ho bank ko.', numeric_example: 'Agar aap ₹1,00,000 FD mein rakho 1 saal ke liye 7% rate pe, toh saal ke end mein ₹7,000 ka fayda hoga.' },
      { id: '2', term: 'Maturity Amount', hindi_explanation: 'Maturity amount woh total paisa hai jo aapko FD ke end mein milega - original paisa + saara interest.', bhojpuri_explanation: 'Maturity amount माने जवानी में कुल पैसा - अपनी रकम + सब ब्याज।', marathi_explanation: 'Maturity amount म्हणजे एकूण रक्कम - मूळ रक्कम + व्याज.', tamil_explanation: 'Maturity amount என்பது மொத்தத் தொகை - அசல் + வட்டி.', analogy: 'Jaise cake banate waqt aapne ₹500 lagaye aur cake ₹700 ka ho gaya, toh ₹200 ka extra cake ka fayda hai.', numeric_example: '₹1,00,000 + ₹7,000 interest = ₹1,07,000 maturity amount' },
      { id: '3', term: 'Cumulative FD', hindi_explanation: 'Cumulative FD mein interest har saal principal mein add hota hai. Aapko har mahine yaar nahi milta, end mein ek saath milta hai.', bhojpuri_explanation: 'Cumulative FD में ब्याज हर साल अकल कय हो जाला, महीने में नइक।', marathi_explanation: 'Cumulative FD मध्ये व्याज दरवर्षी मूळ रकमेत जोडले जाते.', tamil_explanation: 'Cumulative FD ல் வட்டி ஒவ்வொரு ஆண்டும் அசலுடன் சேர்க்கப்படும்.', analogy: 'Jaise SIP mein compounding hota hai, waise hi Cumulative FD mein bhi interest pe interest milta hai.', numeric_example: '₹1,00,000 @ 7% for 2 years: Year 1: ₹1,07,000, Year 2: ₹1,07,000 + 7% = ₹1,14,490' },
      { id: '4', term: 'Non-Cumulative FD', hindi_explanation: 'Non-Cumulative FD mein interest aapko har mahine, quarter ya half-yearly milta hai. Principal same rehta hai.', bhojpuri_explanation: 'Non-Cumulative FD में ब्याज हर महीने मिलत।', marathi_explanation: 'Non-Cumulative FD मध्ये व्याज तुम्हाला टप्प्याटप्प्याने मिळतो.', tamil_explanation: 'Non-Cumulative FD ல் வட்டி தவணைக்கு தவணை கிடைக்கும்.', analogy: 'Jaise monthly rent se aapko har mahine income milti hai, waise hi Non-Cumulative se monthly payout milta hai.', numeric_example: '₹1,00,000 @ 7% yearly payout: Har saal ₹7,000 ki payout' },
      { id: '5', term: 'DICGC Insurance', hindi_explanation: 'DICGC ek government body hai jo aapके FD की ₹5 lakh tak ki safety guarantee karti hai.', bhojpuri_explanation: 'DICGC माने सरकार के कहलावल बैंक जवानी ₹5 lakh ले के सुरक्षित राखला।', marathi_explanation: 'DICGC म्हणजे सरकारी विमा कंपनी जी ₹5 लाख पर्यंत FD ची सुरक्षा करते.', tamil_explanation: 'DICGC என்பது அரசு காப்பீட்டு நிறுவனம், ₹5 லட்சம் வரை FD பாதுகாப்பை உறுதி செய்கிறது.', analogy: 'Jaise car ki insurance mein agar accident ho toh company compensate karti hai, waise DICGC FD ke saath hai.', numeric_example: 'Agar bank collapse bhi ho jaye, toh DICGC aapko ₹5,00,000 tak will return karenge' },
      { id: '6', term: 'Senior Citizen Rate', hindi_explanation: 'Senior citizens (60+ years) ko bank extra 0.5% interest dete hain FD pe.', bhojpuri_explanation: 'Senior citizens (60+) के ब्याज में 0.5% ज्यादा मिलत।', marathi_explanation: 'वयस्कर (60+) लोकांना बँका अतिरिक्त 0.5% व्याज देतात.', tamil_explanation: 'மூத்த குடிமக்கள் (60+) க்கு 0.5% கூடுதல் வட்டி கிடைக்கும்.', analogy: 'Jaise senior citizen railway discount mein concessional fare dete hain, waise hi FD mein extra rate milta hai.', numeric_example: 'Regular rate 7%, Senior rate 7.5%. ₹1,00,000 pe senior citizen ₹500 extra kamaega' },
      { id: '7', term: 'Tenor', hindi_explanation: 'FD ki tenor matlab kitni der ke liye aap paisa rakhte ho - 3 mahine se 10 saal tak.', bhojpuri_explanation: 'FD अवधि माने कितने समय ले के राखला - 3 महीना से 10 साल।', marathi_explanation: 'FD ची मुदत म्हणजे किती काळासाठी पैसे ठेवले आहेत.', tamil_explanation: 'Tenor என்பது எவ்வளவு காலத்திற்கு பணத்தை டெபாசிட் செய்கிறீர்கள்.', analogy: 'Jaise PG rent pe dene mein aap 11-month contract choose karte ho, waise FD mein bhi tenure choose karte ho.', numeric_example: '1 saal ki FD = 12 months tenor, 2 saal = 24 months' },
      { id: '8', term: 'Nominee', hindi_explanation: 'Nominee woh vyakti hai jisko FD ka paisa milega agar aap موجود nahi rahe.', bhojpuri_explanation: 'Nominee माने जवान के परिवार के मिलेगा अगर कुछ हो जाय त।', marathi_explanation: 'Nominee म्हणजे तो व्यक्ती ज्याला FD चे पैसे मिळतील जर तुम्ही नसलात.', tamil_explanation: 'Nominee என்பவர் நீங்கள் இல்லாவிட்டால் FD பணம் பெறுபவர்.', analogy: 'Jaise aap life insurance mein nominee dete ho, waise hi FD mein bhi nominee hota hai.', numeric_example: 'Agar aapk Koi accident ho jaye, toh nominee ko FD ka paisa mil jayega' },
      { id: '9', term: 'Aadhaar', hindi_explanation: 'Aadhaar 12-digit unique ID hai jo government deti hai aur FD booking ke liye zaroori hai.', bhojpuri_explanation: 'Aadhaar माने 12 अंक के नंबर जवान सरकार देला बा।', marathi_explanation: 'Aadhaar म्हणजे 12-अंकी अद्वितीय ओळख क्रमांक.', tamil_explanation: 'Aadhaar என்பது 12 இலக்க தனிப்பட்ட அடையாள எண்.', analogy: 'Aadhaar is like your unique digital identity card that government has on record for you.', numeric_example: 'XXXX-XXXX-1234 (only last 4 digits stored for security)' },
      { id: '10', term: 'PAN', hindi_explanation: 'PAN 10-character alphanumeric card hai jo income tax department deta hai aur large FD ke liye zaroori hai.', bhojpuri_explanation: 'PAN माने 10 अक्षर के नंबर जवान इनकम टैक्स वाला देला बा।', marathi_explanation: 'PAN म्हणजे 10-अक्षरी आयकर विभागाचा कार्ड.', tamil_explanation: 'PAN என்பது 10 எழுத்து எண் கொண்ட அஞ்சல் குறியீடு.', analogy: 'PAN is like your tax identity number - needed for large financial transactions.', numeric_example: 'ABCTY1234X (format: 5 letters + 4 numbers + 1 letter)' },
    ];
    jargons.forEach(j => this.jargonTerms.set(j.id, j));
  }

  // User methods
  async getUserByPhone(phone) {
    for (const user of this.users.values()) {
      if (user.phone === phone) return user;
    }
    return null;
  }

  async getUserById(id) {
    return this.users.get(id) || null;
  }

  async createUser(userData) {
    const id = uuid();
    const user = { id, ...userData, kyc_verified: false, created_at: new Date().toISOString() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Chat methods
  async saveChatMessage(message) {
    const id = uuid();
    const msg = { id, ...message, timestamp: new Date().toISOString() };
    this.chatMessages.set(id, msg);
    return msg;
  }

  async getChatHistory(userId) {
    const messages = [];
    for (const msg of this.chatMessages.values()) {
      if (msg.user_id === userId) messages.push(msg);
    }
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // FD Rates methods
  async getAllRates() {
    return Array.from(this.fdRates.values());
  }

  async getRateByBankId(bankId) {
    return this.fdRates.get(bankId) || null;
  }

  // Booking methods
  async createBooking(bookingData) {
    const id = uuid();
    const booking = { id, ...bookingData, status: 'pending', created_at: new Date().toISOString() };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookingsByUserId(userId) {
    const userBookings = [];
    for (const booking of this.bookings.values()) {
      if (booking.user_id === userId) userBookings.push(booking);
    }
    return userBookings;
  }

  async getBookingById(bookingId) {
    return this.bookings.get(bookingId) || null;
  }

  async updateBookingStatus(bookingId, status) {
    const booking = this.bookings.get(bookingId);
    if (!booking) return null;
    booking.status = status;
    this.bookings.set(bookingId, booking);
    return booking;
  }

  // Jargon methods
  async getAllJargon() {
    return Array.from(this.jargonTerms.values());
  }

  // OTP methods
  setOTP(phone, otp) {
    this.otps.set(phone, { otp, expiresAt: Date.now() + 300000 }); // 5 min expiry
  }

  getOTP(phone) {
    const data = this.otps.get(phone);
    if (!data) return null;
    if (Date.now() > data.expiresAt) {
      this.otps.delete(phone);
      return null;
    }
    return data.otp;
  }

  deleteOTP(phone) {
    this.otps.delete(phone);
  }
}

import { v4 as uuid } from 'uuid';

export const db = new MockDB();
export default db;
