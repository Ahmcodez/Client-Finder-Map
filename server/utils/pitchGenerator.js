export function generatePitchMessage(business) {
  if (!business.hasWebsite) {
    return `Hi, I noticed ${business.name} does not seem to have a dedicated website yet. I help ${business.industry.toLowerCase()} businesses create modern websites that build trust, rank better locally, and turn more visitors into paying customers. If you're open to it, I can share a few ideas tailored to ${business.location}.`;
  }

  if (business.websiteQuality === 'bad') {
    return `Hi, I came across ${business.name} and saw an opportunity to refresh the current website. I help ${business.industry.toLowerCase()} businesses improve design, mobile performance, and conversion flow so more visitors become real inquiries. I would be happy to suggest a few practical improvements for your ${business.location} audience.`;
  }

  return `Hi, I checked out ${business.name} and noticed a chance to sharpen the site's messaging and conversion experience even further. I work with ${business.industry.toLowerCase()} businesses on performance, trust-building design, and lead generation improvements. If helpful, I can share a quick website growth audit.`;
}
