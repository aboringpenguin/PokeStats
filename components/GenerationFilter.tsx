
import React from 'react';
import { GENERATION_RANGES } from '../constants';
import { GenerationKey } from '../types';

interface GenerationFilterProps {
  selected: GenerationKey;
  onSelect: (generation: GenerationKey) => void;
  disabled: boolean;
}

const GenerationFilter: React.FC<GenerationFilterProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {(Object.keys(GENERATION_RANGES) as GenerationKey[]).map((key) => {
        const gen = GENERATION_RANGES[key];
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-poke-gray-darkest focus:ring-poke-yellow
              ${
                isSelected
                  ? 'bg-poke-yellow text-poke-gray-darkest shadow-lg'
                  : 'bg-poke-gray-dark text-poke-gray-light hover:bg-poke-red hover:text-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {gen.name}
          </button>
        );
      })}
    </div>
  );
};

export default GenerationFilter;
