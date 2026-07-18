import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import SearchFilters from '../components/SearchFilters';
import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../context/AuthContext';
import { useBusinesses } from '../hooks/useBusinesses';
import api from '../services/api';

function DashboardPage() {
  const { authHeaders, refreshUser, user } = useAuth();
  const { businesses, pagination, loading, loadingMore, error, filters, setFilters, source, hasMore, loadMore } =
    useBusinesses();
  const [saveLoading, setSaveLoading] = useState('');
  const savedIds = useMemo(() => new Set(user?.savedLeads || []), [user?.savedLeads]);

  const handleSaveLead = async (businessId) => {
    try {
      setSaveLoading(businessId);
      if (savedIds.has(businessId)) {
        await api.delete(`/business/${businessId}/save`, authHeaders);
      } else {
        await api.post(`/business/${businessId}/save`, {}, authHeaders);
      }
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading('');
    }
  };

  return (
    <div className="section-shell py-12 sm:py-16">
      <SectionHeading
        eyebrow="Dashboard"
        title="Search real Google Maps businesses with SerpAPI"
        description="Run a live search by business type and country, then focus on the leads with the biggest website opportunity."
      />

      <div className="mt-10">
        <SearchFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <Sparkles size={15} className="text-accent" />
          {pagination.total} {pagination.total === 1 ? 'lead' : 'leads'} discovered
        </div>
        <div className="text-sm text-slate-400">Source: {source || 'searching...'}</div>
        <div className="text-sm text-slate-400">Loaded through page {pagination.page}</div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: filters.limit }).map((_, index) => <LoadingCard key={index} />)
          : businesses.map((business, index) => {
              const businessId =
                business?._id ||
                business?.id ||
                business?.dataId ||
                business?.placeId ||
                `business-${index}`;

              return (
                <div key={businessId} className={saveLoading === businessId ? 'opacity-70' : ''}>
                  <BusinessCard
                    business={business}
                    isSaved={savedIds.has(businessId)}
                    onSave={handleSaveLead}
                  />
                </div>
              );
            })}
      </div>

      {!loading && businesses.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No businesses found"
            description="Try a different query or country. Businesses will appear here whenever the API returns any results."
          />
        </div>
      ) : null}

      {businesses.length > 0 ? (
        <div className="mt-10 flex items-center justify-center">
          <button
            className="btn-secondary min-w-[160px]"
            disabled={loading || loadingMore || !hasMore}
            onClick={loadMore}
          >
            {loadingMore ? 'Loading more...' : hasMore ? 'Load More' : 'No More Results'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardPage;
