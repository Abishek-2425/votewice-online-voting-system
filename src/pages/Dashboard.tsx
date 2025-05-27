import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Vote, BarChart3, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Poll {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  vote_count: number;
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data, error } = await supabase
          .from('polls')
          .select(`
            *,
            vote_count:votes(count)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Failed to load polls');
          throw error;
        }

        const pollsWithVoteCount = data.map(poll => ({
          ...poll,
          vote_count: poll.vote_count?.[0]?.count || 0
        }));

        setPolls(pollsWithVoteCount);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(pollId);

      // Delete votes first due to foreign key constraints
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId);

      if (votesError) {
        toast.error('Failed to delete poll votes');
        throw votesError;
      }

      // Delete options
      const { error: optionsError } = await supabase
        .from('options')
        .delete()
        .eq('poll_id', pollId);

      if (optionsError) {
        toast.error('Failed to delete poll options');
        throw optionsError;
      }

      // Finally delete the poll
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (pollError) {
        toast.error('Failed to delete poll');
        throw pollError;
      }

      // Update local state
      setPolls(polls.filter(poll => poll.id !== pollId));
      toast.success('Poll deleted successfully');
    } catch (error) {
      console.error('Error deleting poll:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Polls</h2>
          <Link
            to="/create-poll"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            Create New Poll
          </Link>
        </div>

        {polls.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <Vote className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">No polls yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first poll.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <Link
                    to={`/poll/${poll.id}`}
                    className="block group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {poll.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {poll.description}
                    </p>
                  </Link>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        <span>{poll.vote_count} votes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        to={`/results/${poll.id}`}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View Results
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>

                      {user?.id === poll.created_by && (
                        <button
                          onClick={() => handleDelete(poll.id)}
                          disabled={deleteLoading === poll.id}
                          className="inline-flex items-center p-1 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
                          title="Delete poll"
                        >
                          {deleteLoading === poll.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 dark:border-red-400"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}