export function calculateOpportunityScore({ hasWebsite, websiteQuality }) {
  if (!hasWebsite || websiteQuality === 'none') {
    return 92;
  }

  if (websiteQuality === 'bad') {
    return 68;
  }

  return 28;
}
