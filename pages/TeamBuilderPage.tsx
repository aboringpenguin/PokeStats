import React, { useRef, useState, useMemo } from 'react';
import { useTeam } from '../contexts/TeamContext';
import { Pokemon, Team, GenerationKey } from '../types';
import { TYPE_COLORS, GENERATION_RANGES } from '../constants';
import RadarChart from '../components/RadarChart';
import TeamManager from '../components/TeamManager';
import { usePokemonData } from '../contexts/PokemonDataContext';
import GenerationFilter from '../components/GenerationFilter';
import PokeballIcon from '../components/icons/PokeballIcon';

// This is a browser-only library, so we need to declare it for TypeScript
declare const domtoimage: any;

const TeamMemberCard: React.FC<{ pokemon: Pokemon; onRemove: (id: number) => void }> = ({ pokemon, onRemove }) => (
    <div className="bg-poke-gray-dark rounded-xl p-4 relative shadow-lg flex items-center gap-4 transition-all duration-300 hover:shadow-yellow-500/20 hover:-translate-y-1">
        <button 
            onClick={() => onRemove(pokemon.id)} 
            className="absolute top-[-8px] right-[-8px] w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold hover:bg-red-600 transition-transform duration-200 hover:scale-110 z-10"
            aria-label={`Remove ${pokemon.name} from team`}
        >
            <span className="mb-0.5">&times;</span>
        </button>
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center flex-shrink-0">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold capitalize text-white truncate">{pokemon.name}</h3>
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                {pokemon.types.map((type) => (
                    <span
                        key={type}
                        className="px-2.5 py-0.5 text-xs font-bold text-white rounded-full capitalize shadow-md"
                        style={{ backgroundColor: TYPE_COLORS[type] || '#A8A77A' }}
                    >
                        {type}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

interface AddPokemonCardProps {
  pokemon: Pokemon;
  onAdd: (pokemon: Pokemon) => void;
  isAdded: boolean;
  isTeamFull: boolean;
}

const AddPokemonCard: React.FC<AddPokemonCardProps> = ({ pokemon, onAdd, isAdded, isTeamFull }) => {
  const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAdd(pokemon);
  };
  
  const buttonDisabled = isAdded || (!isAdded && isTeamFull);
  
  let buttonText = 'Add';
  if (isAdded) {
      buttonText = 'On Team';
  } else if (isTeamFull) {
      buttonText = 'Full';
  }

  return (
    <div className="bg-poke-gray-dark rounded-lg p-3 flex items-center gap-3 shadow-md transition-colors hover:bg-gray-700">
        <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center flex-shrink-0">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-md font-bold capitalize text-white truncate">{pokemon.name}</p>
            <div className="flex items-center gap-1 mt-1">
                {pokemon.types.map(type => (
                     <span
                        key={type}
                        className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full capitalize"
                        style={{ backgroundColor: TYPE_COLORS[type] || '#A8A77A' }}
                    >
                        {type}
                    </span>
                ))}
            </div>
        </div>
        <button 
            onClick={handleAdd}
            disabled={buttonDisabled}
            className="px-3 py-1.5 font-semibold text-sm rounded-md transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-poke-blue text-white hover:bg-blue-600"
            aria-label={`Add ${pokemon.name} to team`}
        >
            {buttonText}
        </button>
    </div>
  );
};


const TeamBuilderPage: React.FC = () => {
  const { activeTeam, removePokemonFromTeam, addPokemonToTeam } = useTeam();
  const snapshotRef = useRef<HTMLDivElement>(null);

  const { allPokemon, isLoading: isPokemonLoading } = usePokemonData();
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationKey>('kanto');
  const [searchTerm, setSearchTerm] = useState('');

  const pokemonList = useMemo(() => {
    if (!allPokemon) return [];
    
    const range = GENERATION_RANGES[selectedGeneration];
    const pokemonInGeneration = Object.values(allPokemon).filter(
        (p: Pokemon) => p.id >= range.start && p.id <= range.end
    );
    
    // Fix: Explicitly type 'a' and 'b' to resolve 'unknown' type error.
    const sortedList = pokemonInGeneration.sort((a: Pokemon, b: Pokemon) => a.id - b.id);

    if (!searchTerm) return sortedList;

    // Fix: Explicitly type 'p' to resolve 'unknown' type error.
    return sortedList.filter((p: Pokemon) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPokemon, selectedGeneration, searchTerm]);

  const teamMemberIds = useMemo(() => 
    new Set(activeTeam?.members.map(p => p.id)),
    [activeTeam?.members]
  );
  
  const isTeamFull = (activeTeam?.members.length ?? 0) >= 6;

  const teamStats = React.useMemo(() => {
    if (!activeTeam || activeTeam.members.length === 0) {
      return { hp: 0, attack: 0, defense: 0, sp_atk: 0, sp_def: 0, speed: 0 };
    }
    const total = activeTeam.members.reduce((acc, p) => {
        acc.hp += p.stats.hp;
        acc.attack += p.stats.attack;
        acc.defense += p.stats.defense;
        acc.sp_atk += p.stats.sp_atk;
        acc.sp_def += p.stats.sp_def;
        acc.speed += p.stats.speed;
        return acc;
    }, { hp: 0, attack: 0, defense: 0, sp_atk: 0, sp_def: 0, speed: 0 });

    return {
        hp: Math.round(total.hp / activeTeam.members.length),
        attack: Math.round(total.attack / activeTeam.members.length),
        defense: Math.round(total.defense / activeTeam.members.length),
        sp_atk: Math.round(total.sp_atk / activeTeam.members.length),
        sp_def: Math.round(total.sp_def / activeTeam.members.length),
        speed: Math.round(total.speed / activeTeam.members.length),
    };
  }, [activeTeam]);
  
  const handleSnapshot = () => {
    const element = snapshotRef.current;
    if (!element) return;

    domtoimage.toJpeg(element, {
      bgcolor: '#212121',
      quality: 0.95,
    }).then((dataUrl: string) => {
      const link = document.createElement('a');
      link.download = `${activeTeam?.name || 'pokemon-team'}-snapshot.jpeg`;
      link.href = dataUrl;
      link.click();
    }).catch((error: any) => {
        console.error('Snapshot failed:', error);
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <header className="text-center mb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-poke-yellow tracking-tight">Team Builder</h1>
        <p className="text-poke-gray-light mt-2">Assemble and analyze your Pokémon teams.</p>
      </header>
      
      <TeamManager />
      
      {!activeTeam ? (
        <div className="text-center py-16 bg-poke-gray-dark rounded-lg">
            <p className="text-xl text-gray-400">No active team.</p>
            <p className="mt-2 text-gray-500">Create a new team or select an existing one to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Team View & Snapshot */}
            <div className="lg:col-span-2">
                <div ref={snapshotRef} className="p-0 sm:p-4">
                    <div className="p-4 bg-poke-gray-darkest">
                        <h2 className="text-4xl font-bold text-white mb-8 text-center capitalize">{activeTeam.name}</h2>
                        {activeTeam.members.length === 0 ? (
                            <div className="text-center py-12 bg-poke-gray-dark rounded-lg">
                                <p className="text-lg text-gray-400">This team is empty.</p>
                                <p className="mt-1 text-gray-500">Use the browser on the right to add Pokémon.</p>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-5 gap-8 items-stretch">
                                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {activeTeam.members.map(p => <TeamMemberCard key={p.id} pokemon={p} onRemove={removePokemonFromTeam} />)}
                                    {[...Array(6 - activeTeam.members.length)].map((_, i) => (
                                        <div key={`placeholder-${i}`} className="bg-poke-gray-dark/50 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center h-full min-h-[112px]">
                                            <span className="text-gray-500">Empty Slot</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="lg:col-span-2 bg-poke-gray-dark p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
                                    <h3 className="text-2xl font-bold text-white mb-4 text-center">Team Stats</h3>
                                    <p className="text-sm text-gray-400 mb-6 text-center">Average base stats for your team.</p>
                                    <RadarChart stats={teamStats} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {activeTeam.members.length > 0 && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={handleSnapshot}
                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors"
                        >
                            Generate Snapshot
                        </button>
                    </div>
                )}
            </div>
            
            {/* Right Column: Pokemon Browser */}
            <div className="lg:col-span-1 bg-poke-gray-dark p-4 rounded-xl shadow-lg sticky top-24">
                 <h3 className="text-xl font-bold text-white mb-4">Add Pokémon</h3>
                 <div className="space-y-4">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Pokémon..."
                        className="w-full bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
                    />
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                        <GenerationFilter 
                            selected={selectedGeneration}
                            onSelect={setSelectedGeneration}
                            disabled={isPokemonLoading}
                        />
                    </div>
                    <div className="h-[50vh] min-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {isPokemonLoading ? (
                             <div className="flex flex-col items-center justify-center p-12 text-center">
                                <PokeballIcon className="w-12 h-12 text-poke-yellow animate-spin-slow mb-4" />
                                <p className="text-md font-semibold text-poke-gray-light">Loading Pokémon...</p>
                            </div>
                        ) : (
                            pokemonList.map(p => (
                                <AddPokemonCard 
                                    key={p.id}
                                    pokemon={p}
                                    onAdd={addPokemonToTeam}
                                    isAdded={teamMemberIds.has(p.id)}
                                    isTeamFull={isTeamFull}
                                />
                            ))
                        )}
                         {!isPokemonLoading && pokemonList.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-400">No Pokémon found.</p>
                            </div>
                         )}
                    </div>
                 </div>
            </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #424242; /* poke-gray-dark */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFCA28; /* poke-yellow */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FBC02D;
        }
      `}</style>
    </div>
  );
};

export default TeamBuilderPage;