import React, { useState, useEffect } from 'react';
import { Loader, Search } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Dashboard_layout';
import { userService, User } from '../services/user';
import { coupleService } from '../services/couple';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [grantDays, setGrantDays] = useState('30');
  const [isLifetime, setIsLifetime] = useState(false);
  const [refreshAmount, setRefreshAmount] = useState('1');
  const [partnerEmail, setPartnerEmail] = useState('');

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (selectedTier !== 'All') {
        params.tier = selectedTier.toLowerCase();
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await userService.getAll(params);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setError('');
    } catch (err: any) {
      console.error('❌ Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedTier, searchTerm]);

  const handleGrantPremium = async () => {
    if (!selectedUser) return;
    try {
      await userService.grantPremium(
        selectedUser._id,
        isLifetime ? undefined : parseInt(grantDays),
        isLifetime
      );
      alert('Premium granted successfully!');
      setShowGrantModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to grant premium');
    }
  };

  const handleRevokePremium = async () => {
    if (!selectedUser) return;
    try {
      await userService.revokePremium(selectedUser._id);
      alert('Premium revoked successfully!');
      setShowRevokeModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke premium');
    }
  };

  const handleAddRefreshBundle = async () => {
    if (!selectedUser) return;
    try {
      await userService.addRefreshBundle(selectedUser._id, parseInt(refreshAmount));
      alert(`Added ${refreshAmount} refresh bundles!`);
      setShowRefreshModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add refresh bundle');
    }
  };

  const handleLinkPartner = async () => {
    if (!selectedUser || !partnerEmail) return;
    try {
      await coupleService.linkPartners(selectedUser._id, partnerEmail);
      alert('Partners linked successfully!');
      setShowLinkModal(false);
      setSelectedUser(null);
      setPartnerEmail('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to link partners');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'premium':
      case 'lifetime':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'trial':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  if (loading && users.length === 0) {
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
        <h1 className="text-3xl font-bold text-[#1F2935] mb-2">User Management</h1>
        <p className="text-[#626262]">View and manage users, subscriptions, and partners</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626262]" size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-[#626262] rounded-xl bg-white text-[#1F2935] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
          />
        </div>
        <select
          value={selectedTier}
          onChange={(e) => {
            setSelectedTier(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-[#626262] rounded-xl bg-white text-[#1F2935] focus:outline-none focus:ring-2 focus:ring-[#FF7E3D]"
        >
          <option value="All">All States</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="trial">Trial</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FF7E3D]/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1F2935] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#1F2935]">{user.name || user.email}</div>
                      <div className="text-sm text-[#626262]">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(user.subscriptionState)}`}>
                      {user.subscriptionState.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#626262]">
                    {user.partnerId ? 'Linked' : 'No Partner'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {user.subscriptionState === 'free' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowGrantModal(true);
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs"
                        >
                          Grant Premium
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRevokeModal(true);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRefreshModal(true);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
                      >
                        Add Refresh
                      </button>
                      {!user.partnerId && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowLinkModal(true);
                          }}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs"
                        >
                          Link Partner
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-[#FF7E3D] rounded-xl text-[#1F2935] disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-[#626262]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-[#FF7E3D] rounded-xl text-[#1F2935] disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Grant Premium Modal */}
      {showGrantModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-[#1F2935] mb-4">Grant Premium</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#626262] mb-2">User</label>
                <p className="text-[#1F2935] font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isLifetime}
                    onChange={(e) => setIsLifetime(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-[#626262]">Lifetime Premium</span>
                </label>
              </div>
              {!isLifetime && (
                <div>
                  <label className="block text-sm text-[#626262] mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={grantDays}
                    onChange={(e) => setGrantDays(e.target.value)}
                    className="w-full px-4 py-2 border border-[#626262] rounded-xl"
                    min="1"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#1F2935]"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantPremium}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
              >
                Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Premium Modal */}
      {showRevokeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-[#1F2935] mb-4">Revoke Premium</h2>
            <p className="text-[#626262] mb-6">
              Are you sure you want to revoke premium from {selectedUser.email}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#1F2935]"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokePremium}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Refresh Bundle Modal */}
      {showRefreshModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-[#1F2935] mb-4">Add Refresh Bundle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#626262] mb-2">User</label>
                <p className="text-[#1F2935] font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm text-[#626262] mb-2">Amount</label>
                <input
                  type="number"
                  value={refreshAmount}
                  onChange={(e) => setRefreshAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-[#626262] rounded-xl"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRefreshModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#1F2935]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRefreshBundle}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Partner Modal */}
      {showLinkModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-[#1F2935] mb-4">Link Partner</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#626262] mb-2">User</label>
                <p className="text-[#1F2935] font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm text-[#626262] mb-2">Partner Email</label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-[#626262] rounded-xl"
                  placeholder="partner@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedUser(null);
                  setPartnerEmail('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#1F2935]"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkPartner}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

