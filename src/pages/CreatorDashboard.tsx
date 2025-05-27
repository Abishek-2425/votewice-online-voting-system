import { useEffect, useState } from 'react';
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
  created_by: string;
  vote_count: number;
}

export default function CreatorDashboard() {
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
          .eq('created_by', user!.id)
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
  }, [user]);

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
        </div>

        <PollList
          polls={polls}
          mode="creator"
          onDelete={handleDelete}
          loading={{ deleteId: deleteLoading }}
        />
      </div>
    </Layout>
  );
}