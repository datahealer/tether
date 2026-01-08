import React, { useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { StatsCards } from '../components/ui/Stats';
import { CategoryTable } from '../components/ui/category/CategoryTable';
import { CategoryModal } from '../components/ui/category/categoryModal';
import { categoriesService, Category } from '../services/category';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { BarChart3, TrendingUp, Edit, Eye } from 'lucide-react';

export const CategoryDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
const [showViewModal, setShowViewModal] = useState(false);
const [viewCategory, setViewCategory] = useState<Category | null>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });
const totalPages = Math.ceil(categories.length / itemsPerPage);

const paginatedCategories = categories.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  const createMutation = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const handleSave = async (data: Partial<Category>) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({ id: selectedCategory._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

const handleDelete = (id: string) => {
  const category = categories.find((c) => c._id === id);
  if (!category) return;

  setDeleteCategory(category);
  setShowDeleteModal(true);
};
const confirmDeleteCategory = async () => {
  if (!deleteCategory) return;

  try {
    await deleteMutation.mutateAsync(deleteCategory._id);
  } finally {
    setShowDeleteModal(false);
    setDeleteCategory(null);
  }
};


  const stats = {
    total: categories.length,
    published: categories.length,
    draft: 0,
    totalViews: 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-[#FF7E3D]" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-start md:items-center  flex-col md:flex-row gap-4  justify-between mb-12 border-b border-white/10 pb-6">
    <div className="flex gap-8">
       <Link
         to="/dashboard"
         activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
         inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
         className="text-2xl cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
       >
         Questions
       </Link>
       <Link
         to="/categories"
         activeProps={{ className: 'text-[#FF7E3D] border-b-2 border-[#FF7E3D] pb-2' }}
         inactiveProps={{ className: 'text-[#1F2935]/70 hover:text-[#1F2935]' }}
         className="text-2xl cursor-pointer font-semibold transition-colors border-[#1F2935] border rounded-xl p-3 text-[#1F2935]/70"
       >
         Categories
       </Link>
     </div>
      <div className="flex items-center justify-between">
       
        <button 
    onClick={() => setShowModal(true)}
    className="bg-[#FF7E3D] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
  >
    <Plus size={20} />
    Add Category
  </button>
      </div>
      </div>
 <div className='mb-4'>
          <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Category Management</h1>
          <p className="text-[#1F2935]">Create and manage relationship categories</p>
        </div>
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-6">
          Failed to load categories
        </div>
      )}

<StatsCards
  cards={[
    {
      label: 'Total Categories',
      value: stats.total,
      icon: <BarChart3 className="text-white" size={24} />,
      gradient: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/20',
    },
    {
      label: 'Published Categories',
      value: stats.published,
      icon: <TrendingUp className="text-white" size={24} />,
      gradient: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Draft Categories',
      value: stats.draft,
      icon: <Edit className="text-white" size={24} />,
      gradient: 'from-orange-500/20 to-orange-600/20',
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/20',
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: <Eye className="text-white" size={24} />,
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/20',
    },
  ]}
/>

      <CategoryTable
        categories={paginatedCategories}
        onEdit={(cat) => {
          setSelectedCategory(cat);
          setShowModal(true);
        }}
        onDelete={handleDelete}
onView={(cat) => {
  setViewCategory(cat);
  setShowViewModal(true);
}}
      />
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-white/10 rounded-2xl px-4 sm:px-6 py-4'>
  <p className="text-sm text-[#626262]">
    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
    {Math.min(currentPage * itemsPerPage, categories.length)} of{" "}
    {categories.length} categories
  </p>

  <div className="flex gap-2">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="px-4 py-2 rounded-lg border border-[#FF7E3D] disabled:opacity-50"
    >
      Prev
    </button>

    {Array.from({ length: totalPages }).map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-4 py-2 rounded-lg border ${
          currentPage === i + 1
            ? 'bg-[#FF7E3D] text-white'
            : 'bg-white border-[#626262] '
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="px-4 py-2 rounded-lg border border-[#FF7E3D] disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
        category={selectedCategory}
      />
      {/* View Category Modal */}
{showViewModal && viewCategory && (
  
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">

      {/* Close */}
      <button
        onClick={() => {
          setShowViewModal(false);
          setViewCategory(null);
        }}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-2xl font-semibold text-[#1F2935] mb-6">
        View Category
      </h2>

      <div className="space-y-4 text-[#1F2935]">
        <div>
          <p className="text-sm text-gray-500">Category </p>
          <p className="font-medium">{viewCategory.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Color Code</p>
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: viewCategory.colorCode }}
            />
            <span className="font-medium">{viewCategory.colorCode}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="font-medium">
            {viewCategory.description || 'No description'}
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => {
            setShowViewModal(false);
            setViewCategory(null);
          }}
          className="px-6 py-2 rounded-xl bg-[#FF7E3D] text-white font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{showDeleteModal && deleteCategory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
    <div className="bg-white rounded-2xl w-full max-w-md p-6">

      <h2 className="text-xl font-semibold text-[#1F2935] mb-4">
        Delete Category
      </h2>

      <p className="text-[#626262] mb-2">
        Are you sure you want to delete
        <span className="font-semibold"> {deleteCategory.name}</span>?
      </p>

      <p className="text-sm text-red-500 mb-6">
        Questions will remain but lose category association.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteCategory(null);
          }}
          className="px-5 py-2 rounded-xl border border-gray-300 text-[#1F2935]"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteCategory}
          className="px-5 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </DashboardLayout>
  );
};