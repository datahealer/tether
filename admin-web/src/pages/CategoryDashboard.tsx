import React, { useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { StatsCards } from '../components/ui/Stats';
import { CategoryTable } from '../components/ui/category/CategoryTable';
import { CategoryModal } from '../components/ui/category/categoryModal';
import { categoriesService, Category } from '../services/category';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

export const CategoryDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Questions will remain but lose association.')) return;
    await deleteMutation.mutateAsync(id);
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

      <StatsCards stats={stats} />

      <CategoryTable
        categories={categories}
        onEdit={(cat) => {
          setSelectedCategory(cat);
          setShowModal(true);
        }}
        onDelete={handleDelete}
        onView={(cat) => alert(`ID: ${cat.categoryId}\nColor: ${cat.colorCode}\n${cat.description || 'No description'}`)}
      />

      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
        category={selectedCategory}
      />
    </DashboardLayout>
  );
};