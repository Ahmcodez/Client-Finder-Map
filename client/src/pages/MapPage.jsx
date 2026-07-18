import LoadingCard from '../components/LoadingCard';
import MapPanel from '../components/MapPanel';
import SectionHeading from '../components/SectionHeading';
import { useBusinesses } from '../hooks/useBusinesses';

function MapPage() {
  const { allBusinesses, filters, loading, error } = useBusinesses({ limit: 50 });

  return (
    <div className="section-shell py-12 sm:py-16">
      <SectionHeading
        eyebrow="Map View"
        title="See lead clusters geographically"
        description={`Showing SerpAPI results for "${filters.query}" in ${filters.country}.`}
      />

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-10">{loading ? <LoadingCard /> : <MapPanel businesses={allBusinesses} />}</div>
    </div>
  );
}

export default MapPage;
