import React, { useState, useMemo } from 'react';
// Fix: Import Pokemon type
import { GenerationKey, Pokemon } from '../types';
import { GENERATION_RANGES } from '../constants';
import GenerationFilter from '../components/GenerationFilter';
import PokemonList from '../components/PokemonList';
import PokeballIcon from '../components/icons/PokeballIcon';
import { usePokemonData } from '../contexts/PokemonDataContext';

const PokedexPage: React.FC = () => {
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationKey>('kanto');
  const { allPokemon, isLoading } = usePokemonData();

  const pokemonList = useMemo(() => {
    if (!allPokemon) return [];
    
    const range = GENERATION_RANGES[selectedGeneration];
    // Fix: Explicitly type 'p' to resolve 'unknown' type error
    const list = Object.values(allPokemon).filter(
      (p: Pokemon) => p.id >= range.start && p.id <= range.end
    );
    // Fix: Explicitly type 'a' and 'b' to resolve 'unknown' type error
    return list.sort((a: Pokemon, b: Pokemon) => a.id - b.id);
  }, [allPokemon, selectedGeneration]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Pokedex</h1>
        <p className="text-poke-gray-light mt-2">Browse Pokémon from your favorite generations.</p>
      </header>

      <GenerationFilter 
        selected={selectedGeneration} 
        onSelect={setSelectedGeneration}
        disabled={isLoading}
      />
      
      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PokeballIcon className="w-16 h-16 text-poke-yellow animate-spin-slow mb-4" />
            <p className="text-xl font-semibold text-poke-gray-light animate-pulse-fast">
              Summoning all 1000+ Pokémon...
            </p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment on the first load.</p>
          </div>
        )}
        {!isLoading && allPokemon && (
          <PokemonList pokemonList={pokemonList} />
        )}
      </div>
    </div>
  );
};

export default PokedexPage;
