import { Share2, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareButtonsProps {
  pollId: string;
  title: string;
}

export default function ShareButtons({ pollId, title }: ShareButtonsProps) {
  const baseUrl = window.location.origin;
  const pollUrl = `${baseUrl}/poll/${pollId}`;
  const encodedUrl = encodeURIComponent(pollUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <Share2 className="h-4 w-4 mr-2" />
        Share:
      </span>
      <div className="flex items-center space-x-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
          title="Share on Twitter"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
          title="Share on Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 transition-colors duration-300"
          title="Copy link"
        >
          <LinkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}