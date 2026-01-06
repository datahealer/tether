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
  const getStatusColor = (status: string) => {
    return status === 'Published'
      ? 'bg-green-500/20 text-green-800'
      : 'bg-orange-500/20 text-orange-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-white/10 rounded-2xl overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="text-left px-6 py-4 text-[#3e3e3e] font-semibold">Question</th>
              <th className="text-left px-6 py-4 text-[#3e3e3e] font-semibold">Category</th>
              <th className="text-left px-6 py-4 text-[#3e3e3e] font-semibold">Type</th>
              <th className="text-left px-6 py-4 text-[#3e3e3e] font-semibold">Gender Focus</th>
              <th className="text-left px-6 py-4 text-[#3e3e3e] font-semibold">Date Added</th>
              <th className="text-right px-6 py-4 text-[#3e3e3e] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q._id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 text-[#1F2935] font-medium max-w-md truncate">
                  {q.question}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-[#626262]-500/20 text-[#626262]-800 rounded-lg text-sm">
                    {q.categoryId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(q.status)}`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-800 rounded-lg text-sm">
                    {q.genderFocus}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#3e3e3e]">{formatDate(q.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(q)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#626262]"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(q)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#626262]"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(q._id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-600"
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
