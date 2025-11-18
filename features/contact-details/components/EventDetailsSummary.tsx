import { EventDetails } from '@/types/catering.types';

interface EventDetailsSummaryProps {
  eventDetails: EventDetails | null;
}

export function EventDetailsSummary({ eventDetails }: EventDetailsSummaryProps) {
  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-base-300">
      <div className="flex justify-between text-sm">
        <span className="text-base-content/70">Event Date & Time</span>
        <span className="font-semibold text-base-content text-right">
          {eventDetails?.eventDate}
          <br />
          {eventDetails?.eventTime}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-base-content/70">Type of Event</span>
        <span className="font-semibold text-base-content capitalize">
          {eventDetails?.eventType}
        </span>
      </div>
    </div>
  );
}
