import { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('shivani-recent-searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('shivani-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addToRecent = (term) => {
    if (!term || term.trim() === '') return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 5); // Keep top 5
    });
  };

  const clearRecent = () => setRecentSearches([]);

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      recentSearches, 
      addToRecent, 
      clearRecent 
    }}>
      {children}
    </SearchContext.Provider>
  );
};
