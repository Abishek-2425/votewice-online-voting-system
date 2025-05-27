import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import PollList from '../components/PollList';
import { useAuth } from '../context/AuthContext';

interface Poll {
  id: string;
  title: string;
  description: string;
  created_at: string;
  vote_count: number;
}

export default function VoterDashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        // First, get the polls where the user hasn't voted yet
        const { data: votedPollIds } = await supabase
          .from('votes')
          .select('poll_id')
          .eq('user_id', user!.id);

        const votedIds = votedPollIds?.map(vote => vote.poll_id) || [];

        // Then fetch all polls except user's own and those they've already voted on
        const { data, error } = await supabase
          .from('polls')
          .select(`
            *,
            vote_count:votes(count)
          `)
          .neq('created_by', user!.id)
          .not('id', 'in', `(${votedIds.join(',')})`)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Failed to load available polls');
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
  }, [user]);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Polls</h2>
        </div>

        <PollList polls={polls} mode="voter" />
      </div>
    </Layout>
  );
}