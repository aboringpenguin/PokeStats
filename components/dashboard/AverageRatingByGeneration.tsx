import React, { useMemo } from 'react';
import { RatedPokemon, GenerationKey } from '../../types';
import { GENERATION_RANGES, GENERATION_ROMAN_NUMERALS } from '../../constants';

interface AverageRatingByGenerationProps {
    ratedPokemon: RatedPokemon[];
}

const GenerationColors: Record<string, string> = {
    kanto: '#EF5350',
    johto: '#FFCA28',
    hoenn: '#2196F3',
    sinnoh: '#7E57C2',
    unova: '#66BB6A',
    kalos: '#F9A825',
    alola: '#EC407A',
    galar: '#42A5F5',
    paldea: '#FFA726',
};

const AverageRatingByGeneration: React.FC<AverageRatingByGenerationProps> = ({ ratedPokemon }) => {
    const averageRatings = useMemo(() => {
        const genData: Record<GenerationKey, { total: number; count: number; name: string; }> = {} as any;

        (Object.keys(GENERATION_RANGES) as GenerationKey[]).forEach(key => {
            genData[key] = { total: 0, count: 0, name: GENERATION_RANGES[key].name };
        });

        ratedPokemon.forEach(p => {
            const genKey = GENERATION_ROMAN_NUMERALS[p.generation];
            if (genKey && genData[genKey]) {
                genData[genKey].total += p.rating;
                genData[genKey].count += 1;
            }
        });

        return (Object.keys(GENERATION_RANGES) as GenerationKey[])
            .map(key => ({
                key: key,
                name: genData[key].name,
                average: genData[key].count > 0 ? genData[key].total / genData[key].count : 0,
            }))
            .filter(item => item.average > 0);

    }, [ratedPokemon]);

    if (averageRatings.length === 0) {
        return null;
    }

    return (
        <div className="bg-poke-gray-dark p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-white mb-4">Average Rating by Generation</h3>
            <div className="space-y-3">
                {averageRatings.map(({ name, average, key }) => (
                    <div key={name} className="w-full">
                        <div className="flex justify-between text-sm font-semibold text-gray-300 mb-1">
                            <span className="capitalize">{name}</span>
                            <span>{average > 0 ? average.toFixed(1) : '-'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div
                                className="h-4 rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${average}%`,
                                    backgroundColor: GenerationColors[key] || '#A8A77A'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AverageRatingByGeneration;