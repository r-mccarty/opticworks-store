import { z } from "zod";

export interface StripeProviderOptions {
  apiKey: string;
  webhookSecret?: string;
}

export interface PaymentProviderDefinition {
  id: string;
  resolve: string;
  options: StripeProviderOptions;
}

export interface PaymentModuleOptions {
  providers: PaymentProviderDefinition[];
}

export interface PaymentModuleConfig {
  resolve: string;
  options: PaymentModuleOptions;
}

export interface RegionPaymentBinding {
  regionCode: string;
  paymentProviders: string[];
}

export interface ProjectConfig {
  databaseUrl: string;
  redisUrl?: string;
}

export interface MedusaConfig {
  projectConfig: ProjectConfig;
  modules: {
    payment: PaymentModuleConfig;
  };
  regionBindings: RegionPaymentBinding[];
}

const stripeEnvSchema = z.object({
  STRIPE_API_KEY: z.string().min(1, "STRIPE_API_KEY must be defined"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export const buildStripeProvider = (
  env: NodeJS.ProcessEnv,
): PaymentProviderDefinition => {
  const parsed = stripeEnvSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  return {
    id: "stripe",
    resolve: "@medusajs/medusa/payment-stripe",
    options: {
      apiKey: parsed.data.STRIPE_API_KEY,
      webhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
    },
  } satisfies PaymentProviderDefinition;
};

export const buildMedusaConfig = (env: NodeJS.ProcessEnv = process.env): MedusaConfig => {
  const provider = buildStripeProvider(env);

  const config: MedusaConfig = {
    projectConfig: {
      databaseUrl: env.DATABASE_URL ?? "postgres://localhost/medusa",
      redisUrl: env.REDIS_URL,
    },
    modules: {
      payment: {
        resolve: "@medusajs/medusa/payment",
        options: {
          providers: [provider],
        },
      },
    },
    regionBindings: [
      {
        regionCode: "us",
        paymentProviders: [provider.id],
      },
    ],
  };

  return config;
};

const medusaConfig = (() => {
  try {
    return buildMedusaConfig(process.env);
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return buildMedusaConfig({
        ...process.env,
        STRIPE_API_KEY: "sk_test_placeholder",
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      });
    }
    throw error instanceof Error ? error : new Error("Failed to initialize Medusa configuration");
  }
})();

export default medusaConfig;
