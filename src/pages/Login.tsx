import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { AuthError } from '@supabase/supabase-js';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const signInResult = await signIn(email, password);
      const signInError = signInResult?.error;
      
      if (signInError) {
        if (signInError instanceof AuthError) {
          switch (signInError.message) {
            case 'Invalid login credentials':
              setError('The email or password you entered is incorrect. Please try again.');
              break;
            case 'Email not confirmed':
              setError('Please check your email and confirm your account before signing in.');
              break;
            default:
              setError('An error occurred during sign in. Please try again.');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-xl">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full flex justify-center items-center"
            >
              {loading && (
                <div className="mr-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                </div>
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}