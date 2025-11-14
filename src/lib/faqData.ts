export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'installation' | 'products' | 'shipping' | 'warranty' | 'legal' | 'general'
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

  // Shipping FAQs
  {
    id: "shipping-time",
    question: "How long does shipping take?",
    answer:
      "Sensors leave the lab within 1–2 business days. Standard shipping is 3–5 business days within the US, expedited arrives in 1–2 days, and we provide a tracking link as soon as the label prints.",
    category: "shipping",
    tags: ["shipping", "delivery", "tracking", "expedited"]
  },
  {
    id: "shipping-global",
    question: "Do you ship internationally?",
    answer:
      "Yes. We currently fulfill to Canada, the EU, Australia, and Singapore. Customs fees or VAT are collected by the carrier. If your region isn’t listed at checkout, reach out and we’ll coordinate a manual shipment.",
    category: "shipping",
    tags: ["international", "customs", "VAT", "regions"]
  },

  // Warranty FAQs
  {
    id: "warranty-coverage",
    question: "What does the warranty cover?",
    answer:
      "Hardware is covered for two years against sensor failure, power issues, enclosure damage, or firmware defects. Our Oops Protection program lets you request a discounted replacement if you damage the unit during install.",
    category: "warranty",
    tags: ["warranty", "coverage", "hardware", "oops protection"]
  },
  {
    id: "warranty-process",
    question: "How do I start a warranty claim?",
    answer:
      "Submit the warranty form with your order number, calibration logs if available, and photos of the install. We respond within 24 hours with troubleshooting steps or a replacement authorization.",
    category: "warranty",
    tags: ["claim", "process", "photos", "response time"]
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
  {
    id: "legal-clinics",
    question: "Is it approved for clinics or HIPAA-sensitive environments?",
    answer:
      "Yes. The system has no cameras or microphones, stores no PII, and can run entirely offline. Sleep clinics typically pair it with their own encrypted data pipelines, which we fully support.",
    category: "legal",
    tags: ["hipaa", "clinics", "compliance", "privacy"]
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
    question: "How can I get real-time help?",
    answer:
      "Use the contact form, Discord link in your order email, or schedule a call with our integrations team. During business hours we typically respond in under two hours.",
    category: "general",
    tags: ["support", "contact", "discord", "response time"]
  }
]
