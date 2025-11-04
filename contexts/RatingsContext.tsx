
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { RatingsContextType } from '../types';

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}

export const RatingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
        const storedRatings = window.localStorage.getItem('pokemon-ratings');
        return storedRatings ? JSON.parse(storedRatings) : {};
    } catch (error) {
        console.error("Could not parse ratings from localStorage", error);
        return {};
    }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem('pokemon-ratings', JSON.stringify(ratings));
    } catch (error) {
        console.error("Could not save ratings to localStorage", error);
    }
  }, [ratings]);

  const setRating = (pokemonId: number, rating: number) => {
    const numRating = Math.max(0, Math.min(100, Math.round(rating)));
    if (isNaN(numRating)) return;

    setRatings(prevRatings => ({
      ...prevRatings,
      [pokemonId]: numRating,
    }));
  };

  const value = { ratings, setRating };

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
};
