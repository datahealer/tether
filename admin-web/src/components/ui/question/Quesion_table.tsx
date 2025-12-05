import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Question } from '../../../services/question';

interface QuestionsTableProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onView: (question: Question) => void;
}

export const QuestionsTable: React.FC<QuestionsTableProps> = ({
  questions,
  onEdit,
  onDelete,
  onView,
}) => {
  const getDifficultyColor = (isPremium: boolean) => {
    return isPremium
      ? 'bg-orange-500/20 text-orange-300'
      : 'bg-green-500/20 text-green-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="text-left px-6 py-4 text-purple-200 font-semibold">Question</th>
              <th className="text-left px-6 py-4 text-purple-200 font-semibold">Category</th>
              <th className="text-left px-6 py-4 text-purple-200 font-semibold">Type</th>
              <th className="text-left px-6 py-4 text-purple-200 font-semibold">Gender Focus</th>
              <th className="text-left px-6 py-4 text-purple-200 font-semibold">Date Added</th>
              <th className="text-right px-6 py-4 text-purple-200 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q._id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 text-white font-medium max-w-md truncate">
                  {q.question}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                    {q.categoryId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${getDifficultyColor(q.isPremium)}`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                    {q.genderFocus}
                  </span>
                </td>
                <td className="px-6 py-4 text-purple-200">{formatDate(q.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(q)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(q)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-400"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(q._id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};