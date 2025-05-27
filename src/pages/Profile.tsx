import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface UserStats {
  pollsCreated: number;
  pollsVotedOn: number;
}

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({ pollsCreated: 0, pollsVotedOn: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [pollsCreatedResponse, pollsVotedResponse] = await Promise.all([
          supabase
            .from('polls')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', user!.id),
          supabase
            .from('votes')
            .select('poll_id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
        ]);

        if (pollsCreatedResponse.error) throw pollsCreatedResponse.error;
        if (pollsVotedResponse.error) throw pollsVotedResponse.error;

        setStats({
          pollsCreated: pollsCreatedResponse.count || 0,
          pollsVotedOn: pollsVotedResponse.count || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Polls Created</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.pollsCreated}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Polls Voted On</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.pollsVotedOn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}