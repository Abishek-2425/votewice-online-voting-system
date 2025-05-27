import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
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
  options: Option[];
}

export default function Results() {
  const { id } = useParams();
  const [pollData, setPollData] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPollResults() {
      if (!id || !user) return;

      try {
        const [pollResponse, voteResponse] = await Promise.all([
          supabase
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
            .single(),
          supabase
            .from('votes')
            .select('id')
            .eq('poll_id', id)
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        if (pollResponse.error) throw pollResponse.error;
        setPollData(pollResponse.data);
        setHasVoted(!!voteResponse.data);
      } catch (err) {
        console.error('Error fetching poll results:', err);
        setError('Failed to load poll results');
      } finally {
        setLoading(false);
      }
    }

    fetchPollResults();
  }, [id, user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </Layout>
    );
  }

  if (error || !pollData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {error || 'Poll not found'}
            </h2>
          </div>
        </div>
      </Layout>
    );
  }

  const isCreator = pollData.created_by === user?.id;
  const totalVotes = pollData.options.reduce(
    (acc, curr) => acc + (curr.votes?.[0]?.count || 0),
    0
  );

  const sortedOptions = [...pollData.options].sort((a, b) => {
    const votesA = a.votes?.[0]?.count || 0;
    const votesB = b.votes?.[0]?.count || 0;
    return votesB - votesA;
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{pollData.title}</h1>
              {isCreator && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{pollData.description}</p>

            {!isCreator && hasVoted && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Thank you for participating in this poll!
                </p>
              </div>
            )}

            <div className="space-y-4">
              {sortedOptions.map((option, index) => {
                const voteCount = option.votes?.[0]?.count || 0;
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                const isLeading = index === 0 && voteCount > 0;

                return (
                  <div 
                    key={option.id} 
                    className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 ${isCreator && isLeading ? 'border-2 border-indigo-600 dark:border-indigo-400' : ''}`}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {option.option_text}
                        </span>
                      </div>
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

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Total Participation</span>
                  <span className="text-lg font-bold">{totalVotes} votes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}