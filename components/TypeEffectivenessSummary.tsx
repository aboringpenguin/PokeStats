import React, { useMemo } from 'react';
import { RatedPokemon, GenerationKey } from '../types';
import { GENERATION_RANGES, GENERATION_ROMAN_NUMERALS } from '../constants';

const RatingHighlightsByGeneration: React.FC<{ ratedPokemon: RatedPokemon[] }> = ({ ratedPokemon }) => {
    const highestRated = useMemo(() => {
        if (ratedPokemon.length === 0) {
            return [];
        }

        const highestPerGen: Record<string, RatedPokemon> = {};

        ratedPokemon.forEach(pokemon => {
            const genKey = GENERATION_ROMAN_NUMERALS[pokemon.generation];
            if (!genKey) return;
            const genName = GENERATION_RANGES[genKey]?.name;
            if (!genName) return;

            if (!highestPerGen[genName] || pokemon.rating > highestPerGen[genName].rating) {
                highestPerGen[genName] = pokemon;
            }
        });
        
        const genOrder = Object.keys(GENERATION_RANGES);

        return Object.values(highestPerGen).sort((a, b) => {
            const genKeyA = GENERATION_ROMAN_NUMERALS[a.generation];
            const genKeyB = GENERATION_ROMAN_NUMERALS[b.generation];
            return genOrder.indexOf(genKeyA) - genOrder.indexOf(genKeyB);
        });

    }, [ratedPokemon]);

    if (highestRated.length === 0) {
        return null;
    }

    return (
        <div className="bg-poke-gray-dark p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-white mb-2">Highest Rated by Generation</h3>
            <p className="text-sm text-gray-400 mb-6">Your top-rated Pokémon from each generation.</p>
            {highestRated.length > 0 ? (
                <ul className="space-y-4">
                    {highestRated.map(p => (
                        <li key={p.id} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-md">
                            <div className="w-12 h-12 bg-gray-900/50 rounded-full flex items-center justify-center">
                                <img src={p.sprite} alt={p.name} className="w-12 h-12" />
                            </div>
                            <div className="flex-1">
                                <p className="capitalize font-semibold text-gray-200">{p.name}</p>
                                <p className="text-sm text-gray-400">{GENERATION_RANGES[GENERATION_ROMAN_NUMERALS[p.generation] as GenerationKey]?.name}</p>
                            </div>
                            <span className="font-bold text-lg text-poke-yellow">{p.rating}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No rated Pokémon to show.</p>
            )}
        </div>
    );
};

export default RatingHighlightsByGeneration;