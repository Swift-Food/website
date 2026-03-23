// app/components/catering/dashboard/DeliveryTimeManager.tsx
'use client';

import React, { useState } from 'react';
import { UpdateDeliveryTimeDto } from '@/types/catering.types';
import { CateringOrderResponse } from '@/types/api';
import { cateringService } from '@/services/api/catering.api';
import { Clock, AlertCircle } from 'lucide-react';
import { formatTimeDisplay } from '../catering-order-helpers';

interface DeliveryTimeManagerProps {
  order: CateringOrderResponse;
  onUpdate: () => void;
  accessToken: string;
}

interface SessionTimeEditorProps {
  sessionId?: string;
  sessionName: string;
  eventTime: string;
  eventDate: string | Date;
  collectionTime?: string;
  deliveryTimeChangedAt?: string | Date;
  orderId: string;
  accessToken: string;
  onUpdate: () => void;
}

function SessionTimeEditor({ sessionId, sessionName, eventTime, eventDate, collectionTime, deliveryTimeChangedAt, orderId, accessToken, onUpdate }: SessionTimeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTime, setNewTime] = useState(eventTime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHoursUntilEvent = () => {
    const dt = new Date(eventDate);
    const [h, m] = eventTime.split(':');
    dt.setHours(parseInt(h), parseInt(m));
    return (dt.getTime() - Date.now()) / (1000 * 60 * 60);
  };

  const hoursUntilEvent = getHoursUntilEvent();
  const canChangeTime = hoursUntilEvent >= 48;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTime === eventTime) { setIsEditing(false); return; }

    try {
      setLoading(true);
      setError(null);
      const dto: UpdateDeliveryTimeDto = {
        orderId,
        newEventTime: newTime,
        accessToken,
        ...(sessionId ? { sessionId } : {}),
      };
      await cateringService.updateDeliveryTime(dto);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update delivery time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {sessionName && (
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{sessionName}</p>
      )}

      {!canChangeTime && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              {hoursUntilEvent < 48 ? 'Cannot change within 48 hours of event.' : 'Only paid or confirmed orders can be changed.'}
            </p>
          </div>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">New Event Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 text-xs">
              {loading ? 'Updating...' : 'Update Time'}
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setNewTime(eventTime); setError(null); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 text-xs">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatTimeDisplay(eventTime)}</p>
            {collectionTime && <p className="text-xs text-gray-600">Collection: {collectionTime}</p>}
            {deliveryTimeChangedAt && <p className="text-xs text-gray-400 mt-0.5">Changed: {new Date(deliveryTimeChangedAt).toLocaleString('en-GB')}</p>}
          </div>
          {canChangeTime && (
            <button onClick={() => setIsEditing(true)} className="text-xs text-pink-600 hover:text-pink-700 font-semibold">
              Change
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveryTimeManager({ order, onUpdate, accessToken }: DeliveryTimeManagerProps) {
  const sessions = order.mealSessions || [];
  const hasMultipleSessions = sessions.length > 1;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
        Delivery Time
      </h3>

      {hasMultipleSessions ? (
        <div className="space-y-4 divide-y divide-gray-100">
          {sessions.map((session: any) => (
            <div key={session.id} className="pt-3 first:pt-0">
              <SessionTimeEditor
                sessionId={session.id}
                sessionName={session.sessionName || `Session`}
                eventTime={session.eventTime || order.eventTime}
                eventDate={session.sessionDate || order.eventDate}
                collectionTime={session.collectionTime}
                deliveryTimeChangedAt={session.deliveryTimeChangedAt}
                orderId={order.id}
                accessToken={accessToken}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </div>
      ) : (
        <SessionTimeEditor
          sessionName=""
          eventTime={order.eventTime}
          eventDate={order.eventDate}
          collectionTime={order.collectionTime}
          deliveryTimeChangedAt={order.deliveryTimeChangedAt}
          orderId={order.id}
          accessToken={accessToken}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
