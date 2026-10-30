/** Local-only request identity. Invalidating a ticket never retries a paid request. */
export function createCrmAiPreviewGate() {
  let sequence = 0;
  let active: { sequence: number; context: string } | null = null;
  return {
    begin(context: string) {
      // This synchronous guard also blocks two clicks before React renders.
      if (active?.context === context) return null;
      active = { sequence: ++sequence, context };
      return active;
    },
    isCurrent(ticket: { sequence: number; context: string }, context: string) {
      return active === ticket && ticket.context === context;
    },
    finish(ticket: { sequence: number; context: string }) {
      if (active !== ticket) return false;
      active = null;
      return true;
    },
    invalidate() {
      active = null;
    },
  };
}
