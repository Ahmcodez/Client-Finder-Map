import { useEffect, useState } from 'react';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import SectionHeading from '../components/SectionHeading';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function SavedLeadsPage() {
  const { authHeaders, refreshUser } = useAuth();
  const [savedLeads, setSavedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchSavedLeads() {
    try {
      setLoading(true);
      const { data } = await api.get('/users/saved', authHeaders);
      setSavedLeads(data.savedLeads);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load saved leads.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedLeads();
  }, []);

  const handleRemove = async (businessId) => {
    try {
      await api.delete(`/business/${businessId}/save`, authHeaders);
      await refreshUser();
      await fetchSavedLeads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="section-shell py-12 sm:py-16">
      <SectionHeading
        eyebrow="Saved Leads"
        title="Your favorite opportunities, ready for outreach"
        description="Keep a short, high-quality pipeline of businesses you want to approach next."
      />

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <LoadingCard key={index} />)
          : savedLeads.map((business) => (
              <BusinessCard
                key={business._id}
                business={business}
                onSave={handleRemove}
                isSaved
              />
            ))}
      </div>

      {!loading && savedLeads.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No saved leads yet"
            description="Use the dashboard to bookmark businesses you want to contact first."
          />
        </div>
      ) : null}
    </div>
  );
}

export default SavedLeadsPage;
