export function scoreTone(score) {
  if (score >= 80) {
    return 'from-emerald-300 to-teal-400';
  }
  if (score >= 50) {
    return 'from-amber-300 to-orange-400';
  }
  return 'from-slate-300 to-slate-400';
}

export function websiteLabel(hasWebsite) {
  return hasWebsite ? 'Website Found' : 'No Website';
}

export function displayPhone(phone) {
  if (!phone) {
    return '';
  }

  const digitsOnly = String(phone).replace(/\D/g, '');
  return digitsOnly ? `+${digitsOnly}` : String(phone);
}
