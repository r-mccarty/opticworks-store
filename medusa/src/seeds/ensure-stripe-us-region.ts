import { buildMedusaConfig } from "../../medusa-config";

export interface AdminRegion {
  id: string;
  name: string;
  currency_code: string;
  payment_providers: string[];
  countries: { iso_2: string }[];
}

export interface MedusaAdminClient {
  listRegions: () => Promise<AdminRegion[]>;
  updateRegion: (id: string, payload: { payment_providers: string[] }) => Promise<void>;
}

export interface RegionUpdateResult {
  updated: string[];
  alreadyConfigured: string[];
}

const US_COUNTRY_CODE = "us";
const US_CURRENCY_CODE = "usd";

export const createAdminClient = (baseUrl: string, apiToken: string): MedusaAdminClient => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  };

  return {
    async listRegions() {
      const response = await fetch(`${baseUrl}/admin/regions`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list regions: ${response.status} ${response.statusText}`);
      }

      const body = (await response.json()) as { regions?: AdminRegion[] };
      return body.regions ?? [];
    },
    async updateRegion(id, payload) {
      const response = await fetch(`${baseUrl}/admin/regions/${id}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update region ${id}: ${response.status} ${response.statusText}`);
      }
    },
  };
};

export const filterUSRegions = (regions: AdminRegion[]): AdminRegion[] =>
  regions.filter((region) => {
    const matchesCountry = region.countries.some((country) => country.iso_2.toLowerCase() === US_COUNTRY_CODE);
    const matchesCurrency = region.currency_code.toLowerCase() === US_CURRENCY_CODE;
    return matchesCountry || matchesCurrency;
  });

export const ensureStripeProviderForUSRegion = async (
  client: MedusaAdminClient,
  providerId = "stripe",
): Promise<RegionUpdateResult> => {
  const regions = filterUSRegions(await client.listRegions());
  const updated: string[] = [];
  const alreadyConfigured: string[] = [];

  await Promise.all(
    regions.map(async (region) => {
      if (region.payment_providers.includes(providerId)) {
        alreadyConfigured.push(region.id);
        return;
      }

      const paymentProviders = [...region.payment_providers, providerId];
      await client.updateRegion(region.id, { payment_providers: paymentProviders });
      updated.push(region.id);
    }),
  );

  return { updated, alreadyConfigured };
};

export const run = async (): Promise<void> => {
  const baseUrl = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";
  const apiToken = process.env.MEDUSA_ADMIN_API_TOKEN;

  if (!apiToken) {
    throw new Error("MEDUSA_ADMIN_API_TOKEN must be set to enable Stripe for US regions");
  }

  const client = createAdminClient(baseUrl, apiToken);
  const result = await ensureStripeProviderForUSRegion(client);
  const config = buildMedusaConfig(process.env);

  // eslint-disable-next-line no-console -- Operational script output.
  console.log(
    JSON.stringify(
      {
        result,
        expectedProviders: config.regionBindings,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && process.argv[1].endsWith("ensure-stripe-us-region.ts")) {
  run().catch((error) => {
    // eslint-disable-next-line no-console -- Operational script output.
    console.error(error);
    process.exitCode = 1;
  });
}
