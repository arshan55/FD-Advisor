// Format number in Indian numbering system
export function formatIndianNumber(num) {
  if (num === undefined || num === null) return '₹0';
  const n = parseFloat(num);
  if (isNaN(n)) return '₹0';

  const str = n.toString();
  const lastThree = str.substring(str.length - 3);
  const rest = str.substring(0, str.length - 3);

  let result = lastThree;
  if (rest !== '') {
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `₹${result}`;
}

// Format amount with commas
export function formatAmount(amount) {
  return formatIndianNumber(amount);
}

// Calculate days remaining
export function getDaysRemaining(maturityDate) {
  const today = new Date();
  const maturity = new Date(maturityDate);
  const diff = maturity - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Get maturity timeline
export function getMaturityTimeline(maturityDate, createdAt) {
  const created = new Date(createdAt);
  const maturity = new Date(maturityDate);
  const today = new Date();

  const totalDays = (maturity - created) / (1000 * 60 * 60 * 24);
  const daysPassed = (today - created) / (1000 * 60 * 60 * 24);
  const daysRemaining = (maturity - today) / (1000 * 60 * 60 * 24);

  return {
    totalDays: Math.round(totalDays),
    daysPassed: Math.round(Math.max(0, daysPassed)),
    daysRemaining: Math.round(Math.max(0, daysRemaining)),
    percentComplete: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
  };
}

// Generate WhatsApp share link
export function generateWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}

// Validate phone number (Indian)
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 12;
}

// Format phone for display
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return phone;
}

// Get tenor display text
export function getTenorDisplay(months) {
  if (months < 12) {
    return `${months} महीने`;
  }
  const years = months / 12;
  if (years === 1) return '1 साल';
  if (years === 2) return '2 साल';
  if (years === 3) return '3 साल';
  return `${years} साल`;
}
