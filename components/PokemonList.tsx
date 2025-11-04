
import React from 'react';
import { Pokemon } from '../types';
import PokemonRow from './PokemonRow';

interface PokemonListProps {
  pokemonList: Pokemon[];
}

const PokemonList: React.FC<PokemonListProps> = ({ pokemonList }) => {
  if (pokemonList.length === 0) {
    return null; // Or a message indicating no Pokémon found
  }

  return (
    <div className="space-y-2">
      {pokemonList.map((pokemon) => (
        <PokemonRow key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
};

export default PokemonList;
