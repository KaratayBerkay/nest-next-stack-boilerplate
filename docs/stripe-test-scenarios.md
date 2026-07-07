# Stripe Test Scenarios

## Prerequisites

- Stripe Dashboard in **test mode** (toggle top-left)
- All env vars set in `prod/backend/.env` and `prod/frontend/.env.local`
- Stripe CLI running (for local webhook forwarding):

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

- Database migration applied (has `stripeCustomerId`, `subscriptionPeriodEnd`, etc.)

---

## Test Cards

Any future expiry, any CVC, any ZIP works for all cards below.

### 1. Successful subscription upgrade

| Field | Value |
|---|---|
| Card | `4242 4242 4242 4242` |
| Expected | Setup intent succeeds → subscription created → `invoice.paid` webhook fires → user upgraded in DB → next payment date visible in UI |

**Flow:**
1. User logs in → goes to `/plans`
2. Selects Basic/Medium/Premium
3. Card form opens with Stripe PaymentElement
4. Enter `4242...`, any expiry/CVC
5. Submit → card saved as default payment method
6. Subscription created in Stripe → DB updated
7. UI shows new tier + next billing date

### 2. Generic decline

| Field | Value |
|---|---|
| Card | `4000 0000 0000 0002` |
| Expected | PaymentElement shows "card declined" error → user stays on current tier → no DB changes |

### 3. Insufficient funds

| Field | Value |
|---|---|
| Card | `4000 0000 0000 0341` |
| Expected | Similar to generic decline → error shown, no upgrade |

### 4. Lost card

| Field | Value |
|---|---|
| Card | `4000 0000 0000 9987` |
| Expected | Decline error, no upgrade |

### 5. Requires 3D Secure (SCA)

| Field | Value |
|---|---|
| Card | `4000 0025 0000 3155` |
| Expected | PaymentElement shows 3D Secure challenge → complete auth → subscription succeeds as #1 |

**Note:** This only triggers when `payment_behavior: 'default'` or when Stripe's radar rules require it.

---

## Webhook Triggers

These happen automatically in test mode when subscriptions cycle:

| Event | When it fires |
|---|---|
| `invoice.paid` | First payment + each renewal (monthly) |
| `invoice.payment_failed` | If saved card is declined on renewal |
| `customer.subscription.deleted` | Cancel from Stripe Dashboard or via API |
| `customer.subscription.updated` | Cancel at period end, plan change, etc. |

To test webhooks manually without waiting:

```bash
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
stripe trigger customer.subscription.updated
```

---

## Verifying success

### Check Stripe Dashboard

- **Customers** → find the user → should have `stripeCustomerId` set
- **Subscriptions** → should show active subscription
- **Invoices** → should show paid invoice

### Check database

Connect to the database and run:

```sql
SELECT "stripeCustomerId", "stripeSubscriptionId", "subscriptionTier",
       "subscriptionPeriodEnd", "cancelAtPeriodEnd"
FROM "User"
WHERE id = '<user-id>';
```

### Check logs

```bash
curl -s http://10.10.2.51:9200/app-logs/_search?size=10 | python3 -m json.tool
```

Filter for `stripe` or `BillingService` in the `context` field.

---

## Production switch checklist

1. Flip Stripe Dashboard to **live mode**
2. Get new `sk_live_...` / `pk_live_...` keys
3. Create a **new webhook endpoint** with same 4 events + copy `whsec_...`
4. Create **live prices** (Products → Add Product → live mode) → copy `price_live_...`
5. Update all env vars to live values
6. Deploy

Test mode data does **not** carry over to live mode.
