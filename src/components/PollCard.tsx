import { Link } from 'react-router-dom';
import { ChevronRight, BarChart3, Trash2, Calendar } from 'lucide-react';

interface PollCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  voteCount: number;
  mode: 'creator' | 'voter';
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function PollCard({
  id,
  title,
  description,
  createdAt,
  voteCount,
  mode,
  onDelete,
  isDeleting
}: PollCardProps) {
  return (
    <div className="glass-card group">
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Link to={`/poll/${id}`} className="block group">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300">
              {title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          </Link>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{voteCount} votes</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          {mode === 'creator' ? (
            <div className="flex items-center justify-between">
              <Link
                to={`/results/${id}`}
                className="nav-link-secondary"
              >
                View Results
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>

              {onDelete && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-all duration-300"
                  title="Delete poll"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 dark:border-red-400" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <Link
              to={`/poll/${id}`}
              className="nav-link-primary w-full justify-center"
            >
              Vote Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}