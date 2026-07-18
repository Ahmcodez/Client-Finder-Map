function SearchFilters({ filters, onChange }) {
  return (
    <div className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <input
          className="input-base"
          placeholder="Business search, e.g. restaurants"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value, page: 0 })}
        />

        <input
          className="input-base"
          placeholder="Country, e.g. USA"
          value={filters.country}
          onChange={(event) => onChange({ ...filters, country: event.target.value, page: 0 })}
        />
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Results are loaded page by page from SerpAPI. Use Load More to append the next batch of
        businesses without losing the current list.
      </p>
    </div>
  );
}

export default SearchFilters;
