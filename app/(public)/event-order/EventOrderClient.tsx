"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CateringProvider, useCatering } from "@/context/CateringContext";
import { CateringFilterProvider } from "@/context/CateringFilterContext";
import CateringOrderBuilder from "@/lib/components/catering/CateringOrderBuilder";
import Step3ContactInfo from "@/lib/components/catering/Step3ContactDetails";
import * as chatApi from "@/lib/components/chatbot/api";
import type { OrderDraftHandoff } from "@/lib/types/order-draft-handoff";

function CateringSteps() {
  const { currentStep } = useCatering();
  return (
    <div className="min-h-screen">
      <div className="py-2 max-w mx-auto bg-base-100">
        <div className="bg-base-100 rounded-lg max-w-none">
          {currentStep === 1 && <CateringOrderBuilder />}
          {currentStep === 2 && <Step3ContactInfo />}
        </div>
      </div>
    </div>
  );
}

/**
 * Resolve `?draftSessionId=` BEFORE mounting CateringProvider so the
 * provider can seed from the handoff in its very first render — no
 * flash of localStorage-loaded state, no race between effects.
 *
 * Three terminal states for the resolver:
 *   - `null`           no draft id on the URL → mount provider with no handoff (normal flow)
 *   - OrderDraftHandoff  fetched and shaped → mount provider with it
 *   - `undefined`      still resolving → thin loading state, don't mount the provider yet
 */
type ResolveState = OrderDraftHandoff | null | undefined;

export default function EventOrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const draftSid = searchParams?.get("draftSessionId");

  const [handoff, setHandoff] = useState<ResolveState>(
    draftSid ? undefined : null,
  );
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftSid) return;
    let cancelled = false;
    chatApi
      .getSession(draftSid)
      .then((response) => {
        if (cancelled) return;
        const h = chatApi.chatSessionToHandoff(response);
        if (!h) {
          setResolveError(
            "That draft isn't ready to order yet — go back to the chat and confirm your menu first.",
          );
          setHandoff(null);
          return;
        }
        setHandoff(h);
      })
      .catch(() => {
        if (cancelled) return;
        setResolveError(
          "We couldn't load that draft. Continuing without prefill.",
        );
        setHandoff(null);
      });
    return () => {
      cancelled = true;
    };
  }, [draftSid]);

  // Once the handoff has been applied (or skipped), strip the query
  // param so a refresh / share-link doesn't re-apply on top of the
  // user's edits.
  useEffect(() => {
    if (!draftSid || handoff === undefined) return;
    router.replace(pathname, { scroll: false });
  }, [draftSid, handoff, router, pathname]);

  if (handoff === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-base-content/60">Loading your draft…</div>
      </div>
    );
  }

  return (
    <CateringProvider initialHandoff={handoff}>
      <CateringFilterProvider>
        {resolveError && (
          <div className="max-w-2xl mx-auto mt-3 px-4">
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              {resolveError}
            </div>
          </div>
        )}
        <CateringSteps />
      </CateringFilterProvider>
    </CateringProvider>
  );
}
