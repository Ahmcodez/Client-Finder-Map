const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { detectCountryFromLocation, parsePhoneNumberDetails } = require('./utils/phoneNumber');

const USER_DATA_DIR = path.join(__dirname, 'session');
const LOG_FILE_PATH = path.join(__dirname, 'logs.csv');
const WHATSAPP_WEB_URL = 'https://web.whatsapp.com';
const LEADS_API_URL = 'http://localhost:5000/api/leads';
const FRONTEND_QUERY = (process.env.BOT_LEADS_QUERY || '').trim();
const FRONTEND_COUNTRY = (process.env.BOT_LEADS_COUNTRY || '').trim();
const FRONTEND_PAGE = Number.parseInt(process.env.BOT_LEADS_PAGE || '', 10);
const FRONTEND_LIMIT = Number.parseInt(process.env.BOT_LEADS_LIMIT || '', 10);
const LOGIN_SUCCESS_SELECTOR = '[data-testid="chat-list"], [aria-label="Chat list"]';
const CHAT_READY_SELECTOR =
  [
    '[data-testid="conversation-compose-box-input"]',
    'div[contenteditable="true"][role="textbox"]',
    'footer div[contenteditable="true"]',
    'div[contenteditable="true"][data-tab]',
  ].join(', ');
const SEND_BUTTON_SELECTOR =
  [
    '[data-testid="compose-btn-send"]',
    'button[aria-label="Send"]',
    'button span[data-icon="send"]',
    'span[data-icon="send"]',
  ].join(', ');
const WHATSAPP_UNAVAILABLE_PATTERNS = [
  'phone number shared via url is invalid',
  'phone number is not on whatsapp',
  'this phone number isn’t on whatsapp',
  "this phone number isn't on whatsapp",
  'number is not on whatsapp',
];
const DAILY_SEND_LIMIT = 25;
const DELAY_BETWEEN_MESSAGES_MS = 60 * 1000;
const MIN_PRE_SEND_DELAY_MS = 2 * 1000;
const MAX_PRE_SEND_DELAY_MS = 7 * 1000;
const MIN_TYPING_DELAY_MS = 45;
const MAX_TYPING_DELAY_MS = 140;
const COUNTRY_CODE_MAP = {
  australia: 'AU',
  bangladesh: 'BD',
  canada: 'CA',
  france: 'FR',
  germany: 'DE',
  india: 'IN',
  ireland: 'IE',
  italy: 'IT',
  mexico: 'MX',
  newzealand: 'NZ',
  pakistan: 'PK',
  philippines: 'PH',
  singapore: 'SG',
  southafrica: 'ZA',
  spain: 'ES',
  turkey: 'TR',
  uae: 'AE',
  unitedarabemirates: 'AE',
  unitedkingdom: 'GB',
  uk: 'GB',
  unitedstates: 'US',
  unitedstatesofamerica: 'US',
  usa: 'US',
};

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function csvEscape(value) {
  const normalizedValue = value == null ? '' : String(value);
  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function ensureLogFile() {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, 'timestamp,name,phone,website,status,message,error\n', 'utf8');
  }
}

function appendLogEntry(entry) {
  ensureLogFile();

  const row = [
    new Date().toISOString(),
    entry.name || '',
    entry.phone || '',
    entry.website || '',
    entry.status || '',
    entry.message || '',
    entry.error || '',
  ]
    .map(csvEscape)
    .join(',');

  fs.appendFileSync(LOG_FILE_PATH, `${row}\n`, 'utf8');
}

function buildSendUrl(phone, message) {
  const params = new URLSearchParams({
    phone,
    text: message,
  });

  return `${WHATSAPP_WEB_URL}/send?${params.toString()}`;
}

function normalizeCountryLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function resolveLeadCountryCode(country) {
  const normalizedCountry = String(country || '').trim();

  if (!normalizedCountry) {
    return null;
  }

  if (/^[A-Za-z]{2}$/.test(normalizedCountry)) {
    return normalizedCountry.toUpperCase();
  }

  return COUNTRY_CODE_MAP[normalizeCountryLookupKey(normalizedCountry)] || null;
}

function normalizeLeads(payload) {
  const fallbackCountry = payload?.meta?.country || '';
  const fallbackLocation = payload?.meta?.country || '';
  const rawLeads = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.leads)
      ? payload.leads
      : Array.isArray(payload?.savedLeads)
        ? payload.savedLeads
        : [];

  return rawLeads
    .map((lead) => ({
      name: typeof lead?.name === 'string' ? lead.name.trim() : '',
      originalPhone: typeof lead?.phone === 'string' ? lead.phone.trim() : '',
      phone: typeof lead?.phone === 'string' ? lead.phone.trim() : '',
      website: typeof lead?.website === 'string' ? lead.website.trim() : '',
      location: typeof lead?.location === 'string' ? lead.location.trim() : fallbackLocation,
      country: typeof lead?.country === 'string' ? lead.country.trim() : fallbackCountry,
    }))
    .filter((lead) => lead.name && lead.phone);
}

function filterLeads(leads) {
  const seenPhones = new Set();
  const validLeads = [];

  for (const lead of leads) {
    if (!lead.name || !lead.phone) {
      continue;
    }

    const parsingLocation = lead.location || lead.country;
    const detectedCountry =
      detectCountryFromLocation(parsingLocation) || resolveLeadCountryCode(lead.country);
    const parseDetails = parsePhoneNumberDetails(lead.phone, parsingLocation);
    const formattedPhone = parseDetails.finalFormattedNumber;

    console.log(
      [
        'Phone parse',
        `name="${lead.name}"`,
        `original="${lead.originalPhone || lead.phone}"`,
        `location="${parsingLocation || ''}"`,
        `detectedCountry="${parseDetails.detectedCountry || detectedCountry || ''}"`,
        `method="${parseDetails.parsingMethod}"`,
        `formatted="${parseDetails.finalFormattedNumber || ''}"`,
        `valid="${parseDetails.validationResult}"`,
      ].join(' | ')
    );

    if (!formattedPhone) {
      console.log(
        `Skipping invalid number for ${lead.name}: original="${lead.originalPhone || lead.phone}" location="${parsingLocation}" detectedCountry="${parseDetails.detectedCountry || detectedCountry || ''}" method="${parseDetails.parsingMethod}" error="${parseDetails.error || 'Invalid phone number'}"`
      );
      appendLogEntry({
        name: lead.name,
        phone: lead.originalPhone || lead.phone,
        website: lead.website,
        status: 'skipped_invalid_number',
        message: '',
        error: parseDetails.error || 'Invalid phone number',
      });
      continue;
    }

    console.log(
      `Validated lead number for ${lead.name}: original="${lead.originalPhone || lead.phone}" formatted="${formattedPhone}" location="${parsingLocation}" detectedCountry="${parseDetails.detectedCountry || detectedCountry || ''}" method="${parseDetails.parsingMethod}"`
    );

    if (seenPhones.has(formattedPhone)) {
      continue;
    }

    seenPhones.add(formattedPhone);
    validLeads.push({
      ...lead,
      phone: formattedPhone,
    });
  }

  return validLeads;
}

function pickRandomItem(items) {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function generatePersonalizedMessage(lead) {
  const businessName = lead?.name?.trim() || 'your business';
  const variations = [
    `Hi ${businessName},I was looking at your business online and took a few minutes to create a quick sample of how your business could look with a simple website.It’s nothing fancy, just a basic idea — but it shows how you could attract more customers online.Want me to share it with you?`,
    `Hello ${businessName}, hope you're doing well. I was looking at local businesses and thought I'd message you because I help with websites and online visibility. If it's useful, I'd be happy to suggest a couple of ideas tailored to your business.`,
    `Hi ${businessName}, I was looking at your business online and took a few minutes to create a quick sample of how your business could look with a simple website.It’s nothing fancy, just a basic idea — but it shows how you could attract more customers online.Want me to share it with you?`,
  ];

  return pickRandomItem(variations);
}

function generateCleanPersonalizedMessage(lead) {
  const businessName = lead?.name?.trim() || 'your business';
  const variations = [
    `Hi ${businessName}, I was looking at your business online and took a few minutes to create a quick sample of how your business could look with a simple website. It's a simple idea, but it shows how you could attract more customers online. Want me to share it with you?`,
    `Hello ${businessName}, hope you're doing well. I help local businesses improve their websites and online visibility. If it is useful, I can send over a couple of ideas tailored to your business.`,
    `Hi ${businessName}, I noticed your business online and had a quick idea for a cleaner website that could help customers trust you faster and contact you more easily. Would you like me to send a simple sample?`,
  ];

  return pickRandomItem(variations);
}

async function fetchLeads() {
  try {
    const params = {};

    if (FRONTEND_QUERY) {
      params.query = FRONTEND_QUERY;
    }

    if (FRONTEND_COUNTRY) {
      params.country = FRONTEND_COUNTRY;
    }

    if (Number.isInteger(FRONTEND_PAGE) && FRONTEND_PAGE >= 0) {
      params.page = FRONTEND_PAGE;
    }

    if (Number.isInteger(FRONTEND_LIMIT) && FRONTEND_LIMIT > 0) {
      params.limit = FRONTEND_LIMIT;
    }

    const response = await axios.get(LEADS_API_URL, {
      params,
      timeout: 30000,
    });
    const leads = normalizeLeads(response.data);
    const meta = response.data?.meta || {};

    console.log(`Fetched ${leads.length} leads from ${LEADS_API_URL}.`);
    if (meta.searchKey) {
      console.log(
        `Using backend frontend-matched leads: query="${meta.query || ''}" country="${meta.country || ''}" searchKey="${meta.searchKey}" page=${meta.page ?? 'all'} limit=${meta.limit ?? 'all'}`
      );
    }
    return leads;
  } catch (error) {
    console.error('Failed to fetch leads.');
    console.error(`Error message: ${error.message || 'No error message provided.'}`);

    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }

    console.error('Error stack:', error.stack || 'No stack trace available.');
    return [];
  }
}

async function createBrowser() {
  return puppeteer.launch({
    headless: false,
    userDataDir: USER_DATA_DIR,
    defaultViewport: null,
    args: ['--start-maximized'],
  });
}

async function waitForLogin(page) {
  console.log('Opening WhatsApp Web...');
  await page.goto(WHATSAPP_WEB_URL, { waitUntil: 'domcontentloaded' });

  console.log('If WhatsApp is not logged in yet, please scan the QR code in the opened browser window.');
  console.log('Waiting for WhatsApp login...');
  await page.waitForSelector(LOGIN_SUCCESS_SELECTOR, { timeout: 0 });

  console.log('WhatsApp login successful.');
  console.log(`Persistent session stored in: ${USER_DATA_DIR}`);
}

async function addHumanLikeComposerInteraction(page) {
  const typingDelay = randomInt(MIN_TYPING_DELAY_MS, MAX_TYPING_DELAY_MS);
  const composer = await page.$(CHAT_READY_SELECTOR);

  if (!composer) {
    return;
  }

  await composer.click();
  await sleep(randomInt(300, 1200));
  await page.keyboard.type(' ', { delay: typingDelay });
  await sleep(randomInt(150, 500));
  await page.keyboard.press('Backspace');
}

async function detectUnavailableWhatsAppNumber(page) {
  try {
    return await page.waitForFunction(
      (patterns) => {
        const bodyText = document.body?.innerText?.toLowerCase() || '';
        return patterns.find((pattern) => bodyText.includes(pattern)) || null;
      },
      { timeout: 5000 },
      WHATSAPP_UNAVAILABLE_PATTERNS
    );
  } catch {
    return null;
  }
}

async function waitForChatOrUnavailableNumber(page) {
  const chatReadyPromise = page
    .waitForSelector(CHAT_READY_SELECTOR, { timeout: 60000 })
    .then(() => ({ type: 'chat-ready' }))
    .catch(() => null);

  const unavailablePromise = detectUnavailableWhatsAppNumber(page)
    .then(async (handle) => {
      if (!handle) {
        return null;
      }

      const unavailableMessage = await handle.jsonValue();
      return {
        type: 'not-on-whatsapp',
        message: unavailableMessage || 'phone number is not on whatsapp',
      };
    })
    .catch(() => null);

  const firstResult = await Promise.race([chatReadyPromise, unavailablePromise]);

  if (firstResult) {
    return firstResult;
  }

  const chatReadyResult = await chatReadyPromise;

  if (chatReadyResult) {
    return chatReadyResult;
  }

  const unavailableResult = await unavailablePromise;

  if (unavailableResult) {
    return unavailableResult;
  }

  return {
    type: 'timeout',
    message: 'Timed out waiting for WhatsApp chat to open.',
  };
}

async function clickSendButton(page) {
  const sendButton = await page.$(SEND_BUTTON_SELECTOR);

  if (!sendButton) {
    return false;
  }

  await sendButton.evaluate((element) => {
    const clickableElement = element.closest('button') || element;
    clickableElement.click();
  });

  return true;
}

async function sendMessageToLead(page, lead) {
  const message = generateCleanPersonalizedMessage(lead);
  const sendUrl = buildSendUrl(lead.phone, message);

  try {
    console.log(`Opening chat for ${lead.name} (${lead.phone})...`);
    await page.goto(sendUrl, { waitUntil: 'domcontentloaded' });
    const chatState = await waitForChatOrUnavailableNumber(page);

    if (chatState.type === 'not-on-whatsapp') {
      console.log(`Skipping ${lead.phone}: not on WhatsApp.`);
      appendLogEntry({
        ...lead,
        status: 'not_on_whatsapp',
        message,
        error: chatState.message,
      });
      return false;
    }

    if (chatState.type !== 'chat-ready') {
      const errorMessage = chatState.message || 'Chat did not become ready.';
      console.error(`Skipping ${lead.phone}: ${errorMessage}`);
      appendLogEntry({
        ...lead,
        status: 'failed',
        message,
        error: errorMessage,
      });
      return false;
    }

    await sleep(randomInt(1500, 3500));

    await addHumanLikeComposerInteraction(page);

    const preSendDelay = randomInt(MIN_PRE_SEND_DELAY_MS, MAX_PRE_SEND_DELAY_MS);
    console.log(`Waiting ${Math.round(preSendDelay / 1000)}s before clicking send...`);
    await sleep(preSendDelay);

    const sent = await clickSendButton(page);

    if (!sent) {
      const errorMessage = 'Send button was not found.';
      console.error(`Skipping ${lead.phone}: ${errorMessage}`);
      appendLogEntry({
        ...lead,
        status: 'failed',
        message,
        error: errorMessage,
      });
      return false;
    }

    await sleep(randomInt(1500, 3000));

    console.log(`Message sent successfully to ${lead.name} (${lead.phone}).`);
    appendLogEntry({
      ...lead,
      status: 'sent',
      message,
      error: '',
    });
    return true;
  } catch (error) {
    const errorMessage = error.message || 'Unknown send error.';
    console.error(`Failed to send message to ${lead.name} (${lead.phone}): ${errorMessage}`);
    appendLogEntry({
      ...lead,
      status: 'failed',
      message,
      error: errorMessage,
    });
    return false;
  }
}

async function waitBetweenMessages() {
  const delayInMinutes = (DELAY_BETWEEN_MESSAGES_MS / 60000).toFixed(2);
  console.log(`Waiting ${delayInMinutes} minutes before the next message...`);
  await sleep(DELAY_BETWEEN_MESSAGES_MS);
}

async function processLeadBatch(page, leads) {
  for (let index = 0; index < leads.length; index += 1) {
    const lead = leads[index];
    await sendMessageToLead(page, lead);

    const isLastLead = index === leads.length - 1;
    if (!isLastLead) {
      await waitBetweenMessages();
    }
  }
}

async function main() {
  console.log('Starting WhatsApp outreach bot');

  const fetchedLeads = await fetchLeads();
  const filteredLeads = filterLeads(fetchedLeads);

  if (filteredLeads.length === 0) {
    console.log('No leads available to message.');
    return;
  }

  const leadsToProcess = filteredLeads.slice(0, DAILY_SEND_LIMIT);
  console.log(`Processing ${leadsToProcess.length} leads this run. Daily limit: ${DAILY_SEND_LIMIT}.`);

  const browser = await createBrowser();

  try {
    const [page] = await browser.pages();

    page.on('console', (message) => {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    });

    await waitForLogin(page);
    console.log('Beginning outreach messaging...');
    await processLeadBatch(page, leadsToProcess);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Bot failed to start:', error);
  process.exit(1);
});

module.exports = {
  fetchLeads,
  filterLeads,
  generatePersonalizedMessage: generateCleanPersonalizedMessage,
};
