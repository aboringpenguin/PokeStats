import React from 'react';
import { Page } from '../App';
import PokeballIcon from './icons/PokeballIcon';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
    label: string;
    page: Page;
    currentPage: Page;
    onClick: (page: Page) => void;
}> = ({ label, page, currentPage, onClick }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onClick(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-poke-yellow text-poke-gray-darkest'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    );
};


const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
    const { user, signOut } = useAuth();
    
    return (
        <header className="bg-poke-gray-dark sticky top-0 z-50 shadow-lg">
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('pokedex')}>
                        <PokeballIcon className="text-poke-red" size={28}/>
                        <span className="font-bold text-xl text-white">PokéStats Tracker</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center space-x-1 sm:space-x-4">
                            <NavItem label="Pokédex" page="pokedex" currentPage={currentPage} onClick={setCurrentPage} />
                            <NavItem label="Team Builder" page="team-builder" currentPage={currentPage} onClick={setCurrentPage} />
                            <NavItem label="PokéStats" page="dashboard" currentPage={currentPage} onClick={setCurrentPage} />
                        </div>
                         <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 hidden lg:block">{user?.email}</span>
                            <button
                                onClick={signOut}
                                className="px-3 py-2 text-sm font-medium text-gray-300 hover:bg-poke-red hover:text-white rounded-md transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;