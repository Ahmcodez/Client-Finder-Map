import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Business from '../models/Business.js';
import { calculateOpportunityScore } from '../utils/opportunityScore.js';
import { generatePitchMessage } from '../utils/pitchGenerator.js';
import businesses from './businesses.js';

dotenv.config();

function normalizeBusinesses() {
  return businesses.map((business) => {
    const opportunityScore = calculateOpportunityScore(business);
    const websiteAnalysis = !business.hasWebsite
      ? 'No website was found for this business, making it a strong candidate for a first digital presence.'
      : business.websiteQuality === 'bad'
        ? 'The site exists but appears outdated and likely underperforms on modern devices.'
        : 'The site is present and serviceable, though it could still be optimized further.';

    return {
      ...business,
      opportunityScore,
      websiteAnalysis,
      pitchMessage: generatePitchMessage({
        ...business,
        opportunityScore,
        websiteAnalysis,
      }),
    };
  });
}

export async function seedBusinessesIfNeeded() {
  const existingCount = await Business.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await Business.insertMany(normalizeBusinesses());
  console.log('Seeded sample businesses');
}

async function runSeed() {
  await connectDB();
  await Business.deleteMany();
  await Business.insertMany(normalizeBusinesses());
  console.log('Business data seeded successfully');
  process.exit(0);
}

const executedDirectly = process.argv[1]?.endsWith('seed.js');
if (executedDirectly) {
  runSeed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
