import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { RatingsContextType } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}

export const RatingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isRatingsLoading, setIsLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ratings')
        .select('item_id, rating_value')
        .eq('user_id', user.id);

      if (error) throw error;

      const ratingsMap = data.reduce((acc, rating) => {
        acc[rating.item_id] = rating.rating_value;
        return acc;
      }, {} as Record<string, number>);

      setRatings(ratingsMap);
    } catch (error: any) {
      console.error("Error fetching ratings:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const setRating = async (pokemonId: number, rating: number) => {
    if (!user) return;

    const numRating = Math.max(0, Math.min(100, Math.round(rating)));
    if (isNaN(numRating)) return;

    // Optimistic update
    const oldRatings = { ...ratings };
    setRatings(prevRatings => ({
      ...prevRatings,
      [pokemonId]: numRating,
    }));

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({ user_id: user.id, item_id: pokemonId, rating_value: numRating }, { onConflict: 'user_id, item_id' });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving rating:", error.message);
      // Revert on error
      setRatings(oldRatings);
    }
  };

  const value = { ratings, setRating, isRatingsLoading };

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
};
