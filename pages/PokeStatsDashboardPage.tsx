import React, { useMemo, useState, useRef } from 'react';
import { usePokemonData } from '../contexts/PokemonDataContext';
import { useRatings } from '../contexts/RatingsContext';
import { Pokemon, GenerationKey } from '../types';
import PokeballIcon from '../components/icons/PokeballIcon';
import { GENERATION_RANGES, TYPE_COLORS } from '../constants';

// This is a browser-only library, so we need to declare it for TypeScript
declare const domtoimage: any;

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, suffix }) => {
    return (
        <div className="bg-poke-gray-dark/50 p-6 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white">
                {value}<span className="text-2xl text-gray-300">{suffix}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
    );
};


type RatedPokemon = Pokemon & { rating: number };

interface TypeRatingBarsProps {
    ratedPokemon: RatedPokemon[];
}

const TypeRatingBars: React.FC<TypeRatingBarsProps> = ({ ratedPokemon }) => {
    const averageRatingsByType = useMemo(() => {
        const typeData: Record<string, { total: number; count: number }> = {};
        ratedPokemon.forEach(p => {
            p.types.forEach(type => {
                if (!typeData[type]) {
                    typeData[type] = { total: 0, count: 0 };
                }
                typeData[type].total += p.rating;
                typeData[type].count += 1;
            });
        });

        const result: { type: string; average: number; color: string }[] = [];
        for (const type in typeData) {
            result.push({
                type,
                average: typeData[type].total / typeData[type].count,
                color: TYPE_COLORS[type] || '#A8A77A',
            });
        }
        return result.sort((a, b) => b.average - a.average);
    }, [ratedPokemon]);

    if (averageRatingsByType.length === 0) {
        return null;
    }

    return (
        <div className="bg-poke-gray-dark/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Average Rating by Type</h3>
            <div className="space-y-3">
                {averageRatingsByType.map(({ type, average, color }) => (
                    <div key={type} className="w-full">
                        <div className="flex justify-between text-sm font-semibold text-gray-300 mb-1">
                            <span className="capitalize">{type}</span>
                            <span>{average.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div 
                                className="h-4 rounded-full transition-all duration-500 ease-out"
                                style={{ 
                                    width: `${average}%`, 
                                    backgroundColor: color 
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RatedPokemonList: React.FC<{ title: string; pokemonList: RatedPokemon[] }> = ({ title, pokemonList }) => (
    <div className="bg-poke-gray-dark/50 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        {pokemonList.length === 0 ? (
            <p className="text-gray-400">No rated Pokémon in this category.</p>
        ) : (
            <ul className="space-y-3">
                {pokemonList.map(p => (
                    <li key={p.id} className="flex items-center gap-4 bg-gray-800/50 p-2 rounded-md">
                        <div className="w-12 h-12 bg-gray-900/50 rounded-full flex items-center justify-center">
                            <img src={p.sprite} alt={p.name} className="w-12 h-12" />
                        </div>
                        <span className="capitalize font-semibold flex-1 text-gray-200">{p.name}</span>
                        <span className="font-bold text-lg text-poke-yellow">{p.rating}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const RatingDistributionChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const maxValue = Math.max(...(Object.values(data) as number[]));
    const labels = Object.keys(data);
    return (
        <div className="bg-poke-gray-dark/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">Rating Distribution</h3>
            <div className="flex items-end justify-between gap-2 h-64 px-4">
                {labels.map((label, index) => (
                    <div key={label} className="flex flex-col items-center flex-1 h-full" title={`${label}: ${data[label]}`}>
                        <span className="text-sm font-bold text-white mb-1">{data[label]}</span>
                        <div className="w-full h-full flex items-end">
                            <div
                                className="w-full rounded-t-md bg-purple-500 hover:bg-purple-400 transition-colors"
                                style={{ height: `${(data[label] / (maxValue || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-400 mt-2">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const PokeStatsDashboardPage: React.FC = () => {
    const { allPokemon, isLoading } = usePokemonData();
    const { ratings } = useRatings();
    const [trainerName, setTrainerName] = useState('');
    const [genFilter, setGenFilter] = useState<GenerationKey | 'all'>('all');
    const snapshotRef = useRef<HTMLDivElement>(null);

    const filteredRatedList = useMemo<RatedPokemon[]>(() => {
        if (!allPokemon || !ratings) return [];
        const rated = Object.keys(ratings).map(id => ({
            ...allPokemon[id],
            rating: ratings[id],
        })).filter(p => p.name);

        if (genFilter === 'all') return rated;

        const range = GENERATION_RANGES[genFilter];
        return rated.filter(p => p.id >= range.start && p.id <= range.end);
    }, [allPokemon, ratings, genFilter]);
    
    const stats = useMemo(() => {
        const count = filteredRatedList.length;
        if (count === 0) return { avg: 0, total: 0 };
        const totalRating = filteredRatedList.reduce((sum, p) => sum + p.rating, 0);
        return {
            avg: (totalRating / count).toFixed(1),
            total: count,
        };
    }, [filteredRatedList]);

    const topRated = useMemo(() => {
        return [...filteredRatedList].sort((a, b) => b.rating - a.rating || a.id - b.id).slice(0, 5);
    }, [filteredRatedList]);

    const bottomRated = useMemo(() => {
        const sorted = [...filteredRatedList].sort((a, b) => a.rating - b.rating || a.id - b.id);
        if (sorted.length <= 5) {
            return sorted.filter(p => p.rating < 75);
        }
        return sorted.slice(0, 5);
    }, [filteredRatedList]);

    const distributionData = useMemo(() => {
        const bins: Record<string, number> = {
            '0-9': 0, '10-19': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, 
            '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0
        };
        filteredRatedList.forEach(p => {
            const bin = Math.floor(p.rating / 10);
            
            if (bin >= 9) {
                bins['90-100']++;
            } else {
                 const keyIndex = Math.max(0, bin);
                const binKey = `${keyIndex}0-${keyIndex}9`;
                if (bins.hasOwnProperty(binKey)) {
                    bins[binKey]++;
                }
            }
        });
        return bins;
    }, [filteredRatedList]);

    const handleSnapshot = () => {
        const element = snapshotRef.current;
        if (!element) return;

        domtoimage.toJpeg(element, { 
            bgcolor: '#212121', // Match poke-gray-darkest
            quality: 0.95,
        }).then((dataUrl: string) => {
            const link = document.createElement('a');
            link.download = `${trainerName.replace(/\s+/g, '_') || 'trainer'}-pokestats.jpeg`;
            link.href = dataUrl;
            link.click();
        }).catch((error: any) => {
            console.error('Snapshot failed:', error);
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <PokeballIcon className="w-16 h-16 text-poke-yellow animate-spin-slow mb-4" />
              <p className="text-xl font-semibold text-poke-gray-light">Loading Pokémon Data...</p>
            </div>
        );
    }
    
    return (
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-poke-yellow tracking-tight">Your PokéStats</h1>
          <p className="text-poke-gray-light mt-2 max-w-2xl mx-auto">An analysis of your Pokémon ratings. Create a snapshot to share your trainer profile!</p>
        </header>

        <div className="bg-poke-gray-dark/50 p-4 rounded-lg mb-8 flex flex-wrap items-center justify-center gap-4">
            <input 
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Enter Trainer Name"
                className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
            />
            <select
                value={genFilter}
                onChange={(e) => setGenFilter(e.target.value as GenerationKey | 'all')}
                className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
            >
                <option value="all">All Generations</option>
                {(Object.keys(GENERATION_RANGES) as GenerationKey[]).map(key => (
                    <option key={key} value={key}>{GENERATION_RANGES[key].name}</option>
                ))}
            </select>
            <button onClick={handleSnapshot} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                Generate Snapshot
            </button>
        </div>
        
        <div ref={snapshotRef} className="p-0 sm:p-4">
            <div className="p-6 bg-poke-gray-darkest rounded-lg shadow-2xl">
                {trainerName && (
                    <div className="mb-6 pb-4 border-b-2 border-poke-yellow/30">
                        <h2 className="text-3xl font-bold text-white text-center tracking-wider">{trainerName}'s Trainer Card</h2>
                    </div>
                )}
                {filteredRatedList.length === 0 ? (
                    <div className="text-center py-16 bg-poke-gray-dark rounded-lg">
                        <p className="text-xl text-gray-400">No Pokémon have been rated in this generation.</p>
                        <p className="mt-2 text-gray-500">Select a different generation or rate some Pokémon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <StatCard title="Overall Average" value={stats.avg} suffix="/ 100" description="Average of all your ratings" />
                            <StatCard title="Total Pokémon Rated" value={stats.total} description="Unique Pokémon you've rated" />
                            <RatedPokemonList title="Top Rated" pokemonList={topRated} />
                            <RatedPokemonList title="Bottom Rated" pokemonList={bottomRated} />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <TypeRatingBars ratedPokemon={filteredRatedList} />
                            <RatingDistributionChart data={distributionData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
};

export default PokeStatsDashboardPage;