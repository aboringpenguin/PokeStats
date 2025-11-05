import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Pokemon, Team, TeamContextType } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { usePokemonData } from './PokemonDataContext';

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { allPokemon } = usePokemonData();
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [isTeamsLoading, setIsLoading] = useState(true);

  const [activeTeamId, setActiveTeamId] = useState<string | null>(() => {
     try {
      const storedId = window.localStorage.getItem('active-pokemon-team-id');
      return storedId ? JSON.parse(storedId) : null;
    } catch (error) {
      return null;
    }
  });

  const fetchTeams = useCallback(async () => {
    if (!user || !allPokemon) return;
    try {
      setIsLoading(true);
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('user_id', user.id);
      if (teamsError) throw teamsError;

      const teamIds = teamsData.map(t => t.id);

      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, pokemon_id')
        .in('team_id', teamIds);
      if (membersError) throw membersError;
      
      const teamsMap: Record<string, Team> = {};
      for (const team of teamsData) {
        const members = membersData
          .filter(m => m.team_id === team.id)
          .map(m => allPokemon[m.pokemon_id])
          .filter(Boolean);
        teamsMap[team.id] = { ...team, members };
      }

      setTeams(teamsMap);

      setActiveTeamId(prevActiveId => {
        if (prevActiveId && !teamsMap[prevActiveId]) {
          const remainingTeamIds = Object.keys(teamsMap);
          return remainingTeamIds[0] || null;
        }
        if (!prevActiveId && Object.keys(teamsMap).length > 0) {
            const storedId = window.localStorage.getItem('active-pokemon-team-id');
            const parsedId = storedId ? JSON.parse(storedId) : null;
            if (parsedId && teamsMap[parsedId]) return parsedId;
            return Object.keys(teamsMap)[0];
        }
        return prevActiveId;
      });

    } catch (error: any) {
        console.error("Error fetching teams:", error.message);
    } finally {
        setIsLoading(false);
    }
  }, [user, allPokemon]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);


  useEffect(() => {
    try {
      window.localStorage.setItem('active-pokemon-team-id', JSON.stringify(activeTeamId));
    } catch (error) {
      console.error("Could not save active team ID to localStorage", error);
    }
  }, [activeTeamId]);
  
  const createTeam = useCallback(async (name: string) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('teams')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating team:", error.message);
      } else if (data) {
        const newTeam: Team = { id: data.id, name: data.name, members: [] };
        setTeams(prev => ({...prev, [data.id]: newTeam}));
        setActiveTeamId(data.id);
      }
  }, [user]);

  const deleteTeam = useCallback(async (teamId: string) => {
    const { error: memberError } = await supabase.from('team_members').delete().eq('team_id', teamId);
    if (memberError) {
      console.error("Error deleting team members:", memberError.message);
      return;
    }

    const { error: teamError } = await supabase.from('teams').delete().eq('id', teamId);
    if (teamError) {
      console.error("Error deleting team:", teamError.message);
      return;
    }
    
    await fetchTeams();
  }, [fetchTeams]);

  const renameTeam = useCallback(async (teamId: string, newName: string) => {
      const { error } = await supabase.from('teams').update({ name: newName }).eq('id', teamId);
      if (error) {
        console.error("Error renaming team:", error.message);
      } else {
        setTeams(prev => ({
            ...prev,
            [teamId]: { ...prev[teamId], name: newName }
        }));
      }
  }, []);

  const setActiveTeam = useCallback((teamId: string | null) => {
      setActiveTeamId(teamId);
  }, []);

  const addPokemonToTeam = useCallback(async (pokemon: Pokemon) => {
    if (!activeTeamId || !user) return;
    
    const activeTeam = teams[activeTeamId];
    if (!activeTeam || activeTeam.members.length >= 6 || activeTeam.members.some(p => p.id === pokemon.id)) {
        return;
    }
    
    const { error } = await supabase.from('team_members').insert({ team_id: activeTeamId, pokemon_id: pokemon.id });
    if (error) {
        console.error("Error adding pokemon to team:", error.message);
    } else {
        setTeams(prev => {
            const updatedTeam = { ...activeTeam, members: [...activeTeam.members, pokemon] };
            return { ...prev, [activeTeamId]: updatedTeam };
        });
    }
  }, [activeTeamId, user, teams]);

  const removePokemonFromTeam = useCallback(async (pokemonId: number) => {
    if (!activeTeamId || !user) return;
    const { error } = await supabase.from('team_members').delete().match({ team_id: activeTeamId, pokemon_id: pokemonId });

    if (error) {
        console.error("Error removing pokemon:", error.message);
    } else {
         setTeams(prev => {
            const activeTeam = prev[activeTeamId];
            if (!activeTeam) return prev;
            const updatedTeam = { ...activeTeam, members: activeTeam.members.filter(p => p.id !== pokemonId) };
            return { ...prev, [activeTeamId]: updatedTeam };
        });
    }
  }, [activeTeamId, user]);

  const activeTeam = useMemo(() => {
      if (!activeTeamId || !teams[activeTeamId]) return null;
      return teams[activeTeamId];
  }, [teams, activeTeamId]);

  const value = useMemo(() => ({ teams, activeTeamId, activeTeam, createTeam, deleteTeam, renameTeam, setActiveTeam, addPokemonToTeam, removePokemonFromTeam, isTeamsLoading }), [teams, activeTeamId, activeTeam, createTeam, deleteTeam, renameTeam, setActiveTeam, addPokemonToTeam, removePokemonFromTeam, isTeamsLoading]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};