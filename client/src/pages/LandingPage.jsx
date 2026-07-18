import { motion } from 'framer-motion';
import {
  ArrowRight,
  Globe2,
  MailPlus,
  MapPinned,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import GradientOrb from '../components/GradientOrb';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import TestimonialCard from '../components/TestimonialCard';

const features = [
  {
    icon: Globe2,
    title: 'Spot businesses with no website',
    description:
      'Filter by location and instantly surface leads that still rely only on directories, social pages, or outdated digital footprints.',
  },
  {
    icon: ScanSearch,
    title: 'Score high-intent opportunities',
    description:
      'Opportunity scoring highlights leads most likely to need a redesign, a fresh landing page, or a full conversion-focused website.',
  },
  {
    icon: MailPlus,
    title: 'Pitch faster with AI-ready outreach',
    description:
      'Generate a usable cold intro for every lead so you can personalize and send proposals without starting from a blank page.',
  },
  {
    icon: MapPinned,
    title: 'Explore leads on an interactive map',
    description:
      'Move between dashboard lists and map markers to discover dense pockets of potential clients across the USA, UK, and Europe.',
  },
];

const testimonials = [
  {
    quote:
      'I used it to build a London bakery lead list in one evening and booked two discovery calls the same week.',
    name: 'Amina Shah',
    role: 'Freelance Web Designer',
  },
  {
    quote:
      'The opportunity score saved me from random prospecting. I focused on high-need businesses and my replies improved fast.',
    name: 'Daniel Brooks',
    role: 'Solo Developer, Manchester',
  },
  {
    quote:
      'This feels like a SaaS built for outreach, not just another business directory clone.',
    name: 'Rita Kovacs',
    role: 'Agency Founder, Budapest',
  },
];

function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <GradientOrb className="-left-16 top-20 h-56 w-56 bg-neon/30" />
      <GradientOrb className="right-0 top-40 h-72 w-72 bg-glow/30" />
      <GradientOrb className="bottom-0 left-1/3 h-56 w-56 bg-accent/20" />

      <section className="section-shell relative pb-20 pt-16 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              <Sparkles size={16} className="text-accent" />
              Premium lead discovery for freelance developers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 max-w-4xl font-display text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl"
            >
              Find Clients Anywhere in the World
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              Discover local businesses that need modern websites, shortlist the highest-potential
              leads, and launch outreach from one polished workflow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/signup" className="btn-primary gap-2">
                Start khojing Clients
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Preview Dashboard
              </Link>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Leads Tracked"
                value="24K+"
                hint="Across local service industries"
              />
              <StatCard
                label="Avg. Response Lift"
                value="+31%"
                hint="When pitches are personalized"
              />
              <StatCard label="Markets Covered" value="USA / UK / EU" hint="Built for global prospecting" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel glow-ring relative overflow-hidden rounded-[36px] p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-grid bg-[size:22px_22px] opacity-20" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div>
                  <p className="text-sm text-slate-400">Hot Lead Cluster</p>
                  <p className="mt-2 font-display text-2xl font-bold">West London Cafes</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm text-emerald-300">
                  92 score avg
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">No website</p>
                  <h3 className="mt-3 font-display text-4xl font-bold">14</h3>
                  <p className="mt-2 text-sm text-slate-500">Ready for a first web presence</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Outdated website</p>
                  <h3 className="mt-3 font-display text-4xl font-bold">29</h3>
                  <p className="mt-2 text-sm text-slate-500">Strong redesign potential</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Auto Pitch Preview</p>
                    <h4 className="mt-2 font-semibold">Bayside Dental Studio</h4>
                  </div>
                  <div className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                    Ready to send
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Hi, I noticed your dental practice could benefit from a faster and more modern
                  website that helps new patients trust you sooner and book appointments more
                  easily.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
                <ShieldCheck size={18} className="text-accent" />
                Curated for dev freelancers, consultants, and boutique web agencies.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading
          eyebrow="Features"
          title="A workflow built for real prospecting, not just browsing"
          description="Every screen is designed to help you go from discovery to outreach with less friction and better targeting."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading
          eyebrow="Testimonials"
          title="Freelancers use it to create momentum quickly"
          description="Dummy social proof UI for the SaaS experience, ready to be replaced with live customer stories later."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
