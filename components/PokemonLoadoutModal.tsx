import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TeamMember, EVs, PokemonStat } from '../types';
import { TYPE_COLORS, NATURES } from '../constants';
import PokeballIcon from './icons/PokeballIcon';

interface PokemonLoadoutModalProps {
    member: TeamMember;
    onClose: () => void;
    onSave: (updatedMember: TeamMember) => void;
}

const StatInput: React.FC<{ label: string; value: number; base: number; final: number; onChange: (value: number) => void }> = ({ label, value, base, final, onChange }) => {
    return (
        <div className="grid grid-cols-4 items-center gap-2 text-sm">
            <label htmlFor={`ev-${label}`} className="font-bold text-gray-300 col-span-1">{label}</label>
            <span className="text-center font-mono">{base}</span>
            <input
                id={`ev-${label}`}
                type="range"
                min="0"
                max="252"
                step="4"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer col-span-1"
            />
             <span className="text-center font-mono font-bold text-poke-yellow">{final}</span>
        </div>
    );
};

const PokemonLoadoutModal: React.FC<PokemonLoadoutModalProps> = ({ member, onClose, onSave }) => {
    const [loadout, setLoadout] = useState({
        nickname: member.nickname,
        ability: member.ability,
        held_item: member.held_item,
        nature: member.nature,
        moves: [...member.moves],
        evs: { ...member.evs },
    });

    const [details, setDetails] = useState<{ abilities: string[], moves: string[], items: string[] }>({ abilities: [], moves: [], items: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState({ moves0: '', moves1: '', moves2: '', moves3: '', item: '' });

    const fetchDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch Pokemon details (abilities, moves)
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${member.id}`);
            const pokeData = await pokeRes.json();
            const abilities = pokeData.abilities.map((a: any) => a.ability.name);
            const moves = pokeData.moves.map((m: any) => m.move.name).sort();

            // Fetch items (cached in session storage)
            let items = [];
            const cachedItems = sessionStorage.getItem('poke-items');
            if (cachedItems) {
                items = JSON.parse(cachedItems);
            } else {
                const itemRes = await fetch('https://pokeapi.co/api/v2/item?limit=2000');
                const itemData = await itemRes.json();
                items = itemData.results.map((i: any) => i.name).sort();
                sessionStorage.setItem('poke-items', JSON.stringify(items));
            }
            
            setDetails({ abilities, moves, items });

            // Set default ability if not already set
            if (!loadout.ability && abilities.length > 0) {
                setLoadout(prev => ({ ...prev, ability: abilities[0] }));
            }
        } catch (error) {
            console.error("Failed to fetch pokemon details", error);
        } finally {
            setIsLoading(false);
        }
    }, [member.id, loadout.ability]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleEvChange = (stat: keyof EVs, value: number) => {
        const newEvs = { ...loadout.evs, [stat]: value };
        // Fix: The result of Object.values is `unknown[]`, which causes type errors in `reduce`. Casting the array to `number[]` ensures `v` is typed as a number.
        const total = (Object.values(newEvs) as number[]).reduce((sum, v) => sum + v, 0);
        if (total <= 510) {
            setLoadout(prev => ({ ...prev, evs: newEvs }));
        }
    };

    // Fix: The result of Object.values is `unknown[]`, which causes type errors in `reduce`. Casting the array to `number[]` ensures `v` is typed as a number.
    const totalEvs = useMemo(() => (Object.values(loadout.evs) as number[]).reduce((sum, v) => sum + v, 0), [loadout.evs]);

    const finalStats = useMemo(() => {
        const stats: Partial<PokemonStat> = {};
        const natureInfo = NATURES.find(n => n.name === loadout.nature);
        const level = 100;

        (Object.keys(member.stats) as (keyof PokemonStat)[]).forEach(stat => {
            const base = member.stats[stat];
            const ev = loadout.evs[stat];
            // Assuming max IVs (31) for competitive builds
            const iv = 31;
            
            let finalStat: number;
            if (stat === 'hp') {
                finalStat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
            } else {
                finalStat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
            }

            if (natureInfo?.increased_stat === stat) {
                finalStat = Math.floor(finalStat * 1.1);
            } else if (natureInfo?.decreased_stat === stat) {
                finalStat = Math.floor(finalStat * 0.9);
            }
            stats[stat] = finalStat;
        });
        return stats as PokemonStat;
    }, [member.stats, loadout.evs, loadout.nature]);
    
    const handleSave = () => {
        onSave({ ...member, ...loadout });
    };

    const handleSearch = (field: string, value: string) => {
        setSearchTerm(prev => ({...prev, [field]: value}));
    };
    
    const filteredMoves = useMemo(() => details.moves.filter(m => m.toLowerCase().includes(searchTerm[`moves${0}`].toLowerCase())), [details.moves, searchTerm.moves0]);
    const filteredItems = useMemo(() => details.items.filter(i => i.toLowerCase().includes(searchTerm.item.toLowerCase())), [details.items, searchTerm.item]);


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-poke-gray-dark w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center gap-4 p-4 border-b border-gray-700">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center">
                        <img src={member.sprite} alt={member.name} className="w-24 h-24" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold capitalize text-white">{member.name}</h2>
                         <div className="flex items-center gap-2 mt-1">
                            {member.types.map(type => (
                                <span key={type} className="px-3 py-1 text-sm font-bold text-white rounded-full capitalize" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white text-3xl">&times;</button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
                    {isLoading ? (
                         <div className="md:col-span-2 flex flex-col items-center justify-center p-12 text-center">
                            <PokeballIcon className="w-16 h-16 text-poke-yellow animate-spin-slow mb-4" />
                            <p className="text-xl font-semibold text-poke-gray-light">Fetching battle data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Nickname</label>
                                        <input type="text" value={loadout.nickname} onChange={e => setLoadout(prev => ({ ...prev, nickname: e.target.value }))} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Nature</label>
                                        <select value={loadout.nature} onChange={e => setLoadout(prev => ({...prev, nature: e.target.value}))} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 capitalize">
                                            {NATURES.map(n => <option key={n.name} value={n.name}>{n.name} (+{n.increased_stat || '...'} / -{n.decreased_stat || '...'})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Ability</label>
                                        <select value={loadout.ability} onChange={e => setLoadout(prev => ({...prev, ability: e.target.value}))} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 capitalize">
                                            {details.abilities.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Held Item</label>
                                         <input list="items" value={loadout.held_item} onChange={e => setLoadout(prev => ({ ...prev, held_item: e.target.value }))} className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 capitalize" />
                                        <datalist id="items">
                                            {details.items.map(item => <option key={item} value={item} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Moves</h3>
                                    <div className="space-y-2">
                                        {[0, 1, 2, 3].map(i => (
                                            <input
                                                key={i}
                                                list={`moves-${i}`}
                                                value={loadout.moves[i] || ''}
                                                onChange={e => {
                                                    const newMoves = [...loadout.moves];
                                                    newMoves[i] = e.target.value || null;
                                                    setLoadout(prev => ({...prev, moves: newMoves}));
                                                }}
                                                placeholder={`Move ${i + 1}`}
                                                className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 capitalize"
                                            />
                                        ))}
                                        <datalist id="moves-0">
                                            {details.moves.map(m => <option key={m} value={m} />)}
                                        </datalist>
                                         <datalist id="moves-1">
                                            {details.moves.map(m => <option key={m} value={m} />)}
                                        </datalist>
                                         <datalist id="moves-2">
                                            {details.moves.map(m => <option key={m} value={m} />)}
                                        </datalist>
                                         <datalist id="moves-3">
                                            {details.moves.map(m => <option key={m} value={m} />)}
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                            {/* Right Column */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-2">Stat Training (EVs)</h3>
                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold">Total EVs: {totalEvs} / 510</span>
                                        <span className="text-sm text-gray-400">Remaining: {510 - totalEvs}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500">
                                            <span>Stat</span>
                                            <span className="text-center">Base</span>
                                            <span className="text-center">EVs (0-252)</span>
                                            <span className="text-center">Final</span>
                                        </div>
                                        {(Object.keys(loadout.evs) as (keyof EVs)[]).map(stat => (
                                            <StatInput
                                                key={stat}
                                                label={stat.replace('_', '. ').toUpperCase()}
                                                value={loadout.evs[stat]}
                                                base={member.stats[stat]}
                                                final={finalStats[stat]}
                                                onChange={(v) => handleEvChange(stat, v)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-700 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-poke-blue text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">Save Changes</button>
                </footer>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #424242; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFCA28; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FBC02D; }
                input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #FFCA28; cursor: pointer; border-radius: 50%; }
                input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; background: #FFCA28; cursor: pointer; border-radius: 50%; }
            `}</style>
        </div>
    );
};

export default PokemonLoadoutModal;