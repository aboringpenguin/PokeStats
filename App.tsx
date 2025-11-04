
import React, { useState } from 'react';
import PokedexPage from './pages/PokedexPage';
import TeamBuilderPage from './pages/TeamBuilderPage';
import PokeStatsDashboardPage from './pages/PokeStatsDashboardPage';
import { PokemonDataProvider } from './contexts/PokemonDataContext';
import { RatingsProvider } from './contexts/RatingsContext';
import { TeamProvider } from './contexts/TeamContext';
import Navbar from './components/Navbar';

export type Page = 'pokedex' | 'team-builder' | 'dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('pokedex');

  const renderPage = () => {
    switch (currentPage) {
      case 'pokedex':
        return <PokedexPage />;
      case 'team-builder':
        return <TeamBuilderPage />;
      case 'dashboard':
        return <PokeStatsDashboardPage />;
      default:
        return <PokedexPage />;
    }
  };

  return (
    <PokemonDataProvider>
      <RatingsProvider>
        <TeamProvider>
          <div className="min-h-screen bg-poke-gray-darkest text-poke-gray-light font-sans">
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="container mx-auto px-4 py-8">
              {renderPage()}
            </main>
          </div>
        </TeamProvider>
      </RatingsProvider>
    </PokemonDataProvider>
  );
};

export default App;
