import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const [hasPolls, setHasPolls] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkUserPolls = async () => {
      try {
        const { count, error } = await supabase
          .from('polls')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user!.id)
          .limit(1);

        if (error) throw error;
        setHasPolls(count > 0);
      } catch (error) {
        console.error('Error checking user polls:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserPolls();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return <Navigate to={hasPolls ? '/dashboard/creator' : '/dashboard/voter'} replace />;
}