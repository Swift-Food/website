interface PromoCodeInputProps {
  promoCodes: string[];
  promoInput: string;
  validatingPromo: boolean;
  promoError: string;
  promoSuccess: string;
  onPromoInputChange: (value: string) => void;
  onApplyPromoCode: () => void;
  onRemovePromoCode: (code: string) => void;
}

export function PromoCodeInput({
  promoCodes,
  promoInput,
  validatingPromo,
  promoError,
  promoSuccess,
  onPromoInputChange,
  onApplyPromoCode,
  onRemovePromoCode,
}: PromoCodeInputProps) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-3 text-base-content">Discount Code</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={promoInput}
          onChange={(e) => onPromoInputChange(e.target.value.toUpperCase())}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onApplyPromoCode();
            }
          }}
          placeholder="Add discount code or voucher"
          className="flex-1 px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-xs"
        />
        <button
          type="button"
          onClick={onApplyPromoCode}
          disabled={validatingPromo || !promoInput.trim()}
          className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:bg-base-300 disabled:cursor-not-allowed text-sm"
        >
          {validatingPromo ? '...' : 'Apply'}
        </button>
      </div>

      {promoError && (
        <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg">
          <p className="text-xs text-error">✗ {promoError}</p>
        </div>
      )}

      {promoSuccess && (
        <div className="mb-3 p-2 bg-success/10 border border-success/30 rounded-lg">
          <p className="text-xs text-success">✓ {promoSuccess}</p>
        </div>
      )}

      {promoCodes.length > 0 && (
        <div className="space-y-2">
          {promoCodes.map((code) => (
            <div
              key={code}
              className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300"
            >
              <span className="font-mono text-xs font-medium text-primary">{code}</span>
              <button
                type="button"
                onClick={() => onRemovePromoCode(code)}
                className="text-error hover:opacity-80 text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-base-content/60 mt-2">
        If your organisation is partnered with us, please contact us for vouchers before
        payment.
      </p>
    </div>
  );
}
