import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function CreatePoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']); // Minimum 2 options
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || options.some(opt => !opt.trim())) {
      setError('Please fill in all fields');
      return;
    }

    if (options.length < 2) {
      setError('Please add at least 2 options');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user!.id,
          email: user!.email,
        }, {
          onConflict: 'id'
        });

      if (userError) throw userError;

      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: title.trim(),
          description: description.trim(),
          created_by: user!.id,
          expiration_date: expirationDate || null
        })
        .select()
        .single();

      if (pollError) throw pollError;

      const { error: optionsError } = await supabase
        .from('options')
        .insert(
          options
            .filter(opt => opt.trim())
            .map(option => ({
              poll_id: pollData.id,
              option_text: option.trim()
            }))
        );

      if (optionsError) throw optionsError;

      toast.success('Poll created successfully!');
      navigate(`/poll/${pollData.id}`);
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll');
      toast.error('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="glass-card">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Create a New Poll</h1>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poll Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Enter your question"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Provide more context about your poll"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  id="expiration"
                  min={minDate}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="glass-input w-full"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="glass-input w-full"
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-all duration-300"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="nav-link-secondary"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Option
                </button>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button flex-1 flex justify-center items-center"
                >
                  {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                  {loading ? 'Creating Poll...' : 'Create Poll'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="nav-link-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}