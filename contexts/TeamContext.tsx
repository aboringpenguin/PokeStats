import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Pokemon, Team, TeamContextType } from '../types';

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

const uuid = () => crypto.randomUUID();

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Record<string, Team>>(() => {
    try {
      const storedTeams = window.localStorage.getItem('pokemon-teams');
      return storedTeams ? JSON.parse(storedTeams) : {};
    } catch (error) {
      console.error("Could not parse teams from localStorage", error);
      return {};
    }
  });

  const [activeTeamId, setActiveTeamId] = useState<string | null>(() => {
     try {
      const storedId = window.localStorage.getItem('active-pokemon-team-id');
      // Ensure the active ID actually exists in the teams object
      const parsedId = storedId ? JSON.parse(storedId) : null;
      const storedTeams = window.localStorage.getItem('pokemon-teams');
      const parsedTeams = storedTeams ? JSON.parse(storedTeams) : {};
      return parsedTeams[parsedId] ? parsedId : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('pokemon-teams', JSON.stringify(teams));
      window.localStorage.setItem('active-pokemon-team-id', JSON.stringify(activeTeamId));
    } catch (error) {
      console.error("Could not save team data to localStorage", error);
    }
  }, [teams, activeTeamId]);
  
  const createTeam = useCallback((name: string) => {
      const newId = uuid();
      const newTeam: Team = { id: newId, name, members: [] };
      setTeams(prev => ({...prev, [newId]: newTeam}));
      setActiveTeamId(newId);
  }, []);

  const deleteTeam = useCallback((teamId: string) => {
    setTeams(prev => {
        const newTeams = {...prev};
        delete newTeams[teamId];
        return newTeams;
    });
    if (activeTeamId === teamId) {
        const remainingTeamIds = Object.keys(teams).filter(id => id !== teamId);
        setActiveTeamId(remainingTeamIds[0] || null);
    }
  }, [activeTeamId, teams]);

  const renameTeam = useCallback((teamId: string, newName: string) => {
      setTeams(prev => ({
          ...prev,
          [teamId]: { ...prev[teamId], name: newName }
      }));
  }, []);

  const setActiveTeam = useCallback((teamId: string | null) => {
      setActiveTeamId(teamId);
  }, []);

  const addPokemonToTeam = useCallback((pokemon: Pokemon) => {
    if (!activeTeamId) return;
    setTeams(prev => {
        const activeTeam = prev[activeTeamId];
        if (!activeTeam || activeTeam.members.length >= 6 || activeTeam.members.some(p => p.id === pokemon.id)) {
            return prev;
        }
        const updatedTeam = { ...activeTeam, members: [...activeTeam.members, pokemon] };
        return { ...prev, [activeTeamId]: updatedTeam };
    });
  }, [activeTeamId]);

  const removePokemonFromTeam = useCallback((pokemonId: number) => {
    if (!activeTeamId) return;
     setTeams(prev => {
        const activeTeam = prev[activeTeamId];
        if (!activeTeam) return prev;
        const updatedTeam = { ...activeTeam, members: activeTeam.members.filter(p => p.id !== pokemonId) };
        return { ...prev, [activeTeamId]: updatedTeam };
    });
  }, [activeTeamId]);

  const activeTeam = useMemo(() => {
      if (!activeTeamId || !teams[activeTeamId]) return null;
      return teams[activeTeamId];
  }, [teams, activeTeamId]);


  const value = useMemo(() => ({ teams, activeTeamId, activeTeam, createTeam, deleteTeam, renameTeam, setActiveTeam, addPokemonToTeam, removePokemonFromTeam }), [teams, activeTeamId, activeTeam, createTeam, deleteTeam, renameTeam, setActiveTeam, addPokemonToTeam, removePokemonFromTeam]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};