import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Seeds EasyPost shipping options for calculated real-time rates.
 *
 * This script adds EasyPost shipping options to an existing US service zone.
 * It does NOT delete existing options - run cleanup first if needed.
 *
 * Run with: pnpm exec medusa exec src/scripts/seed-easypost-shipping.ts
 */
export default async function seedEasyPostShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("=== Seeding EasyPost Shipping Options ===");

  // Find the US service zone by listing all fulfillment sets
  const serviceSets = await fulfillmentModuleService.listFulfillmentSets({
    type: "shipping",
  }, {
    relations: ["service_zones"],
  });

  let usServiceZoneId: string | null = null;
  for (const set of serviceSets) {
    const usZone = set.service_zones?.find(
      (z: { name: string }) => z.name === "United States" || z.name.includes("US")
    );
    if (usZone) {
      usServiceZoneId = usZone.id;
      break;
    }
  }

  if (!usServiceZoneId) {
    throw new Error("US service zone not found. Run seed-us-region.ts first.");
  }
  logger.info(`Found US service zone: ${usServiceZoneId}`);

  // Find default shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    throw new Error("Default shipping profile not found.");
  }
  const shippingProfile = shippingProfiles[0];
  logger.info(`Found shipping profile: ${shippingProfile.id}`);

  // Check for existing EasyPost options by querying the database directly
  // The Medusa type doesn't expose provider_id filter, so we check after fetching
  const allOptions = await fulfillmentModuleService.listShippingOptions({});
  const existingEasyPostOptions = allOptions.filter(
    (opt: { provider_id?: string }) => opt.provider_id === "easypost_easypost"
  );

  if (existingEasyPostOptions.length > 0) {
    logger.info(`Found ${existingEasyPostOptions.length} existing EasyPost shipping options.`);
    logger.info("Delete them first if you want to recreate.");
    return;
  }

  // Create EasyPost shipping options with calculated prices
  logger.info("Creating EasyPost shipping options...");

  const shippingOptions = [
    // USPS Ground Advantage (economical)
    {
      name: "USPS Ground Advantage",
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: usServiceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "USPS Ground",
        description: "5-7 business days via USPS",
        code: "usps-ground",
      },
      data: {
        id: "usps-ground",
        carrier: "USPS",
        service: "GroundAdvantage",
      },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
    // USPS Priority Mail
    {
      name: "USPS Priority Mail",
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: usServiceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "USPS Priority",
        description: "2-3 business days via USPS",
        code: "usps-priority",
      },
      data: {
        id: "usps-priority",
        carrier: "USPS",
        service: "Priority",
      },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
    // FedEx Ground
    {
      name: "FedEx Ground",
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: usServiceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "FedEx Ground",
        description: "3-5 business days via FedEx",
        code: "fedex-ground",
      },
      data: {
        id: "fedex-ground",
        carrier: "FedEx",
        service: "FEDEX_GROUND",
      },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
    // FedEx 2Day
    {
      name: "FedEx 2Day",
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: usServiceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "FedEx 2Day",
        description: "2 business days via FedEx (guaranteed)",
        code: "fedex-2day",
      },
      data: {
        id: "fedex-2day",
        carrier: "FedEx",
        service: "FEDEX_2_DAY",
      },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
    // FedEx Standard Overnight
    {
      name: "FedEx Standard Overnight",
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: usServiceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "FedEx Overnight",
        description: "Next business day via FedEx (guaranteed)",
        code: "fedex-overnight",
      },
      data: {
        id: "fedex-overnight",
        carrier: "FedEx",
        service: "FEDEX_STANDARD_OVERNIGHT",
      },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
  ];

  await createShippingOptionsWorkflow(container).run({
    input: shippingOptions,
  });

  logger.info("=== EasyPost Shipping Options Created ===");
  logger.info("Options created:");
  shippingOptions.forEach(opt => {
    logger.info(`  - ${opt.name} (${opt.data.carrier} ${opt.data.service})`);
  });
  logger.info("");
  logger.info("These options use calculated pricing - EasyPost will provide real-time rates.");
}
