import React, { useMemo } from 'react';
import { Pokemon } from '../../types';
import { TYPE_COLORS } from '../../constants';

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

export default TypeRatingBars;
