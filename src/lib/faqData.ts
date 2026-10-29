export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'installation' | 'products' | 'warranty' | 'legal' | 'general'
  tags: string[]
}

export const faqData: FAQ[] = [
  // Installation FAQs
  {
    id: "install-difficulty",
    question: "How difficult is it to install the Bed Presence Sensor?",
    answer:
      "Installation is straightforward: mount the enclosure under the bed, plug in USB-C power, and follow the guided calibration in Home Assistant. Most customers finish the physical install in 15 minutes and baseline calibration in another 10.",
    category: "installation",
    tags: ["installation", "difficulty", "time", "calibration", "bed"]
  },
  {
    id: "install-tools",
    question: "What tools do I need for installation?",
    answer:
      "All hardware is included. You may want a tape measure for exact placement and a zip tie or adhesive pad to manage cables. Adjustable beds can use the included clip mounts to clear moving rails.",
    category: "installation",
    tags: ["tools", "mounting", "kit contents", "adjustable bed"]
  },
  {
    id: "install-pets",
    question: "Will pets or HVAC vents trigger false presence?",
    answer:
      "The sensor monitors still-energy signatures coming from the mattress zone. Pets under 25 lbs rarely trigger the 4-state engine. Ceiling fans and HVAC vents are ignored by default because the field of view is tightly focused on the bed plane.",
    category: "installation",
    tags: ["pets", "false positives", "hvac", "stillness"]
  },

  // Product FAQs
  {
    id: "product-differences",
    question: "What’s the difference between the Bed Presence Kit and the Duo Pack?",
    answer:
      "The flagship kit covers one bed zone. The Duo Pack ships with two synchronized sensors, offset mounting hardware, and a shared Home Assistant blueprint so rooms don’t cross-trigger each other.",
    category: "products",
    tags: ["products", "kits", "duo pack", "blueprint"]
  },
  {
    id: "product-integrations",
    question: "Does it work with Home Assistant and Matter?",
    answer:
      "Yes. We expose binary sensors, diagnostics, and tuning sliders via Home Assistant today. Matter support is in private preview—existing hardware will get it through an OTA update once Matter-over-Thread support ships.",
    category: "products",
    tags: ["home assistant", "matter", "integrations", "ota"]
  },
  {
    id: "product-bedtypes",
    question: "Is it compatible with adjustable bases or split king beds?",
    answer:
      "Absolutely. Use the included magnetic plates or adhesive feet to mount each sensor head to a stationary crossbar. For split kings, we recommend one sensor per mattress plus a shared automation that understands dual sleepers.",
    category: "products",
    tags: ["adjustable", "split king", "compatibility", "mounting"]
  },

  // Warranty FAQs
  {
    id: "warranty-coverage",
    question: "What does the warranty cover?",
    answer:
      "Hardware is covered for two years against sensor failure, power issues, enclosure damage, or firmware defects. Contact our support team if you need assistance with any hardware issues.",
    category: "warranty",
    tags: ["warranty", "coverage", "hardware"]
  },
  {
    id: "warranty-process",
    question: "How do I start a warranty claim?",
    answer:
      "Email support@optic.works with your order number, calibration logs if available, and photos of the install.",
    category: "warranty",
    tags: ["claim", "process", "photos", "email"]
  },

  // Legal FAQs
  {
    id: "legal-privacy",
    question: "Does the sensor send any personal data to the cloud?",
    answer:
      "No. All presence detection runs locally on the ESP32 and only publishes anonymized states (occupied, clear, confidence scores) to your local network. Cloud sync is optional and off by default.",
    category: "legal",
    tags: ["privacy", "local processing", "cloud", "data"]
  },

  // General FAQs
  {
    id: "general-return",
    question: "What if the product isn’t right for me?",
    answer:
      "You have 30 days to return the kit in original condition for a full refund. We’ll even cover return shipping if you worked with our support team to troubleshoot first.",
    category: "general",
    tags: ["returns", "refund", "policy", "support"]
  },
  {
    id: "general-support",
    question: "How can I get help?",
    answer:
      "Email support@optic.works. Our online contact form is temporarily unavailable while we rebuild the website.",
    category: "general",
    tags: ["support", "contact", "email"]
  }
]
