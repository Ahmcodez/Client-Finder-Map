import Business from '../models/Business.js';
import User from '../models/User.js';
import { calculateOpportunityScore } from '../utils/opportunityScore.js';
import { generatePitchMessage } from '../utils/pitchGenerator.js';

const SERP_API_URL = 'https://serpapi.com/search.json';
const REQUIRED_BUSINESS_COUNT = 12;
const SERPAPI_PAGE_SIZE = 20;
const MAJOR_SEARCH_CITIES = {
  unitedstates: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  unitedstatesofamerica: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  usa: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  us: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
};
function buildBusinessPayload(input) {
  const websiteQuality = input.hasWebsite ? input.websiteQuality || 'bad' : 'none';

  return {
    ...input,
    websiteQuality,
    opportunityScore: calculateOpportunityScore({
      hasWebsite: input.hasWebsite,
      websiteQuality,
    }),
    websiteAnalysis:
      input.websiteAnalysis ||
      (!input.hasWebsite
        ? 'No website was found for this business, which creates a strong opportunity to pitch a first online presence.'
        : websiteQuality === 'bad'
          ? 'The website appears outdated or weak on mobile, signaling a redesign opportunity.'
          : 'The website is functional, but there may still be room to improve conversion and presentation.'),
  };
}

function normalizeSearchQuery(query) {
  return query.trim().toLowerCase();
}

function normalizeCountry(country) {
  return country.trim().toLowerCase();
}

function toTitleCase(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function buildWebsiteAnalysis(hasWebsite) {
  return hasWebsite
    ? 'A website was detected for this business. There may still be room for design, speed, or conversion improvements.'
    : 'No website was detected for this business, making it a strong outreach opportunity for a first web presence.';
}

function buildSearchKey(query, country) {
  return `${normalizeSearchQuery(query)}_${normalizeCountry(country)}`;
}

function getSearchLocations(country) {
  const normalizedCountryKey = normalizeCountryKey(country);
  const cityLocations = MAJOR_SEARCH_CITIES[normalizedCountryKey];

  if (Array.isArray(cityLocations) && cityLocations.length > 0) {
    return cityLocations;
  }

  return [country.trim()];
}

function toNumberOrZero(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function hasContactPhone(phone) {
  return typeof phone === 'string' && phone.trim().length > 0;
}

const COUNTRY_DIAL_CODES = {
  australia: '61',
  austria: '43',
  bangladesh: '880',
  belgium: '32',
  brazil: '55',
  canada: '1',
  china: '86',
  denmark: '45',
  egypt: '20',
  england: '44',
  finland: '358',
  france: '33',
  germany: '49',
  hongkong: '852',
  india: '91',
  indonesia: '62',
  ireland: '353',
  italy: '39',
  malaysia: '60',
  mexico: '52',
  netherlands: '31',
  newzealand: '64',
  nigeria: '234',
  norway: '47',
  pakistan: '92',
  philippines: '63',
  poland: '48',
  portugal: '351',
  qatar: '974',
  scotland: '44',
  saudiarabia: '966',
  singapore: '65',
  southafrica: '27',
  sweden: '46',
  switzerland: '41',
  spain: '34',
  thailand: '66',
  turkey: '90',
  uae: '971',
  us: '1',
  uk: '44',
  unitedarabemirates: '971',
  unitedkingdom: '44',
  unitedstatesofamerica: '1',
  unitedstates: '1',
  usa: '1',
  vietnam: '84',
  wales: '44',
};

function normalizeCountryKey(country) {
  return String(country || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function normalizePhoneToInternational(phone, country) {
  const digitsOnly = String(phone || '').replace(/\D/g, '');
  const countryDialCode = COUNTRY_DIAL_CODES[normalizeCountryKey(country)] || '';

  if (!digitsOnly) {
    return '';
  }

  if (digitsOnly.startsWith('00')) {
    return digitsOnly.slice(2);
  }

  if (countryDialCode && digitsOnly.startsWith(countryDialCode)) {
    return digitsOnly;
  }

  if (digitsOnly.startsWith('0') && countryDialCode) {
    return `${countryDialCode}${digitsOnly.slice(1)}`;
  }

  if (countryDialCode) {
    if (countryDialCode === '1' && digitsOnly.length === 10) {
      return `${countryDialCode}${digitsOnly}`;
    }

    if (countryDialCode !== '1' && digitsOnly.length >= 9 && digitsOnly.length <= 10) {
      return `${countryDialCode}${digitsOnly}`;
    }
  }

  return digitsOnly;
}

function normalizeBusinessPhone(business) {
  return normalizePhoneToInternational(business.contactPhone, business.country);
}

function isQualifiedBusiness(business) {
  return !business.hasWebsite && hasContactPhone(normalizeBusinessPhone(business));
}

function mapBusinessToLead(business) {
  return {
    name: business.name?.trim() || '',
    phone: normalizeBusinessPhone(business),
    website: business.websiteUrl?.trim() || '',
    location: business.location?.trim() || business.country?.trim() || '',
    country: business.country?.trim() || '',
  };
}

function serializeBusiness(business) {
  const serializedBusiness =
    typeof business?.toObject === 'function' ? business.toObject() : { ...business };

  return {
    ...serializedBusiness,
    contactPhone: normalizeBusinessPhone(serializedBusiness),
  };
}

function getBusinessDeduplicationKey(business) {
  return business.dataId || business.placeId || `${business.name}_${business.address}`;
}

function prepareBusinessForInsert(business) {
  const serializedBusiness = serializeBusiness(business);
  const { _id, id, createdAt, updatedAt, __v, ...businessToInsert } = serializedBusiness;
  return businessToInsert;
}

async function persistBusinessesForSearch(searchKey, businesses) {
  if (!Array.isArray(businesses) || businesses.length === 0) {
    return;
  }

  await Promise.all(
    businesses.map((business) => {
      const businessToInsert = prepareBusinessForInsert(business);
      const dedupeKey = getBusinessDeduplicationKey(businessToInsert);
      let filter = null;

      if (!dedupeKey) {
        return Promise.resolve();
      }

      if (businessToInsert.dataId) {
        filter = { searchKey, dataId: businessToInsert.dataId };
      } else if (businessToInsert.placeId) {
        filter = { searchKey, placeId: businessToInsert.placeId };
      } else {
        filter = {
          searchKey,
          name: businessToInsert.name,
          address: businessToInsert.address,
        };
      }

      return Business.updateOne(
        filter,
        { $set: businessToInsert },
        { upsert: true }
      );
    })
  );
}

async function fetchPersistedBusinessesForSearch(searchKey, businesses) {
  if (!Array.isArray(businesses) || businesses.length === 0) {
    return [];
  }

  const lookupConditions = businesses
    .map((business) => {
      const businessToInsert = prepareBusinessForInsert(business);

      if (businessToInsert.dataId) {
        return { searchKey, dataId: businessToInsert.dataId };
      }

      if (businessToInsert.placeId) {
        return { searchKey, placeId: businessToInsert.placeId };
      }

      return {
        searchKey,
        name: businessToInsert.name,
        address: businessToInsert.address,
      };
    })
    .filter(Boolean);

  if (lookupConditions.length === 0) {
    return [];
  }

  const persistedBusinesses = await Business.find({ $or: lookupConditions });
  const persistedBusinessMap = new Map(
    persistedBusinesses.map((business) => [getBusinessDeduplicationKey(serializeBusiness(business)), business])
  );

  return businesses
    .map((business) => persistedBusinessMap.get(getBusinessDeduplicationKey(business)))
    .filter(Boolean);
}

function mergeBusinesses(existingBusinesses, freshBusinesses, limit) {
  const mergedBusinesses = [];
  const seenKeys = new Set();

  for (const business of [...freshBusinesses, ...existingBusinesses]) {
    const serializedBusiness = serializeBusiness(business);
    const dedupeKey = getBusinessDeduplicationKey(serializedBusiness);

    if (!dedupeKey || seenKeys.has(dedupeKey) || !isQualifiedBusiness(serializedBusiness)) {
      continue;
    }

    seenKeys.add(dedupeKey);
    mergedBusinesses.push(prepareBusinessForInsert(serializedBusiness));

    if (mergedBusinesses.length >= limit) {
      break;
    }
  }

  return mergedBusinesses;
}

function buildLeadSearchKey(query, country) {
  if (!query || !country) {
    return '';
  }

  return buildSearchKey(query, country);
}

function transformSerpApiResult(place, { normalizedQuery, country, searchKey }) {
  const websiteUrl = place.website || '';
  const hasWebsite = Boolean(websiteUrl);
  const address = place.address || '';
  const latitude = toNumberOrZero(
    place.gps_coordinates?.latitude ?? place.gps_coordinates?.lat ?? 0
  );
  const longitude = toNumberOrZero(
    place.gps_coordinates?.longitude ?? place.gps_coordinates?.lng ?? 0
  );
  const industry = toTitleCase(normalizedQuery) || 'Business';

  return {
    query: normalizedQuery,
    searchKey,
    placeId: place.place_id || '',
    dataId: place.data_id || '',
    name: place.title || 'Unknown Business',
    address,
    location: address || country,
    country,
    hasWebsite,
    websiteUrl,
    contactPhone: normalizePhoneToInternational(place.phone || '', country),
    industry,
    websiteQuality: hasWebsite ? 'bad' : 'none',
    opportunityScore: hasWebsite ? 40 : 90,
    websiteAnalysis: buildWebsiteAnalysis(hasWebsite),
    pitchMessage: generatePitchMessage({
      name: place.title || 'Unknown Business',
      industry,
      hasWebsite,
      websiteQuality: hasWebsite ? 'bad' : 'none',
      location: address || country,
    }),
    latitude,
    longitude,
    coordinates: {
      lat: latitude,
      lng: longitude,
    },
  };
}

async function fetchSerpApiSearchPage(query, location, apiKey, start = 0) {
  const url = new URL(SERP_API_URL);
  url.searchParams.set('engine', 'google_maps');
  url.searchParams.set('type', 'search');
  url.searchParams.set('q', `${query} in ${location}`);
  url.searchParams.set('num', String(SERPAPI_PAGE_SIZE));
  url.searchParams.set('start', String(start));
  url.searchParams.set('api_key', apiKey);

  console.log(`[business-search] Fetching from SerpAPI for "${query} in ${location}"...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SerpAPI request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const errorMessage = data.error || data.error_message;

  if (errorMessage) {
    if (errorMessage.includes("Google hasn't returned any results for this query.")) {
      return [];
    }

    throw new Error(errorMessage);
  }

  const results = Array.isArray(data.local_results)
    ? data.local_results
    : Array.isArray(data.place_results)
      ? data.place_results
      : [];

  return results;
}

async function fetchQualifiedSerpApiBusinesses(query, country, apiKey, start, limit, transformBusiness) {
  const cityLocations = getSearchLocations(country);
  const transformedBusinesses = [];
  const seenResultIds = new Set();
  const seenQualifiedKeys = new Set();
  let totalApiCalls = 0;
  let hasMore = false;

  for (const location of cityLocations) {
    const pageResults = await fetchSerpApiSearchPage(query, location, apiKey, start);
    totalApiCalls += 1;

    if (pageResults.length === SERPAPI_PAGE_SIZE) {
      hasMore = true;
    }

    for (const place of pageResults) {
      const dedupeKey = place.data_id || place.place_id || `${place.title}_${place.address}`;

      if (!dedupeKey || seenResultIds.has(dedupeKey)) {
        continue;
      }

      seenResultIds.add(dedupeKey);
      transformedBusinesses.push(transformBusiness(place));
    }
  }

  const qualifiedBusinesses = [];

  for (const business of transformedBusinesses) {
    const qualifiedKey = getBusinessDeduplicationKey(business);

    if (!isQualifiedBusiness(business) || !qualifiedKey || seenQualifiedKeys.has(qualifiedKey)) {
      continue;
    }

    seenQualifiedKeys.add(qualifiedKey);
    qualifiedBusinesses.push(business);

    if (qualifiedBusinesses.length >= limit) {
      break;
    }
  }

  console.log(
    `[business-search] Combined ${transformedBusinesses.length} raw results across ${cityLocations.length} location(s) for start=${start} and kept ${qualifiedBusinesses.length} qualified businesses after ${totalApiCalls} SerpAPI call(s).`
  );

  return {
    businesses: qualifiedBusinesses.slice(0, limit),
    hasMore,
  };
}

export async function searchBusinesses(req, res, next) {
  const rawQuery = req.query.query?.trim();
  const rawCountry = req.query.country?.trim();
  const requestedLimit = Number(req.query.limit);
  const requestedPage = Number(req.query.page);
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const start = page * SERPAPI_PAGE_SIZE;
  const resultLimit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.floor(requestedLimit)
      : REQUIRED_BUSINESS_COUNT;

  try {
    if (!rawQuery) {
      res.status(400);
      throw new Error('The query parameter is required.');
    }

    if (!rawCountry) {
      res.status(400);
      throw new Error('The country parameter is required.');
    }

    const normalizedQuery = normalizeSearchQuery(rawQuery);
    const country = rawCountry.trim();
    const searchKey = buildSearchKey(rawQuery, rawCountry);
    const normalizedCountry = normalizeCountry(rawCountry);

    console.log(
      `[business-search] Searching businesses for searchKey="${searchKey}" query="${normalizedQuery}" country="${normalizedCountry}" page=${page} start=${start}`
    );

    const apiKey = process.env.SERP_API_KEY;

    if (!apiKey) {
      res.status(500);
      throw new Error('SERP_API_KEY is not configured.');
    }

    const { businesses: freshBusinesses, hasMore } = await fetchQualifiedSerpApiBusinesses(
      rawQuery,
      country,
      apiKey,
      start,
      resultLimit,
      (place) =>
        transformSerpApiResult(place, {
          normalizedQuery,
          country,
          searchKey,
        })
    );

    await persistBusinessesForSearch(searchKey, freshBusinesses);

    const persistedBusinesses = await fetchPersistedBusinessesForSearch(searchKey, freshBusinesses);
    const serializedBusinesses = persistedBusinesses.map(serializeBusiness);

    console.log(
      `[business-search] Stored ${serializedBusinesses.length} fresh businesses for searchKey="${searchKey}" page=${page}`
    );

    return res.json({
      success: true,
      count: serializedBusinesses.length,
      data: serializedBusinesses,
      source: 'serpapi',
      businesses: serializedBusinesses,
      page,
      start,
      hasMore,
    });
  } catch (error) {
    console.error('SerpAPI error', error.message);
    next(error);
  }
}

export async function getBusinesses(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 9);
  const skip = (page - 1) * limit;
  const query = {};

  if (req.query.search || req.query.location) {
    const searchTerms = [req.query.search, req.query.location].filter(Boolean);
    query.$and = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { country: { $regex: term, $options: 'i' } },
      ],
    }));
  }

  if (req.query.websiteStatus === 'no-website') {
    query.hasWebsite = false;
  }

  if (req.query.websiteStatus === 'has-website') {
    query.hasWebsite = true;
  }

  if (req.query.industry) {
    query.industry = req.query.industry;
  }

  if (req.query.requirePhone === 'true') {
    query.contactPhone = { $exists: true, $nin: ['', null] };
  }

  const [businesses, total] = await Promise.all([
    Business.find(query).sort({ opportunityScore: -1, createdAt: -1 }).skip(skip).limit(limit),
    Business.countDocuments(query),
  ]);

  res.json({
    businesses: businesses.map(serializeBusiness),
    pagination: {
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export async function getLeads(req, res) {
  const requestedSearchKey = buildLeadSearchKey(req.query.query, req.query.country);
  const requestedPage = Number(req.query.page);
  const requestedLimit = Number(req.query.limit);
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : null;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : null;
  let searchKey = requestedSearchKey;

  if (!searchKey) {
    const latestBusiness = await Business.findOne({
      contactPhone: { $exists: true, $nin: ['', null] },
    })
      .sort({ createdAt: -1 })
      .select('searchKey');

    searchKey = latestBusiness?.searchKey || '';
  }

  if (!searchKey) {
    return res.json({
      leads: [],
      meta: {
        searchKey: '',
        count: 0,
      },
    });
  }

  const businessQuery = Business.find({
    searchKey,
    contactPhone: { $exists: true, $nin: ['', null] },
  })
    .sort({ createdAt: -1 })
    .select('name contactPhone websiteUrl location searchKey query country');

  if (page !== null && limit !== null) {
    businessQuery.skip(page * limit).limit(limit);
  }

  const businesses = await businessQuery;

  const seenPhones = new Set();
  const leads = [];

  for (const business of businesses) {
    const lead = mapBusinessToLead(business);

    if (!lead.name || !lead.phone || seenPhones.has(lead.phone)) {
      continue;
    }

    seenPhones.add(lead.phone);
    leads.push(lead);
  }

  res.json({
    leads,
    meta: {
      searchKey,
      count: leads.length,
      query: businesses[0]?.query || '',
      country: businesses[0]?.country || '',
      page,
      limit,
    },
  });
}

export async function getBusinessById(req, res) {
  const business = await Business.findById(req.params.id);

  if (!business) {
    res.status(404);
    throw new Error('Business not found.');
  }

  res.json({ business: serializeBusiness(business) });
}

export async function createBusiness(req, res) {
  const payload = buildBusinessPayload(req.body);
  payload.pitchMessage = generatePitchMessage(payload);

  const business = await Business.create(payload);
  res.status(201).json({ business });
}

export async function toggleSaveLead(req, res) {
  const user = await User.findById(req.user._id);
  const businessId = req.params.id;
  const alreadySaved = user.savedLeads.some((item) => item.toString() === businessId);

  if (alreadySaved) {
    user.savedLeads = user.savedLeads.filter((item) => item.toString() !== businessId);
  } else {
    user.savedLeads.push(businessId);
  }

  await user.save();

  res.json({
    savedLeads: user.savedLeads,
    saved: !alreadySaved,
  });
}

export async function removeSavedLead(req, res) {
  const user = await User.findById(req.user._id);
  user.savedLeads = user.savedLeads.filter((item) => item.toString() !== req.params.id);
  await user.save();

  res.json({ savedLeads: user.savedLeads });
}
