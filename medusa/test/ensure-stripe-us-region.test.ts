import { ensureStripeProviderForUSRegion, filterUSRegions } from "../src/seeds/ensure-stripe-us-region";
import type { AdminRegion, MedusaAdminClient } from "../src/seeds/ensure-stripe-us-region";

describe("ensureStripeProviderForUSRegion", () => {
  const baseRegion: AdminRegion = {
    id: "region_us",
    name: "United States",
    currency_code: "usd",
    payment_providers: [],
    countries: [{ iso_2: "us" }],
  };

  it("filters to US-aligned regions", () => {
    const regions: AdminRegion[] = [
      baseRegion,
      {
        ...baseRegion,
        id: "region_eu",
        name: "Europe",
        currency_code: "eur",
        countries: [{ iso_2: "de" }],
      },
    ];

    expect(filterUSRegions(regions)).toEqual([baseRegion]);
  });

  it("updates regions missing the Stripe provider", async () => {
    const regions: AdminRegion[] = [
      baseRegion,
      {
        ...baseRegion,
        id: "region_us_east",
        payment_providers: ["stripe"],
      },
    ];

    const listedRegions = jest.fn().mockResolvedValue(regions);
    const updateRegion = jest.fn().mockResolvedValue(undefined);

    const client: MedusaAdminClient = {
      listRegions: listedRegions,
      updateRegion,
    };

    const result = await ensureStripeProviderForUSRegion(client);

    expect(result.updated).toEqual(["region_us"]);
    expect(result.alreadyConfigured).toEqual(["region_us_east"]);
    expect(updateRegion).toHaveBeenCalledWith("region_us", { payment_providers: ["stripe"] });
  });
});
