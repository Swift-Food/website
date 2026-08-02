"use client";

import Link from "next/link";

interface PartnerNotFoundProps {
  slug: string;
}

export default function PartnerNotFound({ slug }: PartnerNotFoundProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        This catering page isn&apos;t available
      </h1>
      <p className="text-gray-600">
        We couldn&apos;t find a partner matching{" "}
        <span className="font-mono text-gray-900">{slug}</span>. The link may be
        out of date. If you arrived here from another website, please get in
        touch with their team.
      </p>
      <p className="text-gray-600">
        You can still place a catering order with us directly.
      </p>
      <Link
        href="/event-order"
        className="mt-2 rounded-full bg-[#fa43ad] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
      >
        Continue on Swift Food
      </Link>
    </div>
  );
}
