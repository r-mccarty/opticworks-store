import { buildMedusaConfig, buildStripeProvider } from "../medusa-config";

const baseEnv = {
  STRIPE_API_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
};

describe("medusa-config", () => {
  it("registers the Stripe payment provider with environment credentials", () => {
    const provider = buildStripeProvider(baseEnv);

    expect(provider).toEqual(
      expect.objectContaining({
        id: "stripe",
        resolve: "@medusajs/medusa/payment-stripe",
        options: expect.objectContaining({
          apiKey: baseEnv.STRIPE_API_KEY,
          webhookSecret: baseEnv.STRIPE_WEBHOOK_SECRET,
        }),
      }),
    );
  });

  it("binds Stripe to the US region", () => {
    const config = buildMedusaConfig({
      ...process.env,
      ...baseEnv,
    });

    expect(config.modules.payment.options.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "stripe" }),
      ]),
    );

    expect(config.regionBindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          regionCode: "us",
          paymentProviders: expect.arrayContaining(["stripe"]),
        }),
      ]),
    );
  });
});
