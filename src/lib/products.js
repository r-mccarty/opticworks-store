"use strict";
// PRODUCT IMAGES STATUS:
// - Using gradient placeholders for consistent layout testing
// - TODO: Upload real product images to R2 and replace with actual URLs
// - See R2-PRODUCT-IMAGES.md for upload guide and commands
// - R2 base URL: https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = void 0;
const gradients_1 = require("./gradients");
exports.products = [
    {
        id: "bed-presence-sensor-kit",
        name: "Bed Presence Sensor Kit",
        description: "Complete mmWave hardware + presence engine stack tuned for Home Assistant. Ships flashed, calibrated, and ready for dependable automations.",
        price: 239,
        originalPrice: 259,
        image: (0, gradients_1.getProductImage)("presence-kit"),
        category: "sensor",
        badge: "Flagship",
        heroIntro: {
            headline: "Stop detecting motion. Start understanding presence.",
            subheading: "The Bed Presence Sensor kit combines a 60GHz mmWave module, ESP32 gateway, and our 4-state statistical presence engine so lights never shut off while you’re sleeping.",
        },
        keyBenefits: [
            {
                title: "4-State Presence Engine",
                description: "Temporal filtering plus hysteresis ensures the binary sensor only toggles when presence is deliberate.",
            },
            {
                title: "Absolute Clear Delay",
                description: "Remembers the last high-confidence reading for 30 seconds so perfectly still sleepers stay counted.",
            },
            {
                title: "Privacy-First Hardware",
                description: "mmWave detects that someone is there, not who. Processing happens locally on the ESP32.",
            },
            {
                title: "Live Tuning Dashboard",
                description: "Expose every threshold, debounce, and debug string directly in Home Assistant.",
            },
        ],
        specifications: [
            { label: "Sensor Suite", value: "60GHz mmWave (still energy focus)" },
            { label: "Processor", value: "ESP32-S3 w/ Wi-Fi + BLE" },
            { label: "Detection Zone", value: "Up to 3.2m w/ focused bed cone" },
            { label: "Presence Engine", value: "4-state FSM + z-score analysis" },
            { label: "Absolute Clear Delay", value: "30s default (tunable)" },
            { label: "Power", value: "USB-C 5V (cable included)" },
            { label: "Warranty", value: "2 years hardware / Oops Protection" },
        ],
        variants: [
            {
                id: "bed-presence-sensor-kit-single",
                name: "Single Bed Kit",
                price: 239,
                description: "Everything you need for one bed zone.",
                badge: "Most popular",
            },
            {
                id: "bed-presence-sensor-kit-duo",
                name: "Dual Bed Pack",
                price: 449,
                description: "Two synchronized sensors for primary + guest rooms.",
            },
            {
                id: "bed-presence-sensor-kit-studio",
                name: "Studio + Dev Pack",
                price: 525,
                description: "Adds a breakout board, USB-UART dev cable, and beta firmware access.",
            },
        ],
        reviews: {
            rating: 4.97,
            count: 312,
        },
        installGuide: "/install-guides/bed-presence-sensor",
        inStock: true,
        featured: true,
    },
    {
        id: "presence-sensor-duo-pack",
        name: "Presence Sensor Duo Pack",
        description: "Two Bed Presence Sensors plus synchronized automations for multi-room deployments. Ships with offset mounting jig for bunk or split beds.",
        price: 449,
        originalPrice: 478,
        image: (0, gradients_1.getProductImage)("presence-duo"),
        category: "bundle",
        badge: "Bundle",
        specifications: [
            { label: "Contents", value: "2x sensors + 2x enclosures + 2x USB-C cables" },
            { label: "Sync Engine", value: "Shared HA blueprint for multi-bed logic" },
            { label: "Detection Mode", value: "Coordinated still-energy analysis" },
            { label: "Lead Time", value: "Ships in 3 business days" },
        ],
        highlights: [
            "Perfect for master + guest rooms",
            "Pre-calibrated to avoid crosstalk",
            "Includes automation blueprint",
        ],
        inStock: true,
        featured: true,
    },
    {
        id: "presence-developer-edition",
        name: "Presence Engine Developer Edition",
        description: "For tinkerers who want deeper insight. Breakout headers, serial console, and beta firmware channel for experimenting with new detection ideas.",
        price: 329,
        image: (0, gradients_1.getProductImage)("presence-dev"),
        category: "sensor",
        badge: "Developer",
        specifications: [
            { label: "Debug Outputs", value: "UART + USB-C + logic analyzer pads" },
            { label: "Firmware Access", value: "Weekly beta builds + OTA toggles" },
            { label: "Included Sensors", value: "Bed Presence Sensor + sandbox module" },
            { label: "Support", value: "Private Discord lab channel" },
        ],
        inStock: true,
    },
    {
        id: "presence-dashboard-pack",
        name: "Home Assistant Dashboard Pack",
        description: "Pre-built Lovelace dashboards, helper templates, and automations that expose state reasons, z-score charts, and tuning controls.",
        price: 59,
        image: (0, gradients_1.getProductImage)("presence-dashboard"),
        category: "software",
        specifications: [
            { label: "Format", value: "YAML + dashboard JSON" },
            { label: "Requirements", value: "Home Assistant 2024.12+" },
            { label: "Delivery", value: "Instant download" },
            { label: "License", value: "Household / lab unlimited" },
        ],
        highlights: [
            "Live chart of z_still vs thresholds",
            "Number sliders for debounce + delays",
            "Template sensors for automations",
        ],
        inStock: true,
    },
    {
        id: "presence-enclosure-pack",
        name: "Magnetic Enclosure + Mount Pack",
        description: "3D-printed magnetic enclosure with adjustable tilt bracket, bed-rail clips, and adhesive pads for stealth installs.",
        price: 79,
        image: (0, gradients_1.getProductImage)("presence-enclosure"),
        category: "accessory",
        specifications: [
            { label: "Materials", value: "Matte black PETG + TPU feet" },
            { label: "Mount Options", value: "Magnetic, clip, adhesive" },
            { label: "Cable Management", value: "Integrated USB-C path" },
            { label: "Compatibility", value: "All Bed Presence Sensor SKUs" },
        ],
        inStock: true,
    },
    {
        id: "presence-spare-sensor",
        name: "Spare mmWave Sensor Module",
        description: "Individual still-energy mmWave module for labs, redundancy, or advanced automations outside of the bedroom.",
        price: 119,
        image: (0, gradients_1.getProductImage)("presence-spare"),
        category: "sensor",
        specifications: [
            { label: "Sensor", value: "60GHz FMCW w/ still-energy focus" },
            { label: "Interface", value: "UART / I2C breakouts" },
            { label: "Firmware", value: "Ships flashed w/ presence engine" },
            { label: "Use Cases", value: "Office chairs, nurseries, occupancy cues" },
        ],
        inStock: true,
    },
    {
        id: "presence-lab-support",
        name: "Reliability Lab Subscription",
        description: "Join our Reliability Lab to get monthly firmware drops, guided tuning sessions, and early access to experimental engine features.",
        price: 19,
        image: (0, gradients_1.getProductImage)("presence-lab"),
        category: "software",
        specifications: [
            { label: "Format", value: "Monthly subscription" },
            { label: "Includes", value: "Beta firmware, office hours, Discord" },
            { label: "Cancel Anytime", value: "Self-service via portal" },
        ],
        highlights: [
            "Ask engineers about your automations",
            "Stress test new state-machine ideas",
            "Share dashboards with the community",
        ],
        inStock: true,
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQXlCO0FBQ3pCLDhEQUE4RDtBQUM5RCx3RUFBd0U7QUFDeEUsMkRBQTJEO0FBQzNELCtFQUErRTs7O0FBRS9FLDJDQUE2QztBQTZDaEMsUUFBQSxRQUFRLEdBQWM7SUFDakM7UUFDRSxFQUFFLEVBQUUseUJBQXlCO1FBQzdCLElBQUksRUFBRSx5QkFBeUI7UUFDL0IsV0FBVyxFQUNULDZJQUE2STtRQUMvSSxLQUFLLEVBQUUsR0FBRztRQUNWLGFBQWEsRUFBRSxHQUFHO1FBQ2xCLEtBQUssRUFBRSxJQUFBLDJCQUFlLEVBQUMsY0FBYyxDQUFDO1FBQ3RDLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFNBQVMsRUFBRTtZQUNULFFBQVEsRUFBRSxzREFBc0Q7WUFDaEUsVUFBVSxFQUNSLHdLQUF3SztTQUMzSztRQUNELFdBQVcsRUFBRTtZQUNYO2dCQUNFLEtBQUssRUFBRSx5QkFBeUI7Z0JBQ2hDLFdBQVcsRUFDVCx3R0FBd0c7YUFDM0c7WUFDRDtnQkFDRSxLQUFLLEVBQUUsc0JBQXNCO2dCQUM3QixXQUFXLEVBQ1QscUdBQXFHO2FBQ3hHO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLHdCQUF3QjtnQkFDL0IsV0FBVyxFQUNULHlGQUF5RjthQUM1RjtZQUNEO2dCQUNFLEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLFdBQVcsRUFDVCxnRkFBZ0Y7YUFDbkY7U0FDRjtRQUNELGNBQWMsRUFBRTtZQUNkLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsbUNBQW1DLEVBQUU7WUFDckUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSx5QkFBeUIsRUFBRTtZQUN4RCxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsZ0NBQWdDLEVBQUU7WUFDcEUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLGdDQUFnQyxFQUFFO1lBQ3JFLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRTtZQUNqRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFO1lBQ3RELEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsb0NBQW9DLEVBQUU7U0FDbkU7UUFDRCxRQUFRLEVBQUU7WUFDUjtnQkFDRSxFQUFFLEVBQUUsZ0NBQWdDO2dCQUNwQyxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixLQUFLLEVBQUUsR0FBRztnQkFDVixXQUFXLEVBQUUsdUNBQXVDO2dCQUNwRCxLQUFLLEVBQUUsY0FBYzthQUN0QjtZQUNEO2dCQUNFLEVBQUUsRUFBRSw2QkFBNkI7Z0JBQ2pDLElBQUksRUFBRSxlQUFlO2dCQUNyQixLQUFLLEVBQUUsR0FBRztnQkFDVixXQUFXLEVBQUUscURBQXFEO2FBQ25FO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLGdDQUFnQztnQkFDcEMsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsV0FBVyxFQUFFLHNFQUFzRTthQUNwRjtTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsTUFBTSxFQUFFLElBQUk7WUFDWixLQUFLLEVBQUUsR0FBRztTQUNYO1FBQ0QsWUFBWSxFQUFFLHFDQUFxQztRQUNuRCxPQUFPLEVBQUUsSUFBSTtRQUNiLFFBQVEsRUFBRSxJQUFJO0tBQ2Y7SUFDRDtRQUNFLEVBQUUsRUFBRSwwQkFBMEI7UUFDOUIsSUFBSSxFQUFFLDBCQUEwQjtRQUNoQyxXQUFXLEVBQ1QsMklBQTJJO1FBQzdJLEtBQUssRUFBRSxHQUFHO1FBQ1YsYUFBYSxFQUFFLEdBQUc7UUFDbEIsS0FBSyxFQUFFLElBQUEsMkJBQWUsRUFBQyxjQUFjLENBQUM7UUFDdEMsUUFBUSxFQUFFLFFBQVE7UUFDbEIsS0FBSyxFQUFFLFFBQVE7UUFDZixjQUFjLEVBQUU7WUFDZCxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLDhDQUE4QyxFQUFFO1lBQzVFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUseUNBQXlDLEVBQUU7WUFDMUUsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLG1DQUFtQyxFQUFFO1lBQ3ZFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUU7U0FDMUQ7UUFDRCxVQUFVLEVBQUU7WUFDVixrQ0FBa0M7WUFDbEMsbUNBQW1DO1lBQ25DLCtCQUErQjtTQUNoQztRQUNELE9BQU8sRUFBRSxJQUFJO1FBQ2IsUUFBUSxFQUFFLElBQUk7S0FDZjtJQUNEO1FBQ0UsRUFBRSxFQUFFLDRCQUE0QjtRQUNoQyxJQUFJLEVBQUUsbUNBQW1DO1FBQ3pDLFdBQVcsRUFDVCxnSkFBZ0o7UUFDbEosS0FBSyxFQUFFLEdBQUc7UUFDVixLQUFLLEVBQUUsSUFBQSwyQkFBZSxFQUFDLGNBQWMsQ0FBQztRQUN0QyxRQUFRLEVBQUUsUUFBUTtRQUNsQixLQUFLLEVBQUUsV0FBVztRQUNsQixjQUFjLEVBQUU7WUFDZCxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLG9DQUFvQyxFQUFFO1lBQ3ZFLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxrQ0FBa0MsRUFBRTtZQUN2RSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsc0NBQXNDLEVBQUU7WUFDNUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSw2QkFBNkIsRUFBRTtTQUMzRDtRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2Q7SUFDRDtRQUNFLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsSUFBSSxFQUFFLCtCQUErQjtRQUNyQyxXQUFXLEVBQ1Qsa0lBQWtJO1FBQ3BJLEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFLElBQUEsMkJBQWUsRUFBQyxvQkFBb0IsQ0FBQztRQUM1QyxRQUFRLEVBQUUsVUFBVTtRQUNwQixjQUFjLEVBQUU7WUFDZCxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFO1lBQ25ELEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUU7WUFDM0QsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRTtZQUNoRCxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFO1NBQ3pEO1FBQ0QsVUFBVSxFQUFFO1lBQ1YscUNBQXFDO1lBQ3JDLHNDQUFzQztZQUN0QyxrQ0FBa0M7U0FDbkM7UUFDRCxPQUFPLEVBQUUsSUFBSTtLQUNkO0lBQ0Q7UUFDRSxFQUFFLEVBQUUseUJBQXlCO1FBQzdCLElBQUksRUFBRSxpQ0FBaUM7UUFDdkMsV0FBVyxFQUNULHFIQUFxSDtRQUN2SCxLQUFLLEVBQUUsRUFBRTtRQUNULEtBQUssRUFBRSxJQUFBLDJCQUFlLEVBQUMsb0JBQW9CLENBQUM7UUFDNUMsUUFBUSxFQUFFLFdBQVc7UUFDckIsY0FBYyxFQUFFO1lBQ2QsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSw2QkFBNkIsRUFBRTtZQUM1RCxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLDBCQUEwQixFQUFFO1lBQzdELEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRTtZQUM3RCxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLDhCQUE4QixFQUFFO1NBQ2xFO1FBQ0QsT0FBTyxFQUFFLElBQUk7S0FDZDtJQUNEO1FBQ0UsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixJQUFJLEVBQUUsNEJBQTRCO1FBQ2xDLFdBQVcsRUFDVCw2R0FBNkc7UUFDL0csS0FBSyxFQUFFLEdBQUc7UUFDVixLQUFLLEVBQUUsSUFBQSwyQkFBZSxFQUFDLGdCQUFnQixDQUFDO1FBQ3hDLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLGNBQWMsRUFBRTtZQUNkLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsa0NBQWtDLEVBQUU7WUFDOUQsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRTtZQUNyRCxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGtDQUFrQyxFQUFFO1lBQ2hFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsMENBQTBDLEVBQUU7U0FDMUU7UUFDRCxPQUFPLEVBQUUsSUFBSTtLQUNkO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsc0JBQXNCO1FBQzFCLElBQUksRUFBRSw4QkFBOEI7UUFDcEMsV0FBVyxFQUNULG1JQUFtSTtRQUNySSxLQUFLLEVBQUUsRUFBRTtRQUNULEtBQUssRUFBRSxJQUFBLDJCQUFlLEVBQUMsY0FBYyxDQUFDO1FBQ3RDLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGNBQWMsRUFBRTtZQUNkLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUU7WUFDbEQsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxzQ0FBc0MsRUFBRTtZQUNwRSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUU7U0FDOUQ7UUFDRCxVQUFVLEVBQUU7WUFDVixzQ0FBc0M7WUFDdEMscUNBQXFDO1lBQ3JDLHFDQUFxQztTQUN0QztRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2Q7Q0FDRixDQUFBIn0=