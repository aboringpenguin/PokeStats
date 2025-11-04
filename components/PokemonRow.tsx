import React, { useState, useEffect } from 'react';
import { Pokemon } from '../types';
import { TYPE_COLORS } from '../constants';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { useRatings } from '../contexts/RatingsContext';
import { useTeam } from '../contexts/TeamContext';

interface PokemonRowProps {
  pokemon: Pokemon;
}

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="w-full">
        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
            <span>{label.toUpperCase()}</span>
            <span>{value}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{ width: `${(value / 255) * 100}%`, backgroundColor: color }}></div>
        </div>
    </div>
);


const PokemonRow: React.FC<PokemonRowProps> = ({ pokemon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ratings, setRating } = useRatings();
  const { activeTeam, addPokemonToTeam } = useTeam();

  const currentRating = ratings[pokemon.id];
  const [localRating, setLocalRating] = useState(currentRating?.toString() ?? '');

  useEffect(() => {
    setLocalRating(ratings[pokemon.id]?.toString() ?? '');
  }, [ratings, pokemon.id]);

  const handleSaveRating = () => {
    const value = parseInt(localRating, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setRating(pokemon.id, value);
    } else {
      setLocalRating(currentRating?.toString() ?? '');
    }
  };
  
  const isOnTeam = activeTeam?.members.some(p => p.id === pokemon.id) ?? false;

  return (
    <div className="bg-poke-gray-dark rounded-lg shadow-md transition-all duration-300 ease-in-out mb-2">
      <div
        className="flex items-center p-4 cursor-pointer hover:bg-gray-700 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`details-${pokemon.id}`}
      >
        <div className="flex-shrink-0 w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16" />
        </div>
        <div className="flex-1 min-w-0 ml-4">
            <p className="text-lg font-bold capitalize truncate text-white">{pokemon.name}</p>
            <p className="text-sm text-gray-400">#{String(pokemon.id).padStart(4, '0')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="px-3 py-1 text-xs font-bold text-white rounded-full capitalize"
              style={{ backgroundColor: TYPE_COLORS[type] || '#A8A77A' }}
            >
              {type}
            </span>
          ))}
        </div>
         {currentRating !== undefined && (
            <div className="flex items-center gap-1 ml-4" title={`Your rating: ${currentRating}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-lg text-white">{currentRating}</span>
            </div>
        )}
        <div className="ml-auto pl-4">
            <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div id={`details-${pokemon.id}`} className="border-t border-gray-700 p-4 md:p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
                 <div className="w-32 h-32 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <img src={pokemon.sprite} alt={pokemon.name} className="w-32 h-32 scale-125" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    {pokemon.types.map((type) => (
                        <span
                        key={type}
                        className="px-3 py-1 text-sm font-bold text-white rounded-full capitalize"
                        style={{ backgroundColor: TYPE_COLORS[type] || '#A8A77A' }}
                        >
                        {type}
                        </span>
                    ))}
                </div>
            </div>

            <div className="md:col-span-1">
                <h4 className="text-xl font-semibold mb-4 text-white text-center md:text-left">Base Stats</h4>
                <div className="space-y-3">
                    <StatBar label="HP" value={pokemon.stats.hp} color="#EF5350" />
                    <StatBar label="Attack" value={pokemon.stats.attack} color="#FF9800" />
                    <StatBar label="Defense" value={pokemon.stats.defense} color="#FFCA28" />
                    <StatBar label="Sp. Atk" value={pokemon.stats.sp_atk} color="#2196F3" />
                    <StatBar label="Sp. Def" value={pokemon.stats.sp_def} color="#4CAF50" />
                    <StatBar label="Speed" value={pokemon.stats.speed} color="#9C27B0" />
                </div>
            </div>
            
            <div className="md:col-span-1 space-y-6">
                <div>
                    <h4 className="text-xl font-semibold mb-2 text-white">Rate this Pokémon</h4>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={localRating}
                            onChange={(e) => setLocalRating(e.target.value)}
                            onBlur={handleSaveRating}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRating()}
                            placeholder="0-100"
                            className="w-24 bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Rate ${pokemon.name}`}
                        />
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleSaveRating(); }}
                            className="px-4 py-2 bg-poke-blue text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-xl font-semibold mb-2 text-white">Team Builder</h4>
                    <button
                        onClick={(e) => { e.stopPropagation(); addPokemonToTeam(pokemon); }}
                        disabled={!activeTeam || isOnTeam || (activeTeam?.members.length ?? 0) >= 6}
                        className="w-full px-4 py-2 font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-poke-red text-white hover:bg-red-600"
                    >
                        {isOnTeam ? 'On Active Team' : 'Add to Active Team'}
                    </button>
                     {!activeTeam && <p className="text-xs text-yellow-400 mt-1 text-center">Create or select a team first.</p>}
                    {activeTeam && activeTeam.members.length >= 6 && !isOnTeam && <p className="text-xs text-red-400 mt-1 text-center">Active team is full.</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PokemonRow;