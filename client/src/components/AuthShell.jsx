import { Link } from 'react-router-dom';
import GradientOrb from './GradientOrb';

function AuthShell({ title, subtitle, children, footerLabel, footerLink, footerText }) {
  return (
    <div className="relative overflow-hidden">
      <GradientOrb className="left-0 top-12 h-44 w-44 bg-neon/30" />
      <GradientOrb className="right-10 top-24 h-52 w-52 bg-glow/30" />
      <div className="section-shell flex min-h-[calc(100vh-5rem)] items-center justify-center py-16">
        <div className="glass-panel relative w-full max-w-lg rounded-[32px] p-8 sm:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent">Welcome back</p>
          <h1 className="font-display text-4xl font-bold">{title}</h1>
          <p className="mt-4 text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-slate-400">
            {footerText}{' '}
            <Link to={footerLink} className="font-semibold text-accent">
              {footerLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
