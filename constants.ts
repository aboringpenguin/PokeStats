
import { GenerationKey } from './types';

export const GENERATION_RANGES: Record<GenerationKey, { start: number; end: number; name: string }> = {
  kanto: { start: 1, end: 151, name: 'Kanto' },
  johto: { start: 152, end: 251, name: 'Johto' },
  hoenn: { start: 252, end: 386, name: 'Hoenn' },
  sinnoh: { start: 387, end: 493, name: 'Sinnoh' },
  unova: { start: 494, end: 649, name: 'Unova' },
  kalos: { start: 650, end: 721, name: 'Kalos' },
  alola: { start: 722, end: 809, name: 'Alola' },
  galar: { start: 810, end: 898, name: 'Galar' },
  paldea: { start: 906, end: 1025, name: 'Paldea' },
};

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};
