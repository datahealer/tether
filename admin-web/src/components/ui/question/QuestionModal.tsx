import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Question } from '../../../services/question';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Partial<Question>) => Promise<void>;
  question?: Question | null;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    question: '',
    categoryId: 'communication',
    genderFocus: 'Neutral',
    tone: 'playful', // Single value
    difficulty: 3, // Default to medium
    relationshipStage: [],
    livingType: [],
    goalTag: [],
    emotionalNeed: [],
    formatType: '',
    contextTag: '',
    status: 'Published',
    writerNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setFormData(question);
    } else {
      setFormData({
        question: '',
        categoryId: 'communication',
        genderFocus: 'Neutral',
        tone: 'playful',
        difficulty: 3,
        relationshipStage: [],
        livingType: [],
        goalTag: [],
        emotionalNeed: [],
        formatType: '',
        contextTag: '',
        status: 'Published',
        writerNotes: '',
      });
    }
    setError('');
  }, [question, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.question || !formData.categoryId || !formData.genderFocus || !formData.tone || !formData.difficulty) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(formData);
      console.log('✅ Question saved successfully');
      onClose();
    } catch (err: any) {
      console.error('❌ Error saving question:', err);
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field: keyof Question, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  if (!isOpen) return null;

  const categories = [
    'communication',
    'intimacy',
    'playfulness',
    'trust',
    'love_languages',
    'future',
    'vulnerability',
    'conflict',
    'erotic',
    'gratitude',
  ];
  const genderFocuses = ['Male', 'Female', 'Neutral'];
  const relationshipStages = ['Early', 'Established', 'Long-term', 'Rebuilding'];
  const livingTypes = ['Together', 'Apart, Long Distance', 'Kids', 'No Kids'];
  const goals = [
    'Communication',
    'Trust',
    'Spark',
    'Intimacy',
    'Conflict',
    'Gratitude',
    'Future',
    'Vulnerability',
    'Playfulness',
    'Love Languages',
  ];
  const emotionalNeeds = [
    'Love & Security',
    'Recognition',
    'Autonomy',
    'Growth',
    'Play',
    'Belonging',
  ];
  const tones = ['playful', 'romantic', 'reflective', 'deep']; // Single selection
  const difficulties = [1, 2, 3, 4, 5];
  const statuses = ['Draft', 'Published'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-white/20 rounded-2xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-br from-slate-900 to-purple-900 pb-4 z-10">
          <h2 className="text-2xl font-bold text-white">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              placeholder="Enter question text..."
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category and Gender Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-2">
                Gender Focus *
              </label>
              <select
                value={formData.genderFocus}
                onChange={(e) =>
                  setFormData({ ...formData, genderFocus: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={isSubmitting}
              >
                {genderFocuses.map((focus) => (
                  <option key={focus} value={focus} className="bg-slate-800">
                    {focus}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Tone *</label>
              <select
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={isSubmitting}
              >
                {tones.map((t) => (
                  <option key={t} value={t} className="bg-slate-800">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-2">
                Difficulty (1-5) *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: Number(e.target.value) })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={isSubmitting}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d} className="bg-slate-800">
                    {d} - {d === 1 ? 'Very Easy' : d === 2 ? 'Easy' : d === 3 ? 'Medium' : d === 4 ? 'Hard' : 'Very Hard'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as 'Draft' | 'Published' })
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-slate-800">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Stage */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">
              Relationship Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {relationshipStages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleArrayChange('relationshipStage', stage)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    formData.relationshipStage?.includes(stage)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                  disabled={isSubmitting}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Living Type */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">Living Type</label>
            <div className="flex flex-wrap gap-2">
              {livingTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleArrayChange('livingType', type)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    formData.livingType?.includes(type)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                  disabled={isSubmitting}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">Goals</label>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleArrayChange('goalTag', goal)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    formData.goalTag?.includes(goal)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                  disabled={isSubmitting}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Emotional Needs */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">
              Emotional Needs
            </label>
            <div className="flex flex-wrap gap-2">
              {emotionalNeeds.map((need) => (
                <button
                  key={need}
                  type="button"
                  onClick={() => handleArrayChange('emotionalNeed', need)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    formData.emotionalNeed?.includes(need)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                  disabled={isSubmitting}
                >
                  {need}
                </button>
              ))}
            </div>
          </div>

          {/* Writer Notes */}
          <div>
            <label className="block text-purple-200 text-sm mb-2">Writer Notes</label>
            <textarea
              value={formData.writerNotes}
              onChange={(e) => setFormData({ ...formData, writerNotes: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              placeholder="Optional notes for writers..."
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10 sticky bottom-0 bg-gradient-to-br from-slate-900 to-purple-900 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {question ? 'Updating...' : 'Adding...'}
                </span>
              ) : question ? (
                'Update Question'
              ) : (
                'Add Question'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


