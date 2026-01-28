import React, { useState, useEffect } from 'react';
import { Loader, RefreshCw, Unlock} from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { unlockService } from '../services/unlock';

export const Unlocks: React.FC = () => {
  const [expiringUnlocks, setExpiringUnlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpiringUnlocks();
  }, []);

  const fetchExpiringUnlocks = async () => {
    try {
      setLoading(true);
      const data = await unlockService.getExpiringUnlocks(7);
      setExpiringUnlocks(data.unlocks || []);
      setError('');
    } catch (err: any) {
      console.error('❌ Failed to fetch expiring unlocks:', err);
      setError(err.response?.data?.message || 'Failed to fetch expiring unlocks');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExpiries = async () => {
    if (!confirm('Are you sure you want to process all expired unlocks?')) {
      return;
    }

    try {
      setProcessing(true);
      const result = await unlockService.processExpiries();
      setSuccess(`Successfully processed ${result.processed} expired unlocks`);
      setError('');
      // Refresh the list
      setTimeout(() => {
        fetchExpiringUnlocks();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process expiries');
      setSuccess('');
    } finally {
      setProcessing(false);
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F2935] mb-2">Unlock & Refresh Management</h1>
        <p className="text-[#626262]">Process temporary unlock expiries and manage refresh bundles</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-800 px-4 py-3 rounded-xl mb-6">
          {success}
        </div>
      )}

      {/* Process Expiries Section */}
      <div className="bg-white border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1F2935] mb-2">Process Expired Unlocks</h2>
            <p className="text-[#626262] text-sm">
              Manually process all temporary category unlocks that have expired
            </p>
          </div>
          <button
            onClick={handleProcessExpiries}
            disabled={processing}
            className="px-6 py-3 bg-[#FF7E3D] text-white rounded-xl font-medium hover:bg-[#FF7E3D]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {processing ? (
              <>
                <Loader className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Process Expiries
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expiring Unlocks Section */}
      <div className="bg-white border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1F2935]">Expiring Unlocks (Next 7 Days)</h2>
          <span className="px-3 py-1 bg-orange-500/20 text-orange-700 rounded-full text-sm font-medium">
            {expiringUnlocks.length} expiring
          </span>
        </div>

        {expiringUnlocks.length === 0 ? (
          <div className="text-center py-12 text-[#626262]">
            <Unlock className="mx-auto mb-4 text-[#626262]" size={48} />
            <p>No unlocks expiring in the next 7 days</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FF7E3D]/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">
                    Couple ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">
                    Days Remaining
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {expiringUnlocks.map((unlock: any, index: number) => {
                  const expiresAt = new Date(unlock.unlockExpiry);
                  const now = new Date();
                  const daysRemaining = Math.ceil(
                    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2935]">
                        {unlock.coupleId?._id || unlock.coupleId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1F2935]">
                        {unlock.categoryId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#626262]">
                        {expiresAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            daysRemaining <= 1
                              ? 'bg-red-500/20 text-red-700 border border-red-500/30'
                              : daysRemaining <= 3
                              ? 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
                          }`}
                        >
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

