export function normalizeWhatsAppPhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function buildDefaultWhatsAppMessage(business) {
  const businessName = business?.name?.trim() || 'there';

  return `Hello ${businessName}, hope you're doing well. I noticed your business online and wanted to share a few quick website ideas that could help you attract more customers. Would you like me to send them over?`;
}

export function buildWhatsAppUrl(business) {
  const phone = normalizeWhatsAppPhone(business?.contactPhone);

  if (!phone) {
    return '';
  }

  const message = business?.pitchMessage?.trim() || buildDefaultWhatsAppMessage(business);
  const params = new URLSearchParams({ text: message });

  return `https://wa.me/${phone}?${params.toString()}`;
}
