import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Home, Crown, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import ShareButtons from '../components/ShareButtons';
import { useAuth } from '../context/AuthContext';

interface Option {
  id: string;
  option_text: string;
  votes: { count: number }[];
}

interface Poll {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  options: Option[];
  user_vote?: string;
  expiration_date?: string;
}

export default function PollDetails() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isExpired = poll?.expiration_date && new Date(poll.expiration_date) < new Date();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select(`
            *,
            options (
              id,
              option_text,
              votes (count)
            )
          `)
          .eq('id', id)
          .single();

        if (pollError) {
          toast.error('Failed to load poll');
          throw pollError;
        }

        const { data: voteData } = await supabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', id)
          .eq('user_id', user!.id)
          .maybeSingle();

        setPoll({
          ...pollData,
          user_vote: voteData?.option_id
        });
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Failed to load poll');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, user]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    if (isExpired) {
      setError('This poll has expired');
      return;
    }

    try {
      setVoting(true);
      setError('');

      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user!.id,
          email: user!.email
        });

      if (userError) {
        toast.error('Failed to verify user');
        throw userError;
      }

      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: id,
          option_id: selectedOption,
          user_id: user!.id
        });

      if (voteError) {
        if (voteError.code === '23505') {
          toast.error('You have already voted in this poll');
        } else {
          toast.error('Failed to submit vote');
        }
        throw voteError;
      }

      toast.success('Vote submitted successfully!');

      const { data: updatedPoll, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          options (
            id,
            option_text,
            votes (count)
          )
        `)
        .eq('id', id)
        .single();

      if (pollError) throw pollError;

      setPoll({
        ...updatedPoll,
        user_vote: selectedOption
      });
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to submit vote');
    } finally {
      setVoting(false);
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

  if (!poll) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Poll not found</h2>
          </div>
        </div>
      </Layout>
    );
  }

  const isCreator = poll.created_by === user?.id;
  const hasVoted = !!poll.user_vote;
  const totalVotes = poll.options.reduce(
    (acc, curr) => acc + (curr.votes?.[0]?.count || 0),
    0
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 nav-link-secondary"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{poll.title}</h1>
              {isCreator && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{poll.description}</p>

            {poll.expiration_date && (
              <div className={`mb-6 flex items-center ${
                isExpired 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  {isExpired
                    ? 'This poll has expired'
                    : `Expires on ${new Date(poll.expiration_date).toLocaleDateString()}`
                  }
                </span>
              </div>
            )}

            <ShareButtons pollId={poll.id} title={poll.title} />

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {hasVoted && !isCreator && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
                <p className="text-sm text-green-700 dark:text-green-400">
                  You have already voted in this poll. Thank you for participating!
                </p>
              </div>
            )}

            {isCreator || hasVoted ? (
              <div className="space-y-4">
                {poll.options.map((option) => {
                  const voteCount = option.votes?.[0]?.count || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const isUserVote = option.id === poll.user_vote;

                  return (
                    <div key={option.id} className="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {option.option_text}
                          {isUserVote && !isCreator && (
                            <span className="ml-2 text-green-600 dark:text-green-400">(Your vote)</span>
                          )}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {voteCount} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Total votes: {totalVotes}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <input
                        type="radio"
                        name="poll-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-3 text-gray-900 dark:text-gray-300">{option.option_text}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={voting || !selectedOption}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {voting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />}
                  {voting ? 'Submitting Vote...' : 'Submit Vote'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}