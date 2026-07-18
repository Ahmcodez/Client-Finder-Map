import { Heart, MapPin, MessageCircle, Monitor, Phone, Radar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { displayPhone, scoreTone, websiteLabel } from '../utils/format';
import { buildWhatsAppUrl } from '../utils/whatsapp';

function BusinessCard({ business, onSave, isSaved, showSave = true }) {
  const businessId = business?._id || business?.id || '';
  const industry = business?.industry || 'Business';
  const name = business?.name || 'Unknown business';
  const location = business?.location || business?.address || 'Location unavailable';
  const country = business?.country || 'Unknown country';
  const hasWebsite = Boolean(business?.hasWebsite);
  const opportunityScore = Number.isFinite(Number(business?.opportunityScore))
    ? Number(business.opportunityScore)
    : 0;
  const contactPhone = business?.contactPhone || '';
  const whatsappUrl = buildWhatsAppUrl(business);

  return (
    <motion.div layout whileHover={{ y: -6 }} className="glass-panel relative overflow-hidden rounded-[28px] p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {industry}
          </div>
          <h3 className="font-display text-xl font-semibold">{name}</h3>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={15} />
            <span>
              {location}, {country}
            </span>
          </div>
        </div>
        {showSave ? (
          <button
            className={`rounded-2xl border p-3 transition ${
              isSaved
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            onClick={() => onSave?.(businessId)}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Monitor size={15} />
            Website Status
          </div>
          <p>{websiteLabel(hasWebsite)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Radar size={15} />
            Opportunity Score
          </div>
          <p
            className={`inline-flex rounded-full bg-gradient-to-r ${scoreTone(opportunityScore)} px-3 py-1 font-semibold text-slate-950`}
          >
            {opportunityScore}/100
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Phone size={15} />
            Contact
          </div>
          {contactPhone ? (
            <a href={`tel:${contactPhone}`} className="text-slate-100 hover:text-accent">
              {displayPhone(contactPhone)}
            </a>
          ) : (
            <p className="text-slate-500">No phone number returned by the API</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
          <Sparkles size={15} className="text-accent" />
          Warm outreach pitch ready
        </div>
        <div className="flex flex-wrap gap-2">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary gap-2 px-4 py-2 text-sm"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          ) : null}
          {businessId ? (
            <Link to={`/business/${businessId}`} className="btn-primary px-4 py-2 text-sm">
              View Details
            </Link>
          ) : (
            <span className="btn-primary pointer-events-none px-4 py-2 text-sm opacity-50">
              View Details
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default BusinessCard;
