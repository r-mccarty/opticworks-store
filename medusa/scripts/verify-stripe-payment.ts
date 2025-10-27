import { randomUUID } from "crypto";

interface PaymentSessionData {
  stripe_session_id?: string;
  [key: string]: unknown;
}

interface PaymentSession {
  id: string;
  provider_id: string;
  data?: PaymentSessionData;
}

interface PaymentCollection {
  id: string;
  amount: number;
  currency_code: string;
  region_id: string;
  payment_sessions: PaymentSession[];
}

interface PaymentCollectionResponse {
  payment_collection: PaymentCollection;
}

interface PaymentSessionResponse {
  payment_session: PaymentSession;
}

const ensureOk = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${message}`);
  }
  return response;
};

const baseUrl = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const regionId = process.env.MEDUSA_REGION_ID ?? "reg_us";
const currencyCode = process.env.MEDUSA_CURRENCY_CODE ?? "usd";

export const createPaymentCollection = async (): Promise<PaymentCollection> => {
  const response = await ensureOk(
    await fetch(`${baseUrl}/store/payment-collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000,
        currency_code: currencyCode,
        region_id: regionId,
        metadata: {
          reference: randomUUID(),
        },
      }),
    }),
  );

  const body = (await response.json()) as PaymentCollectionResponse;
  return body.payment_collection;
};

export const createStripeSession = async (collectionId: string): Promise<PaymentSession> => {
  const response = await ensureOk(
    await fetch(`${baseUrl}/store/payment-collections/${collectionId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: "stripe" }),
    }),
  );

  const body = (await response.json()) as PaymentSessionResponse;
  return body.payment_session;
};

export const deletePaymentCollection = async (collectionId: string): Promise<void> => {
  await ensureOk(
    await fetch(`${baseUrl}/store/payment-collections/${collectionId}`, {
      method: "DELETE",
    }),
  );
};

export const run = async (): Promise<void> => {
  const collection = await createPaymentCollection();
  try {
    const session = await createStripeSession(collection.id);

    if (!session.data?.stripe_session_id) {
      throw new Error("Stripe session ID was not returned by the Medusa backend");
    }

    // eslint-disable-next-line no-console -- Operational verification output.
    console.log(
      JSON.stringify(
        {
          collectionId: collection.id,
          stripeSessionId: session.data.stripe_session_id,
        },
        null,
        2,
      ),
    );
  } finally {
    await deletePaymentCollection(collection.id);
  }
};

if (process.argv[1] && process.argv[1].endsWith("verify-stripe-payment.ts")) {
  run().catch((error) => {
    // eslint-disable-next-line no-console -- Operational script output.
    console.error(error);
    process.exitCode = 1;
  });
}
