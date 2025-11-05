import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PokeballIcon from '../components/icons/PokeballIcon';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-poke-gray-darkest p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <PokeballIcon className="mx-auto text-poke-red h-16 w-16" />
            <h1 className="text-4xl font-bold text-white mt-4">PokéStats Tracker</h1>
            <p className="text-gray-400 mt-2">Sign in to track your Pokémon ratings and teams.</p>
        </div>

        <div className="bg-poke-gray-dark p-8 rounded-lg shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:ring-poke-yellow focus:border-poke-yellow transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-poke-gray-darkest bg-poke-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-poke-gray-dark focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                {loading ? (
                    <PokeballIcon className="animate-spin h-5 w-5" />
                ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
          {message && <p className="mt-4 text-center text-sm text-green-400">{message}</p>}

          <div className="mt-6 text-center">
            <button onClick={() => {setIsLogin(!isLogin); setError(null); setMessage(null);}} className="text-sm text-poke-blue hover:underline">
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
