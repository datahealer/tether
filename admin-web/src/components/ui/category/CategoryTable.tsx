import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Category } from '../../../services/category'; // Assume new service

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onView: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="bg-white border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5">
            <th className="px-6 py-4 text-left text-[#626262] text-sm font-medium">Name</th>
            <th className="px-6 py-4 text-left text-[#626262] text-sm font-medium">ID</th>
            <th className="px-6 py-4 text-left text-[#626262] text-sm font-medium">Color</th>
            <th className="px-6 py-4 text-left text-[#626262] text-sm font-medium">Questions</th>
            <th className="px-6 py-4 text-left text-[#626262] text-sm font-medium">Date Added</th>
            <th className="px-6 py-4 text-right text-[#626262] text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-[#1F2935]">{cat.name}</td>
              <td className="px-6 py-4 text-[#626262]">{cat.categoryId}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.colorCode }} />
                  <span className="text-[#626262]">{cat.colorCode}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-[#1F2935]">{cat.totalQuestions}</td>
              <td className="px-6 py-4 text-[#626262]">
                {new Date(cat.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(cat)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#626262] hover:text-[#1F2935]"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(cat)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#626262] hover:text-[#1F2935]"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(cat._id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-600 hover:text-[#1F2935]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && (
        <div className="p-8 text-center text-[#626262]">No categories found</div>
      )}
    </div>
    </div>
  );
};