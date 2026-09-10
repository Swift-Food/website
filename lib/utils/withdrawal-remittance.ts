/**
 * The remittance advice (the statement PDF) that goes with a withdrawal.
 *
 * The withdrawal history a restaurant sees is two things merged: our own
 * withdrawal records, and payouts Stripe made on the account's own schedule
 * that no withdrawal explains. Only the first kind has a row in our database,
 * so only the first kind can be asked for a statement — an automatic payout's
 * `id` is a Stripe payout id, and `GET /withdrawals/:id/remittance` would not
 * find it.
 *
 * The backend also refuses a withdrawal that never reached Stripe (rejected,
 * or still failing), so the link is offered only once a payout reference
 * exists.
 */

export interface RemittanceWithdrawal {
  id: string;
  /** Set once Stripe has actually paid out. */
  stripePayoutId?: string | null;
  /** True for a Stripe payout we did not create — no record of our own. */
  isAutomatic?: boolean;
}

export const hasRemittance = (withdrawal: RemittanceWithdrawal): boolean =>
  !withdrawal.isAutomatic && !!withdrawal.stripePayoutId;

/** Matches the reference printed on the PDF (WithdrawalRemittancePdfService). */
export const remittanceReference = (withdrawalId: string): string =>
  `WD-${withdrawalId.slice(0, 8).toUpperCase()}`;

export const remittanceFilename = (withdrawalId: string): string =>
  `withdrawal-statement-${remittanceReference(withdrawalId)}.pdf`;
