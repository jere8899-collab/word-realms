/* =====================================================================
 * PAYMENT HOOK — STUB ONLY. NO REAL PAYMENTS HAPPEN IN THIS FILE.
 * ---------------------------------------------------------------------
 * To go live with Stripe later:
 *   1. Create a small backend endpoint, e.g. POST /api/checkout
 *      that creates a Stripe Checkout Session for `item.id` and returns {url}.
 *   2. Set PaymentHook.enabled = true and implement purchase() below to
 *      redirect to that url (window.location = url).
 *   3. On your success page / Stripe webhook, grant the item
 *      (call window.WR.grantItem(itemId) after verifying the payment server-side).
 * Never trust the client to grant paid items in production.
 * ===================================================================== */
window.PaymentHook = {
  provider: "stripe",
  enabled: false,        // flip to true once a real backend exists
  demoMode: true,        // lets testers unlock premium items locally, clearly labelled "no charge"
  async purchase(item) {
    if (!this.enabled) {
      console.info("[PaymentHook] stub purchase requested for", item.id, item.cash);
      return { status: this.demoMode ? "demo" : "unavailable" };
    }
    // TODO(stripe): const r = await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id})});
    // TODO(stripe): const {url} = await r.json(); window.location = url;
    return { status: "redirecting" };
  }
};
