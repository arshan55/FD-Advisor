-- FD Mitra Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  age INTEGER DEFAULT 30,
  language_preference VARCHAR(10) DEFAULT 'hi',
  aadhaar_masked VARCHAR(20),
  pan_masked VARCHAR(15),
  nominee_name VARCHAR(100),
  kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'hi',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster history queries
CREATE INDEX idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_timestamp ON chat_messages(timestamp);

-- ============================================
-- FD RATES TABLE
-- ============================================
CREATE TABLE fd_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name VARCHAR(100) NOT NULL,
  bank_logo_url VARCHAR(255),
  min_amount INTEGER DEFAULT 1000,
  max_amount INTEGER DEFAULT 10000000,
  tenor_months INTEGER DEFAULT 12,
  interest_rate DECIMAL(4,2) NOT NULL,
  senior_citizen_rate DECIMAL(4,2) NOT NULL,
  is_dicgc_insured BOOLEAN DEFAULT TRUE,
  rbi_license_number VARCHAR(50),
  cumulative_available BOOLEAN DEFAULT TRUE,
  non_cumulative_available BOOLEAN DEFAULT TRUE
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bank_id UUID REFERENCES fd_rates(id),
  bank_name VARCHAR(100) NOT NULL,
  principal_amount INTEGER NOT NULL,
  tenor_months INTEGER NOT NULL,
  interest_rate DECIMAL(4,2) NOT NULL,
  fd_type VARCHAR(20) DEFAULT 'cumulative',
  maturity_amount INTEGER NOT NULL,
  maturity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  nominee_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user bookings lookup
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- JARGON TERMS TABLE
-- ============================================
CREATE TABLE jargon_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term VARCHAR(100) NOT NULL,
  hindi_explanation TEXT NOT NULL,
  bhojpuri_explanation TEXT NOT NULL,
  marathi_explanation TEXT NOT NULL,
  tamil_explanation TEXT NOT NULL,
  analogy TEXT,
  numeric_example TEXT
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Chat messages policy
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings policy
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: FD RATES (6 BANKS)
-- ============================================
INSERT INTO fd_rates (bank_name, bank_logo_url, min_amount, max_amount, tenor_months, interest_rate, senior_citizen_rate, is_dicgc_insured, rbi_license_number, cumulative_available, non_cumulative_available) VALUES
  ('Suryoday Small Finance Bank', '/banks/suryoday.png', 1000, 10000000, 12, 8.50, 8.75, true, 'RBI/BSF/2015/86', true, true),
  ('AU Small Finance Bank', '/banks/au.png', 1000, 5000000, 12, 8.00, 8.50, true, 'RBI/ASF/2016/42', true, true),
  ('Jana Small Finance Bank', '/banks/jana.png', 1000, 5000000, 12, 8.25, 8.75, true, 'RBI/JSF/2017/15', true, true),
  ('SBI', '/banks/sbi.png', 1000, 10000000, 12, 6.80, 7.30, true, 'RBI/SBI/1955/01', true, true),
  ('HDFC Bank', '/banks/hdfc.png', 5000, 10000000, 12, 7.00, 7.50, true, 'RBI/HDFC/1994/08', true, true),
  ('Bajaj Finance FD', '/banks/bajaj.png', 25000, 5000000, 12, 8.10, 8.35, false, 'NBFC', true, true);

-- ============================================
-- SEED DATA: JARGON TERMS (10 TERMS)
-- ============================================
INSERT INTO jargon_terms (term, hindi_explanation, bhojpuri_explanation, marathi_explanation, tamil_explanation, analogy, numeric_example) VALUES
  ('Fixed Deposit',
   'FD ek aisa investment hai jahan aap paisa ek baar rakhte ho aur ek fixed interest paate ho.',
   'FD ke kaam hai ki rakhwa paisa ek baar aur baad mein baap-daulat pao.',
   'FD हा एक गुंतवणूक आहे ज्यामध्ये तुम्ही एकदा पैसे ठेवता आणि निश्चित व्याज मिळवता.',
   'FD என்பது ஒரு முதலீடு ஆகும், அதில் நீங்கள் ஒரு முறை பணத்தை டெபாசிட் செய்கிறீர்கள்.',
   'Jaise aap ghar lease pe dete ho, waise hi FD mein paisa "lease" karte ho bank ko.',
   'Agar aap ₹1,00,000 FD mein rakho 1 saal ke liye 7% rate pe, toh saal ke end mein ₹7,000 ka fayda hoga.'),

  ('Maturity Amount',
   'Maturity amount woh total paisa hai jo aapko FD ke end mein milega - original paisa + saara interest.',
   'Maturity amount माने जवानी में कुल पैसा - अपनी रकम + सब ब्याज।',
   'Maturity amount म्हणजे एकूण रक्कम - मूळ रक्कम + व्याज.',
   'Maturity amount என்பது மொத்தத் தொகை - அசல் + வட்டி.',
   'Jaise cake banate waqt aapne ₹500 lagaye aur cake ₹700 ka ho gaya, toh ₹200 ka extra cake ka fayda hai.',
   '₹1,00,000 + ₹7,000 interest = ₹1,07,000 maturity amount'),

  ('Cumulative FD',
   'Cumulative FD mein interest har saal principal mein add hota hai. Aapko har mahine payout nahi milti, end mein ek saath milta hai.',
   'Cumulative FD में ब्याज हर साल अकल कय हो जाला, महीने में नइक।',
   'Cumulative FD मध्ये व्याज दरवर्षी मूळ रकमेत जोडले जातात.',
   'Cumulative FD ல் வட்டி ஒவ்வொரு ஆண்டும் அசலுடன் சேர்க்கப்படும்.',
   'Jaise SIP mein compounding hota hai, waise hi Cumulative FD mein bhi interest pe interest milta hai.',
   '₹1,00,000 @ 7% for 2 years: Year 1: ₹1,07,000, Year 2: ₹1,07,000 + 7% = ₹1,14,490'),

  ('Non-Cumulative FD',
   'Non-Cumulative FD mein interest aapko har mahine, quarter ya half-yearly milta hai. Principal same rehta hai.',
   'Non-Cumulative FD में ब्याज हर महीने मिलत।',
   'Non-Cumulative FD मध्ये व्याज तुम्हाला टप्प्याटप्प्याने मिळतो.',
   'Non-Cumulative FD ல் வட்டி தவணைக்கு தவணை கிடைக்கும்.',
   'Jaise monthly rent se aapko har mahine income milti hai, waise hi Non-Cumulative se monthly payout milta hai.',
   '₹1,00,000 @ 7% yearly payout: Har saal ₹7,000 ki payout'),

  ('DICGC Insurance',
   'DICGC ek government body hai jo aapke FD ki ₹5 lakh tak ki safety guarantee karti hai.',
   'DICGC माने सरकार के कहलावल बैंक जवानी ₹5 lakh ले के सुरक्षित राखला।',
   'DICGC म्हणजे सरकारी विमा कंपनी जी ₹5 लाख पर्यंत FD ची सुरक्षा करते.',
   'DICGC என்பது அரசு காப்பீட்டு நிறுவனம், ₹5 லட்சம் வரை FD பாதுகாப்பை உறுதி செய்கிறது.',
   'Jaise car ki insurance mein agar accident ho toh company compensate karti hai, waise DICGC FD ke saath hai.',
   'Agar bank collapse bhi ho jaye, toh DICGC aapको ₹5,00,000 tak will return karenge'),

  ('Senior Citizen Rate',
   'Senior citizens (60+ years) ko bank extra 0.5% interest dete hain FD pe.',
   'Senior citizens (60+) के ब्याज में 0.5% ज्यादा मिलत।',
   'वयस्कर (60+) लोकांना बँका अतिरिक्त 0.5% व्याज देतात.',
   'மூத்த குடிமக்கள் (60+) க்கு 0.5% கூடுதல் வட்டி கிடைக்கும்.',
   'Jaise senior citizen railway discount mein concessional fare dete hain, waise hi FD mein extra rate milta hai.',
   'Regular rate 7%, Senior rate 7.5%. ₹1,00,000 pe senior citizen ₹500 extra kamaega'),

  ('Tenor',
   'FD ki tenor matlab kitni der ke liye aap paisa rakhte ho - 3 mahine se 10 saal tak.',
   'FD अवधि माने कितने समय ले के राखला - 3 महीना से 10 साल।',
   'FD ची मुदत म्हणजे किती काळासाठी पैसे ठेवले आहेत.',
   'Tenor என்பது எவ்வளவு காலத்திற்கு பணத்தை டெபாசிட் செய்கிறீர்கள்.',
   'Jaise PG rent pe dene mein aap 11-month contract choose karte ho, waise FD mein bhi tenure choose karte ho.',
   '1 saal ki FD = 12 months tenor, 2 saal = 24 months'),

  ('Nominee',
   'Nominee woh vyakti hai jisko FD ka paisa milega agar aap موجود nahi rahe.',
   'Nominee माने जवान के परिवार के मिलेगा अगर कुछ हो जाय त।',
   'Nominee म्हणजे तो व्यक्ती ज्याला FD चे पैसे मिळतील जर तुम्ही नसलात.',
   'Nominee என்பவர் நீங்கள் இல்லாவிட்டால் FD பணம் பெறுபவர்.',
   'Jaise aap life insurance mein nominee dete ho, waise hi FD mein bhi nominee hota hai.',
   'Agar aapka koi accident ho jaye, toh nominee ko FD ka paisa mil jayega'),

  ('Aadhaar',
   'Aadhaar 12-digit unique ID hai jo government deti hai aur FD booking ke liye zaroori hai.',
   'Aadhaar माने 12 अंक के नंबर जवान सरकार देला बा।',
   'Aadhaar म्हणजे 12-अंकी अद्वितीय ओळख क्रमांक.',
   'Aadhaar என்பது 12 இலக்க தனிப்பட்ட அடையாள எண்.',
   'Aadhaar is like your unique digital identity card that government has on record for you.',
   'XXXX-XXXX-1234 (only last 4 digits stored for security)'),

  ('PAN',
   'PAN 10-character alphanumeric card hai jo income tax department deta hai aur large FD ke liye zaroori hai.',
   'PAN माने 10 अक्षर के नंबर जवान इनकम टैक्स वाला देला बा।',
   'PAN म्हणजे 10-अक्षरी आयकर विभागाचा कार्ड.',
   'PAN என்பது 10 எழுத்து எண் கொண்ட அஞ்சல் குறியீடு.',
   'PAN is like your tax identity number - needed for large financial transactions.',
   'ABCTY1234X (format: 5 letters + 4 numbers + 1 letter)');
