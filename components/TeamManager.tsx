import React, { useState, useRef, useEffect } from 'react';
import { useTeam } from '../contexts/TeamContext';
import { Team } from '../types';

const TeamManager: React.FC = () => {
    const { teams, activeTeamId, activeTeam, createTeam, deleteTeam, renameTeam, setActiveTeam } = useTeam();
    const [isCreating, setIsCreating] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const teamList = Object.values(teams);

    useEffect(() => {
        if (isCreating || isRenaming) {
            inputRef.current?.focus();
            if (isRenaming && activeTeam) {
                setInputValue(activeTeam.name);
            }
        }
    }, [isCreating, isRenaming, activeTeam]);

    const handleCreate = () => {
        if (inputValue.trim()) {
            createTeam(inputValue.trim());
            resetState();
        }
    };

    const handleRename = () => {
        if (activeTeamId && inputValue.trim()) {
            renameTeam(activeTeamId, inputValue.trim());
            resetState();
        }
    };
    
    const handleDelete = () => {
        if (activeTeamId && window.confirm(`Are you sure you want to delete the team "${activeTeam?.name}"?`)) {
            deleteTeam(activeTeamId);
        }
    };

    const resetState = () => {
        setIsCreating(false);
        setIsRenaming(false);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (isCreating) handleCreate();
            if (isRenaming) handleRename();
        }
        if (e.key === 'Escape') {
            resetState();
        }
    };
    
    const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
            resetState();
        }
    };

    return (
        <div className="bg-poke-gray-dark/50 p-4 rounded-lg mb-8 flex flex-wrap items-center justify-center gap-4">
            <select
                value={activeTeamId ?? ''}
                onChange={(e) => setActiveTeam(e.target.value || null)}
                className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
                aria-label="Select a team"
            >
                <option value="">-- Select a Team --</option>
                {teamList.map((t: Team) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            {(isCreating || isRenaming) ? (
                <div ref={containerRef} onBlur={handleContainerBlur} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isCreating ? "New team name..." : "Rename team..."}
                        className="bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow"
                    />
                     <button onClick={isCreating ? handleCreate : handleRename} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        Save
                    </button>
                    <button onClick={resetState} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700">
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                     <button onClick={() => { setIsCreating(true); setIsRenaming(false); }} className="px-4 py-2 bg-poke-blue text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                        New Team
                    </button>
                    <button onClick={() => { if(activeTeamId) { setIsRenaming(true); setIsCreating(false); } }} disabled={!activeTeamId} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Rename
                    </button>
                    <button onClick={handleDelete} disabled={!activeTeamId} className="px-4 py-2 bg-poke-red text-white font-semibold rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeamManager;