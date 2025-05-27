import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, PlusCircle, Home, Vote, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isVoterDashboard = location.pathname === '/dashboard/voter';

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
              >
                <Vote className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  VoteWise
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to={isVoterDashboard ? '/dashboard/creator' : '/dashboard/voter'}
                className={`nav-link ${
                  isActive('/dashboard/creator') || isActive('/dashboard/voter')
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {isVoterDashboard ? (
                  <>
                    <Home className="h-5 w-5 mr-2" />
                    My Polls
                  </>
                ) : (
                  <>
                    <Vote className="h-5 w-5 mr-2" />
                    Vote
                  </>
                )}
              </Link>
              <Link
                to="/create-poll"
                className="nav-link-primary"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Poll
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${
                  isActive('/profile')
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="nav-link text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}