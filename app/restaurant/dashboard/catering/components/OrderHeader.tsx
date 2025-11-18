/**
 * OrderHeader Component
 * Displays order reference and status badge
 */

interface OrderHeaderProps {
  orderId: string;
}

export function OrderHeader({ orderId }: OrderHeaderProps) {

  return (
    <div className="w-full flex justify-center mb-3">
      <span className="text-xl text-gray-500 text-center">
        <b className="text-primary">
          Reference: {orderId.slice(0, 4).toUpperCase()}
        </b>
      </span>
    </div>
  );
}
