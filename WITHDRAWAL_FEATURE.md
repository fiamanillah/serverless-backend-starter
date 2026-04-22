# Landowner Stripe Withdrawal Feature - Implementation Guide

## Overview

The Stripe withdrawal feature allows landowners to withdraw earnings from approved drone operator bookings directly to their bank accounts. When operators pay for site access, the balance is added to the landowner's dashboard, and they can withdraw funds through Stripe Connect.

---

## Database Schema Changes

### New Models Added (Prisma)

#### 1. **LandownerBalance**

Tracks the available, pending, and withdrawn balance for each landowner.

```prisma
model LandownerBalance {
  id                String    @id @default(uuid())
  landownerId       String    @unique
  availableBalance  Decimal   @db.Decimal(10, 2) @default(0)
  pendingBalance    Decimal   @db.Decimal(10, 2) @default(0)
  withdrawnBalance  Decimal   @db.Decimal(10, 2) @default(0)
  currency          String    @default("GBP")
  lastCalculatedAt  DateTime  @default(now())
  updatedAt         DateTime  @default(now()) @updatedAt

  landowner         User      @relation("LandownerBalance", fields: [landownerId], references: [id], onDelete: Cascade)
  withdrawals       WithdrawalRequest[]
}
```

#### 2. **WithdrawalRequest**

Records withdrawal requests created by landowners.

```prisma
model WithdrawalRequest {
  id                    String            @id @default(uuid())
  balanceId             String
  landownerId           String
  amount                Decimal           @db.Decimal(10, 2)
  currency              String            @default("GBP")
  status                WithdrawalStatus  @default(PENDING)
  bankAccountLastFourDigits String?
  bankAccountCountry    String?
  stripePayoutId        String?           @unique
  failureReason         String?
  requestedAt           DateTime          @default(now())
  processedAt           DateTime?
  completedAt           DateTime?

  balance               LandownerBalance  @relation(fields: [balanceId], references: [id], onDelete: Cascade)
  landowner             User              @relation("LandownerWithdrawals", fields: [landownerId], references: [id], onDelete: Cascade)
  transactions          WithdrawalTransaction[]
}
```

#### 3. **WithdrawalTransaction**

Tracks Stripe payout transactions for each withdrawal request.

```prisma
model WithdrawalTransaction {
  id                String    @id @default(uuid())
  withdrawalId      String
  landownerId       String
  amount            Decimal   @db.Decimal(10, 2)
  currency          String    @default("GBP")
  stripePayout      Json?     // Full Stripe payout object
  status            String    // pending, in_transit, paid, failed, cancelled
  failureCode       String?
  failureMessage    String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @default(now()) @updatedAt

  withdrawal        WithdrawalRequest @relation(fields: [withdrawalId], references: [id], onDelete: Cascade)
  landowner         User              @relation("LandownerTransactions", fields: [landownerId], references: [id], onDelete: Cascade)
}
```

#### 4. **WithdrawalStatus Enum**

```prisma
enum WithdrawalStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## Backend API Endpoints

### 1. **Connect Stripe Account**

```
POST /billing/v1/landowner/stripe-connect
```

Connects a landowner's bank account to Stripe for receiving payouts.

**Request Body:**

```json
{
    "bankAccountToken": "tok_...",
    "country": "GB"
}
```

**Response:**

```json
{
    "message": "Stripe Connect account prepared",
    "data": {
        "accountId": "acct_...",
        "onboardingUrl": "https://..."
    }
}
```

### 2. **Get Landowner Balance**

```
GET /billing/v1/landowner/balance
```

Retrieves the current balance for the authenticated landowner.

**Response:**

```json
{
    "message": "Balance retrieved successfully",
    "data": {
        "availableBalance": 1250.5,
        "pendingBalance": 300.0,
        "withdrawnBalance": 500.0,
        "currency": "GBP",
        "lastCalculatedAt": "2026-04-21T...",
        "totalEarned": 2050.5
    }
}
```

### 3. **Create Withdrawal Request**

```
POST /billing/v1/landowner/withdrawals
```

Creates a new withdrawal request for the landowner.

**Request Body:**

```json
{
    "amount": 1000.0,
    "bankAccountToken": "tok_..."
}
```

**Response:**

```json
{
    "message": "Withdrawal request created successfully",
    "data": {
        "id": "wd_...",
        "amount": 1000.0,
        "status": "IN_PROGRESS",
        "stripePayoutId": "po_...",
        "requestedAt": "2026-04-21T..."
    }
}
```

### 4. **List Withdrawals**

```
GET /billing/v1/landowner/withdrawals
```

Retrieves all withdrawal requests for the landowner.

**Response:**

```json
{
    "message": "Withdrawals retrieved successfully",
    "data": [
        {
            "id": "wd_...",
            "amount": 1000.0,
            "currency": "GBP",
            "status": "COMPLETED",
            "requestedAt": "2026-04-21T...",
            "completedAt": "2026-04-23T..."
        }
    ]
}
```

### 5. **Get Withdrawal Details**

```
GET /billing/v1/landowner/withdrawals/:withdrawalId
```

Retrieves detailed information about a specific withdrawal.

### 6. **Cancel Withdrawal**

```
POST /billing/v1/landowner/withdrawals/:withdrawalId/cancel
```

Cancels a pending withdrawal and restores the balance.

---

## Frontend Components

### 1. **BalanceCard** (`src/components/LandownerDashboard/BalanceCard.tsx`)

Displays the landowner's current balance with a prominent call-to-action button.

**Props:**

- `availableBalance: number` - Available balance to withdraw
- `pendingBalance: number` - Pending balance
- `totalEarned: number` - Total earnings
- `loading?: boolean` - Loading state
- `onWithdraw: () => void` - Callback when withdraw button clicked
- `stripeConnected: boolean` - Whether Stripe account is connected

**Features:**

- Real-time balance display
- Balance breakdown (earned, pending, withdrawn)
- Warning if Stripe account not connected
- Disabled state if no available balance

### 2. **WithdrawalModal** (`src/components/LandownerDashboard/WithdrawalModal.tsx`)

Multi-step modal for creating withdrawal requests.

**Props:**

- `onClose: () => void` - Close callback
- `balance: LandownerBalance` - Current balance data
- `idToken: string` - Auth token
- `stripeConnected: boolean` - Stripe connection status
- `onWithdrawalSuccess: () => void` - Success callback

**Flow:**

1. Connect Stripe Account (if not connected)
2. Enter Withdrawal Amount
3. Confirm Details
4. Success Screen

### 3. **WithdrawalHistory** (`src/components/LandownerDashboard/WithdrawalHistory.tsx`)

Displays list of past withdrawal requests with status.

**Props:**

- `idToken: string` - Auth token
- `loading?: boolean` - Loading state

**Features:**

- Status badges (Completed, In Progress, Failed, etc.)
- Timeline with dates
- Empty state message
- Auto-refresh on component mount

---

## Frontend API Client (`src/lib/withdrawals.ts`)

### Functions:

#### `getLandownerBalance(idToken: string)`

Fetches the current balance for the logged-in landowner.

#### `connectStripeAccount(idToken: string, bankAccountToken: string, country: string)`

Connects a Stripe account for the landowner.

#### `createWithdrawalRequest(idToken: string, amount: number, bankAccountToken: string)`

Creates a new withdrawal request.

#### `listWithdrawals(idToken: string)`

Retrieves all withdrawal requests.

#### `getWithdrawalDetails(idToken: string, withdrawalId: string)`

Gets details of a specific withdrawal.

#### `cancelWithdrawal(idToken: string, withdrawalId: string)`

Cancels a pending withdrawal.

---

## Integration with LandownerDashboard

The withdrawal feature is fully integrated into the LandownerDashboard:

1. **Balance Card Display** - Shows below the metric cards
2. **Withdrawal History** - Displayed alongside the balance card
3. **Withdrawal Modal** - Triggered when user clicks "Withdraw Funds"
4. **Auto-refresh** - Balance updates when withdrawal is completed

---

## How It Works: End-to-End Flow

### 1. **Payment Flow**

1. Operator books a site with the landowner's fee (`toalCost`)
2. When booking is approved and charged, the fee is added to landowner's available balance
3. LandownerBalance model is updated automatically

### 2. **Withdrawal Flow**

1. Landowner clicks "Withdraw Funds" button on dashboard
2. If Stripe not connected, they connect their bank account first
3. Landowner enters withdrawal amount (minimum £20)
4. System validates:
    - Amount > 0 and ≤ available balance
    - Stripe account is connected
5. Stripe payout is created
6. WithdrawalRequest is created with status `IN_PROGRESS`
7. Balance is updated:
    - `availableBalance` decreased
    - `pendingBalance` increased
8. When Stripe processes the payout, transaction status updates
9. Once completed, `pendingBalance` → `withdrawnBalance`

---

## Testing

### Prerequisites:

1. Database migration applied: `prisma migrate dev`
2. Backend deployed with new endpoints
3. Frontend components compiled

### Manual Testing Steps:

1. **Create a test booking**:
    - Log in as operator
    - Book a site with landowner fee
    - Complete payment

2. **Check balance**:
    - Log in as landowner
    - Navigate to dashboard
    - Verify balance card shows earned amount

3. **Create withdrawal**:
    - Click "Withdraw Funds"
    - Connect Stripe account (use test mode)
    - Enter withdrawal amount
    - Confirm and verify history updates

### Stripe Test Tokens:

```
Bank Account: tok_test
Card: tok_4242424242424242
```

---

## Error Handling

The system includes comprehensive error handling:

- **Insufficient balance**: Returns 400 with friendly message
- **Stripe connection error**: Shows clear instructions
- **Stripe payout failure**: Stores failure reason and allows retry
- **Validation errors**: Clear input validation with toast notifications

---

## Security Considerations

1. **Authentication**: All endpoints require Cognito auth token
2. **Authorization**: Landowners can only access their own balance/withdrawals
3. **PII**: Bank account details are masked in UI
4. **Stripe Account**: Connected securely via Stripe Express account
5. **Rate limiting**: Consider implementing for withdrawal requests

---

## Future Enhancements

1. **Automatic Balance Sync**: Webhook to update balance when payments are charged
2. **Multiple Currencies**: Support different currencies per landowner
3. **Tax Reporting**: Generate tax documents for withdrawals
4. **Direct Bank Validation**: Verify bank account details
5. **Withdrawal Scheduling**: Schedule automatic monthly withdrawals
6. **Fee Structure**: Support platform fees on withdrawals
7. **Bulk Withdrawals**: Batch processing for efficiency

---

## Troubleshooting

### Balance Not Updating

- Check if booking payment status is `charged`
- Verify `toalCost` is set on the booking
- Run balance calculation manually: `getLandownerBalance(idToken)`

### Stripe Account Not Connecting

- Verify Stripe API keys are correct
- Check Stripe account mode (test vs. live)
- Ensure bank token is valid for the country

### Withdrawal Stuck in Progress

- Check Stripe payout status in Stripe dashboard
- Verify bank account details are correct
- May be a legitimate delay (1-2 business days typical)

---

## Configuration

### Environment Variables Needed:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
API_BASE_URL=http://localhost:4173
```

### Database:

PostgreSQL 13+ with PostGIS extension (already configured)

---

## Support & Contact

For issues or questions:

1. Check test logs in `/var/log/billing-service`
2. Review Stripe dashboard for transaction details
3. Check database for balance records: `SELECT * FROM "LandownerBalance"`
