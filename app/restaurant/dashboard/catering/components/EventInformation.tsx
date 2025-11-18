/**
 * EventInformation Component
 * Displays event details like date, time, delivery address
 */

import { formatDate, formatEventTime } from "../utils/format.utils";

interface EventInformationProps {
  eventDate: string;
  eventTime: string;
  collectionTime?: string;
  deliveryAddress: string;
  payoutAccountName: string | null;
}

export function EventInformation({
  eventDate,
  eventTime,
  collectionTime,
  deliveryAddress,
  payoutAccountName,
}: EventInformationProps) {
  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
        Event Information
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p className="text-gray-600">
          Date:{" "}
          <span className="text-gray-900 font-medium">
            {formatDate(eventDate)}
          </span>
        </p>
        <p className="text-gray-600">
          Collection Time:{" "}
          <span className="text-gray-900 font-medium">
            {collectionTime ? collectionTime : formatEventTime(eventTime)}
          </span>
        </p>
        <p className="text-gray-600">
          Account:{" "}
          <span className="text-gray-900 font-medium">
            {payoutAccountName || "Not selected"}
          </span>
        </p>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Delivery:{" "}
        <span className="text-gray-900 font-medium">{deliveryAddress}</span>
      </p>
    </div>
  );
}
