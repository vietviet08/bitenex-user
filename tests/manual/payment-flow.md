# VNPAY Checkout Manual Scenarios

## Scenario 1: Checkout starts online payment
1. Add items to cart in `bitenex-user`.
2. Open checkout and tap `Place Order`.
3. Verify app calls backend `/orders` then `/payments` with `Idempotency-Key`.
4. Verify app navigates to `order/payment-processing`.
5. Verify external VNPAY URL opens.

Expected:
- Order created once.
- Payment record created in `PROCESSING`.
- Pending payment context persisted in local store.

## Scenario 2: Deep link return reconciliation
1. Complete payment in VNPAY sandbox.
2. Return to app via deep link `bitenexuser://payment/result`.
3. Verify app opens `payment/result`.
4. Verify app polls backend payment + order state.
5. Verify terminal state:
   - `COMPLETED` + order `CONFIRMED` => show success CTA.

Expected:
- Return URL is informational only.
- Final UI state follows backend webhook-authoritative state.

## Scenario 3: Retry without duplicate orders
1. Trigger failed/cancelled payment (sandbox case).
2. In `payment/result`, tap `Retry Payment`.
3. Verify app calls `/payments` again for same `order_id` with new idempotency key.
4. Verify app does not call `/orders` again.

Expected:
- No duplicate orders created.
- New payment transaction is generated for retry.
- User can continue flow until success/failure terminal state.
