export interface PokemonStat {
  hp: number;
  attack: number;
  defense: number;
  sp_atk: number;
  sp_def: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  stats: PokemonStat;
  generation: string;
}

export type GenerationKey = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola' | 'galar' | 'paldea';

export interface PokemonDataContextType {
  allPokemon: Record<string, Pokemon> | null;
  isLoading: boolean;
}

export interface RatingsContextType {
    ratings: Record<string, number>;
    setRating: (pokemonId: number, rating: number) => void;
}

export interface Team {
    id: string;
    name: string;
    members: Pokemon[];
}

export interface TeamContextType {
    teams: Record<string, Team>;
    activeTeamId: string | null;
    activeTeam: Team | null;
    createTeam: (name: string) => void;
    deleteTeam: (teamId: string) => void;
    renameTeam: (teamId: string, newName: string) => void;
    setActiveTeam: (teamId: string | null) => void;
    addPokemonToTeam: (pokemon: Pokemon) => void;
    removePokemonFromTeam: (pokemonId: number) => void;
}