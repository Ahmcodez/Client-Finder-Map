import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LAST_SEARCH_STORAGE_KEY = 'cfm_last_search';
const MAX_DISPLAY_BUSINESSES = 12;

const defaultFilters = {
  query: 'restaurants',
  country: 'USA',
  websiteStatus: 'no-website',
  page: 0,
  limit: MAX_DISPLAY_BUSINESSES,
};

function normalizeBusinessesResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.businesses)) {
    return response.businesses;
  }

  return [];
}

export function useBusinesses(initialFilters = {}) {
  const { authHeaders } = useAuth();
  const [filters, setFilters] = useState(() => {
    const storedSearch =
      typeof window !== 'undefined' ? window.localStorage.getItem(LAST_SEARCH_STORAGE_KEY) : null;

    if (!storedSearch) {
      return { ...defaultFilters, ...initialFilters };
    }

    try {
      const parsedSearch = JSON.parse(storedSearch);
      return {
        ...defaultFilters,
        query: parsedSearch.query || defaultFilters.query,
        country: parsedSearch.country || defaultFilters.country,
        ...initialFilters,
      };
    } catch {
      return { ...defaultFilters, ...initialFilters };
    }
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let active = true;
    const query = filters.query.trim();
    const country = filters.country.trim();

    if (!query || !country) {
      setSearchResults([]);
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
      return () => {
        active = false;
      };
    }

    async function fetchBusinesses() {
      try {
        if (filters.page === 0) {
          setLoading(true);
          setHasMore(true);
        } else {
          setLoadingMore(true);
        }

        setError('');
        const { data: response } = await api.get('/business/search', {
          ...authHeaders,
          params: {
            query,
            country,
            page: filters.page,
            limit: filters.limit,
          },
        });

        if (active) {
          const nextBusinesses = normalizeBusinessesResponse(response);

          setSearchResults((previousBusinesses) => {
            if (filters.page === 0) {
              return nextBusinesses;
            }

            const mergedBusinesses = [...previousBusinesses];
            const seenIds = new Set(
              previousBusinesses.map(
                (business, index) =>
                  business?._id || business?.id || business?.dataId || business?.placeId || `business-${index}`
              )
            );

            for (const business of nextBusinesses) {
              const businessId =
                business?._id ||
                business?.id ||
                business?.dataId ||
                business?.placeId ||
                `${business?.name || 'business'}-${business?.address || ''}`;

              if (seenIds.has(businessId)) {
                continue;
              }

              seenIds.add(businessId);
              mergedBusinesses.push(business);
            }

            return mergedBusinesses;
          });

          setSource(response.source || '');
          setHasMore(Boolean(response.hasMore) && nextBusinesses.length > 0);

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              LAST_SEARCH_STORAGE_KEY,
              JSON.stringify({ query, country })
            );
          }
        }
      } catch (err) {
        if (active) {
          if (filters.page === 0) {
            setSearchResults([]);
          }
          setError(err.response?.data?.message || 'Unable to load businesses right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    const timeoutId = window.setTimeout(fetchBusinesses, 400);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [authHeaders, filters.country, filters.limit, filters.page, filters.query]);

  const filteredBusinesses = useMemo(() => searchResults, [searchResults]);

  const pagination = useMemo(() => {
    const total = filteredBusinesses.length;

    return {
      total,
      page: filters.page,
      pages: hasMore ? filters.page + 2 : filters.page + 1,
    };
  }, [filteredBusinesses.length, filters.page, hasMore]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    setFilters((currentFilters) => ({
      ...currentFilters,
      page: currentFilters.page + 1,
    }));
  };

  return {
    businesses: filteredBusinesses,
    allBusinesses: filteredBusinesses,
    pagination,
    loading,
    loadingMore,
    error,
    source,
    hasMore,
    loadMore,
    filters,
    setFilters,
  };
}
