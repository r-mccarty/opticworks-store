import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Seeds US region data for the OpticWorks storefront.
 *
 * Creates:
 * - US region with USD currency
 * - US stock location
 * - US shipping options (Standard + Express)
 * - Links Stripe payment provider to US region
 *
 * Run with: pnpm exec medusa exec src/scripts/seed-us-region.ts
 */
export default async function seedUSRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);

  // Check if US region already exists
  const existingRegions = await regionModuleService.listRegions({
    name: "United States",
  });

  if (existingRegions.length > 0) {
    logger.info("US region already exists, skipping creation.");
    logger.info(`Existing US region ID: ${existingRegions[0].id}`);
    return;
  }

  logger.info("Creating US region...");

  // Get default sales channel
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    throw new Error("Default Sales Channel not found. Run main seed first.");
  }

  // Create US region with USD currency
  // Note: Using "pp_stripe_stripe" as the Stripe payment provider ID (Medusa v2 format)
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_stripe_stripe"],
        },
      ],
    },
  });

  const usRegion = regionResult[0];
  logger.info(`Created US region: ${usRegion.id}`);

  // Create tax region for US
  logger.info("Creating US tax region...");
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "us",
        provider_id: "tp_stripe-tax",
      },
    ],
  });
  logger.info("US tax region created.");

  // Create US stock location
  logger.info("Creating US stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "US Warehouse",
          address: {
            city: "Los Angeles",
            country_code: "US",
            address_1: "123 Commerce St",
            province: "CA",
            postal_code: "90001",
          },
        },
      ],
    },
  });
  const usStockLocation = stockLocationResult[0];
  logger.info(`Created US stock location: ${usStockLocation.id}`);

  // Link fulfillment providers to stock location
  // Both manual (fallback) and easypost (calculated rates)
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: usStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: usStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "fp_easypost_easypost",
    },
  });

  // Get or create shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  // Create US fulfillment set
  logger.info("Creating US fulfillment set...");
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "US Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "United States",
        geo_zones: [
          {
            country_code: "us",
            type: "country",
          },
        ],
      },
    ],
  });

  // Link fulfillment set to stock location
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: usStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Create US shipping options using EasyPost provider with calculated prices
  // These map to EasyPost carrier/service combinations
  logger.info("Creating US shipping options (EasyPost calculated)...");
  await createShippingOptionsWorkflow(container).run({
    input: [
      // USPS Ground Advantage (economical)
      {
        name: "USPS Ground Advantage",
        price_type: "calculated",
        provider_id: "fp_easypost_easypost",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      // USPS Priority Mail
      {
        name: "USPS Priority Mail",
        price_type: "calculated",
        provider_id: "fp_easypost_easypost",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      // FedEx Ground
      {
        name: "FedEx Ground",
        price_type: "calculated",
        provider_id: "fp_easypost_easypost",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      // FedEx 2Day
      {
        name: "FedEx 2Day",
        price_type: "calculated",
        provider_id: "fp_easypost_easypost",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      // FedEx Express (overnight)
      {
        name: "FedEx Standard Overnight",
        price_type: "calculated",
        provider_id: "fp_easypost_easypost",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("US shipping options created (EasyPost calculated prices).");

  // Link US stock location to default sales channel
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: usStockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Linked US stock location to default sales channel.");

  // Add inventory levels for US stock location
  logger.info("Adding inventory levels for US stock location...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // Check existing inventory levels
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: {
      location_id: usStockLocation.id,
    },
  });

  const existingItemIds = new Set(existingLevels.map((l: { inventory_item_id: string }) => l.inventory_item_id));

  const newInventoryLevels = inventoryItems
    .filter((item: { id: string }) => !existingItemIds.has(item.id))
    .map((item: { id: string }) => ({
      location_id: usStockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: item.id,
    }));

  if (newInventoryLevels.length > 0) {
    const { createInventoryLevelsWorkflow } = await import("@medusajs/medusa/core-flows");
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: newInventoryLevels,
      },
    });
    logger.info(`Created ${newInventoryLevels.length} inventory levels for US warehouse.`);
  } else {
    logger.info("All inventory levels already exist for US warehouse.");
  }

  logger.info("=== US Region Setup Complete ===");
  logger.info(`Region ID: ${usRegion.id}`);
  logger.info(`Stock Location ID: ${usStockLocation.id}`);
  logger.info("Payment Provider: Stripe (pp_stripe_stripe)");
  logger.info("Fulfillment Provider: EasyPost (fp_easypost_easypost)");
  logger.info("Shipping Options: USPS Ground, USPS Priority, FedEx Ground, FedEx 2Day, FedEx Overnight (calculated prices)");
}
