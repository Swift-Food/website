// app/components/catering/dashboard/DeliveryTimeManager.tsx
'use client';

import React, { useState } from 'react';
import { UpdateDeliveryTimeDto } from '@/types/catering.types';
import { CateringOrderResponse } from '@/types/api';
import { cateringService } from '@/services/api/catering.api';
import { Clock, AlertCircle, CalendarDays } from 'lucide-react';
import { formatTimeDisplay } from '../catering-order-helpers';

interface DeliveryTimeManagerProps {
  order: CateringOrderResponse;
  onUpdate: () => void;
  accessToken: string;
}

interface SessionTimeEditorProps {
  sessionId?: string;
  sessionName: string;
  formattedDate?: string;
  eventTime: string;
  eventDate: string | Date;
  deliveryTimeChangedAt?: string | Date;
  orderId: string;
  accessToken: string;
  onUpdate: () => void;
}

function SessionTimeEditor({ sessionId, sessionName, formattedDate, eventTime, eventDate, deliveryTimeChangedAt, orderId, accessToken, onUpdate }: SessionTimeEditorProps) {
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
    <div className="bg-gray-50 rounded-xl p-4">
      {/* Header row: date badge + session name */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {formattedDate && (
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              <span className="text-xs font-medium text-pink-500">{formattedDate}</span>
            </div>
          )}
          {sessionName && (
            <p className="text-sm font-semibold text-gray-800 truncate">{sessionName}</p>
          )}
        </div>
        {!isEditing && canChangeTime && (
          <button
            onClick={() => setIsEditing(true)}
            className="shrink-0 text-xs text-pink-600 hover:text-pink-700 font-semibold bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            Change Time
          </button>
        )}
      </div>

      {!canChangeTime && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
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
        <div>
          <p className="text-xl font-bold text-gray-900 tracking-tight">{formatTimeDisplay(eventTime)}</p>
          {deliveryTimeChangedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Updated {new Date(deliveryTimeChangedAt).toLocaleString('en-GB')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveryTimeManager({ order, onUpdate, accessToken }: DeliveryTimeManagerProps) {
  const sessions = [...(order.mealSessions || [])].sort((a: any, b: any) => {
    const aDate = new Date(`${a.sessionDate || order.eventDate}T${a.eventTime || order.eventTime}`);
    const bDate = new Date(`${b.sessionDate || order.eventDate}T${b.eventTime || order.eventTime}`);
    return aDate.getTime() - bDate.getTime();
  });
  const hasMultipleSessions = sessions.length > 1;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
        Delivery Time
      </h3>

      {hasMultipleSessions ? (
        <div className="space-y-3">
          {sessions.map((session: any) => {
            const dateStr = session.sessionDate || order.eventDate;
            const formattedDate = new Date(dateStr).toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            });
            return (
              <SessionTimeEditor
                key={session.id}
                sessionId={session.id}
                sessionName={session.sessionName || 'Session'}
                formattedDate={formattedDate}
                eventTime={session.eventTime || order.eventTime}
                eventDate={session.sessionDate || order.eventDate}
                deliveryTimeChangedAt={session.deliveryTimeChangedAt}
                orderId={order.id}
                accessToken={accessToken}
                onUpdate={onUpdate}
              />
            );
          })}
        </div>
      ) : (
        <SessionTimeEditor
          sessionName=""
          eventTime={order.eventTime}
          eventDate={order.eventDate}

          deliveryTimeChangedAt={order.deliveryTimeChangedAt}
          orderId={order.id}
          accessToken={accessToken}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
