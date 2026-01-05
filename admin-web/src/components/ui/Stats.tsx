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
            <BarChart3 className="text-white" size={24} />
          </div>
        </div>
        <p className="text-white text-sm mb-1">Total Questions</p>
        <p className="text-3xl font-bold text-[#1F2935]">{stats.total}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
        <p className="text-white text-sm mb-1">Published</p>
        <p className="text-3xl font-bold text-[#1F2935]">{stats.published}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Edit className="text-white" size={24} />
          </div>
        </div>
        <p className="text-white text-sm mb-1">Draft</p>
        <p className="text-3xl font-bold text-[#1F2935]">{stats.draft}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Eye className="text-white" size={24} />
          </div>
        </div>
        <p className="text-white text-sm mb-1">Total Views</p>
        <p className="text-3xl font-bold text-[#1F2935]">{stats.totalViews.toLocaleString()}</p>
      </div>
    </div>
  );
};