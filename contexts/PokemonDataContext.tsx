
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Pokemon, PokemonDataContextType } from '../types';

const PokemonDataContext = createContext<PokemonDataContextType | undefined>(undefined);

export function usePokemonData() {
  const context = useContext(PokemonDataContext);
  if (context === undefined) {
    throw new Error('usePokemonData must be used within a PokemonDataProvider');
  }
  return context;
}

const ALL_POKEMON_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0';

export const PokemonDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allPokemon, setAllPokemon] = useState<Record<string, Pokemon> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllPokemon() {
      try {
        const res = await fetch(ALL_POKEMON_URL);
        const listData = await res.json();

        const detailPromises = listData.results.map((p: { url: string }) => fetch(p.url).then(res => res.json()));
        const detailedData = await Promise.all(detailPromises);
        
        const speciesPromises = detailedData.map(p => fetch(p.species.url).then(res => res.json()));
        const speciesData = await Promise.all(speciesPromises);

        const pokemonMap: Record<string, Pokemon> = {};
        for (let i = 0; i < detailedData.length; i++) {
            const p = detailedData[i];
            const s = speciesData[i];
            pokemonMap[p.id] = {
                id: p.id,
                name: p.name,
                sprite: p.sprites.other['official-artwork'].front_default || p.sprites.front_default,
                types: p.types.map((typeInfo: any) => typeInfo.type.name),
                generation: s.generation.name.replace('generation-', ''),
                stats: {
                    hp: p.stats[0].base_stat,
                    attack: p.stats[1].base_stat,
                    defense: p.stats[2].base_stat,
                    sp_atk: p.stats[3].base_stat,
                    sp_def: p.stats[4].base_stat,
                    speed: p.stats[5].base_stat,
                },
            };
        }
        setAllPokemon(pokemonMap);
      } catch (err) {
        console.error("Failed to fetch all Pokémon data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllPokemon();
  }, []);

  const value = { allPokemon, isLoading };

  return <PokemonDataContext.Provider value={value}>{children}</PokemonDataContext.Provider>;
};
