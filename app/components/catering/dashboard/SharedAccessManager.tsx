// app/components/catering/dashboard/SharedAccessManager.tsx
'use client';

import React, { useState } from 'react';
import { CateringOrderDetails, AddSharedAccessDto, RemoveSharedAccessDto } from '@/types/catering.types';
import { cateringService } from '@/services/cateringServices';
import { Users, Mail, Trash2, Plus, X } from 'lucide-react';

interface SharedAccessManagerProps {
  order: CateringOrderDetails;
  onUpdate: () => void;
}

export default function SharedAccessManager({ order, onUpdate }: SharedAccessManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharedUsers = order.sharedAccessUsers || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const dto: AddSharedAccessDto = {
        orderId: order.id,
        name: formData.name,
        email: formData.email,
      };

      await cateringService.addSharedAccess(dto);
      setIsAdding(false);
      setFormData({ name: '', email: '' });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to add shared access');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove access for ${email}?`)) return;

    try {
      const dto: RemoveSharedAccessDto = {
        orderId: order.id,
        email,
      };

      await cateringService.removeSharedAccess(dto);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to remove shared access');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-pink-500" />
          Shared Access
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
              placeholder="Jane Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
              placeholder="jane@example.com"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 text-sm"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setFormData({ name: '', email: '' });
                setError(null);
              }}
              className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 text-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {sharedUsers.length > 0 ? (
        <div className="space-y-2">
          {sharedUsers.map((user, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {user.addedBy === 'system-cc' && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    CC Recipient
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(user.email)}
                className="ml-3 text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                title="Remove access"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No shared users yet</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Shared users can view order details, update pickup contact, and change delivery time.
        </p>
      </div>
    </div>
  );
}