"use client";

import { Zap, Loader } from "lucide-react";
import { SettingsCard } from "../components/SettingsCard";
import { NumberFieldWithUnit } from "../components/NumberFieldWithUnit";
import { ToggleRow } from "../components/ToggleRow";
import { SaveBar } from "../components/SaveBar";
import { useAutoAcceptState } from "../hooks/useAutoAcceptState";

interface Props {
  restaurantId: string;
}

/**
 * Auto-Accept tab — which orders skip the manual accept step. Two orthogonal
 * thresholds: quantity and price. Either one being set means "auto-accept
 * orders under that limit". Both null = no auto-accept.
 */
export const AutoAcceptTab = ({ restaurantId }: Props) => {
  const state = useAutoAcceptState(restaurantId);

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center gap-3 text-gray-600">
        <Loader className="animate-spin" size={20} />
        <span>Loading auto-accept settings…</span>
      </div>
    );
  }

  const { maxQuantity, maxPrice, setMaxQuantity, setMaxPrice } = state;

  return (
    <SettingsCard
      icon={Zap}
      title="Auto-Accept"
      subtitle="Automatically accept qualifying orders without a manual click"
      accent="amber"
      footer={
        <SaveBar
          label="Save Auto-Accept"
          saving={state.saving}
          enabled={state.hasChanges}
          onClick={state.save}
          success={state.success}
          error={state.error}
          accent="amber"
        />
      }
    >
      <ToggleRow
        title="Cap on order quantity"
        subtitle="Orders with at most this many items will be auto-accepted"
        enabled={maxQuantity !== null}
        onChange={(next) => setMaxQuantity(next ? maxQuantity ?? 10 : null)}
        accent="amber"
      >
        <NumberFieldWithUnit
          value={maxQuantity ?? 10}
          onChange={(v) => setMaxQuantity(v)}
          min={1}
          unitLabel="items maximum"
          placeholder="10"
          accent="amber"
          ariaLabel="Auto-accept max quantity"
        />
      </ToggleRow>

      <ToggleRow
        title="Cap on order price"
        subtitle="Orders below this price will be auto-accepted"
        enabled={maxPrice !== null}
        onChange={(next) => setMaxPrice(next ? maxPrice ?? 150 : null)}
        accent="amber"
      >
        <NumberFieldWithUnit
          value={maxPrice ?? 150}
          onChange={(v) => setMaxPrice(v)}
          min={0}
          step={0.01}
          prefix="GBP"
          unitLabel="price threshold"
          placeholder="150.00"
          accent="amber"
          ariaLabel="Auto-accept max price"
        />
      </ToggleRow>
    </SettingsCard>
  );
};
