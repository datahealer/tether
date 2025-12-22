import React from 'react';
import { BarChart3, TrendingUp, Edit, Eye } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <BarChart3 className="text-purple-300" size={24} />
          </div>
        </div>
        <p className="text-purple-200 text-sm mb-1">Total Questions</p>
        <p className="text-3xl font-bold text-white">{stats.total}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <TrendingUp className="text-green-300" size={24} />
          </div>
        </div>
        <p className="text-green-200 text-sm mb-1">Published</p>
        <p className="text-3xl font-bold text-white">{stats.published}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Edit className="text-orange-300" size={24} />
          </div>
        </div>
        <p className="text-orange-200 text-sm mb-1">Draft</p>
        <p className="text-3xl font-bold text-white">{stats.draft}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Eye className="text-blue-300" size={24} />
          </div>
        </div>
        <p className="text-blue-200 text-sm mb-1">Total Views</p>
        <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
      </div>
    </div>
  );
};