import { useEffect, useState } from 'react';
import { Globe, Mail, MapPin, MessageCircle, Phone, Radar, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { displayPhone } from '../utils/format';
import { buildWhatsAppUrl } from '../utils/whatsapp';

function BusinessDetailsPage() {
  const { id } = useParams();
  const { authHeaders } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchBusiness() {
      try {
        const { data } = await api.get(`/business/${id}`, authHeaders);
        if (active) {
          setBusiness(data.business);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load business details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchBusiness();

    return () => {
      active = false;
    };
  }, [authHeaders, id]);

  if (loading) {
    return <div className="section-shell py-16 text-slate-400">Loading business details...</div>;
  }

  if (error || !business) {
    return (
      <div className="section-shell py-16">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          {error || 'Business not found.'}
        </div>
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(business);

  return (
    <div className="section-shell py-12 sm:py-16">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {business.industry}
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold">{business.name}</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <MapPin size={16} />
                Location
              </div>
              <p className="text-lg font-medium">
                {business.location}, {business.country}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <Radar size={16} />
                Opportunity Score
              </div>
              <p className="text-lg font-medium">{business.opportunityScore}/100</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <Phone size={16} />
                Contact
              </div>
              <p className="text-lg font-medium">
                {business.contactPhone
                  ? displayPhone(business.contactPhone)
                  : 'No phone number returned by the API'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <Globe size={16} />
              Website Analysis
            </div>
            <p className="leading-8 text-slate-300">{business.websiteAnalysis}</p>
            <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              {business.hasWebsite ? business.websiteUrl : 'No website detected'}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-[32px] p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-accent">
              <Sparkles size={18} />
              Auto-generated pitch
            </div>
            <p className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5 leading-8 text-slate-200">
              {business.pitchMessage}
            </p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-5 w-full gap-2"
              >
                <MessageCircle size={18} />
                Send on WhatsApp
              </a>
            ) : null}
          </div>

          <div className="glass-panel rounded-[32px] p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2 text-accent">
              <Mail size={18} />
              Suggested angle
            </div>
            <p className="leading-8 text-slate-300">
              Lead with the website gap, mention local search credibility, and tie the pitch to
              faster inquiries or better appointment conversion for this business category.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetailsPage;
