import React, { useState, useEffect } from 'react';
import { Loader, Users, Heart, FileQuestion, FolderOpen } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { statsService } from '../services/stats';
import { StatsCards } from '../components/ui/Stats';

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getBasicStats();
      console.log('📊 Stats data received:', data);
      setStats(data);
      setError('');
    } catch (err: any) {
      console.error('❌ Failed to fetch stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-[#FF7E3D]" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!stats || !stats.users || !stats.couples || !stats.questions || !stats.categories) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Admin Statistics</h1>
        <p className="text-[#626262]">Overview of platform metrics and counts</p>
      </div>

      <StatsCards
        cards={[
          {
            label: 'Total Users',
            value: stats.users?.total || 0,
            icon: <Users className="text-white" size={24} />,
            gradient: 'from-blue-500/20 to-blue-600/20',
            border: 'border-blue-500/30',
            bg: 'bg-blue-500/20',
          },
          {
            label: 'Active Couples',
            value: stats.couples?.active || 0,
            icon: <Heart className="text-white" size={24} />,
            gradient: 'from-pink-500/20 to-pink-600/20',
            border: 'border-pink-500/30',
            bg: 'bg-pink-500/20',
          },
          {
            label: 'Published Questions',
            value: stats.questions?.published || 0,
            icon: <FileQuestion className="text-white" size={24} />,
            gradient: 'from-purple-500/20 to-purple-600/20',
            border: 'border-purple-500/30',
            bg: 'bg-purple-500/20',
          },
          {
            label: 'Total Categories',
            value: stats.categories?.total || 0,
            icon: <FolderOpen className="text-white" size={24} />,
            gradient: 'from-green-500/20 to-green-600/20',
            border: 'border-green-500/30',
            bg: 'bg-green-500/20',
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* User Stats */}
        <div className="bg-white border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#1F2935] mb-4">User Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#626262]">Free Users</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.free || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Premium Users</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.premium || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Trial Users</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.trial || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Lifetime Users</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.lifetime || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Users with Partners</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.withPartners || 0}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-[#626262]">New Users (7 days)</span>
              <span className="font-medium text-[#1F2935]">{stats.users?.newLast7Days || 0}</span>
            </div>
          </div>
        </div>

        {/* Couple Stats */}
        <div className="bg-white border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#1F2935] mb-4">Couple Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#626262]">Total Couples</span>
              <span className="font-medium text-[#1F2935]">{stats.couples?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Active Couples</span>
              <span className="font-medium text-[#1F2935]">{stats.couples?.active || 0}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-[#626262]">New Couples (7 days)</span>
              <span className="font-medium text-[#1F2935]">{stats.couples?.newLast7Days || 0}</span>
            </div>
          </div>
        </div>

        {/* Question Stats */}
        <div className="bg-white border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#1F2935] mb-4">Question Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#626262]">Total Questions</span>
              <span className="font-medium text-[#1F2935]">{stats.questions?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Published</span>
              <span className="font-medium text-[#1F2935]">{stats.questions?.published || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Draft</span>
              <span className="font-medium text-[#1F2935]">{stats.questions?.draft || 0}</span>
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="bg-white border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#1F2935] mb-4">Subscription Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#626262]">Total Subscriptions</span>
              <span className="font-medium text-[#1F2935]">{stats.subscriptions?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Active</span>
              <span className="font-medium text-[#1F2935]">{stats.subscriptions?.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#626262]">Expired</span>
              <span className="font-medium text-[#1F2935]">{stats.subscriptions?.expired || 0}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-[#626262]">New (7 days)</span>
              <span className="font-medium text-[#1F2935]">{stats.subscriptions?.newLast7Days || 0}</span>
            </div>
          </div>
        </div>

        {/* Unlocks & Refresh Stats */}
        <div className="bg-white border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#1F2935] mb-4">Unlocks & Refreshes</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#626262]">Expiring Unlocks (7 days)</span>
              <span className="font-medium text-[#1F2935]">{stats.unlocks?.expiringNext7Days || 0}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-[#626262]">Total Refresh Bundles</span>
              <span className="font-medium text-[#1F2935]">{stats.refreshBundles?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

