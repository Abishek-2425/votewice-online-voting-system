import { Vote } from 'lucide-react';
import PollCard from './PollCard';

interface Poll {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  vote_count: number;
}

interface PollListProps {
  polls: Poll[];
  mode: 'creator' | 'voter';
  onDelete?: (pollId: string) => void;
  loading?: {
    deleteId: string | null;
  };
}

export default function PollList({ polls, mode, onDelete, loading }: PollListProps) {
  if (polls.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
          <Vote className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {mode === 'creator' ? 'No polls yet' : 'No polls available'}
        </h3>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {mode === 'creator'
            ? 'Get started by creating your first poll.'
            : 'Check back later for new polls to vote on.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          id={poll.id}
          title={poll.title}
          description={poll.description}
          createdAt={poll.created_at}
          voteCount={poll.vote_count}
          mode={mode}
          onDelete={onDelete ? () => onDelete(poll.id) : undefined}
          isDeleting={loading?.deleteId === poll.id}
        />
      ))}
    </div>
  );
}