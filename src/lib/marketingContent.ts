export interface FeatureHighlight {
  title: string
  description: string
  category: 'reliability' | 'privacy' | 'transparency' | 'integration' | 'hardware' | 'software'
  stats?: string
}

export interface TechnologyLayer {
  name: string
  summary: string
  detail: string
}

export interface WorkflowStep {
  title: string
  description: string
  duration: string
  outcome: string
}

export interface ComparisonRow {
  criterion: string
  opticWorks: string
  pressureMats: string
  pirSensors: string
  mmwaveAlternatives: string
  cameraSolutions: string
}

export interface DocumentationSection {
  title: string
  summary: string
  link: string
  audience: 'builders' | 'integrators' | 'operators'
}

export interface CommunityResource {
  title: string
  description: string
  link: string
  type: 'forum' | 'code' | 'showcase' | 'event'
}

export const heroContent = {
  headline: 'Stop guessing. Start understanding presence.',
  subheadline:
    'OpticWorks builds privacy-first sensing hardware and software that understands the rhythms of your home. Our bed presence sensor pairs mmWave intelligence with transparent software so you can automate with confidence.',
  primaryCta: {
    label: 'View the bed presence sensor kit',
    href: '/getting-started',
  },
  secondaryCta: {
    label: 'Explore the architecture',
    href: '/how-it-works',
  },
  trustedBy: ['Home Assistant power users', 'Open-source builders', 'Sleep researchers'],
}

export const featureHighlights: FeatureHighlight[] = [
  {
    title: 'Engineered for stillness',
    description:
      '4-state verification and statistical debouncing eliminate false clears when someone is reading, meditating, or in REM sleep.',
    category: 'reliability',
    stats: '99.8% detection stability over 30-day soak tests',
  },
  {
    title: 'Transparent by design',
    description:
      'Every decision is logged with raw signal, z-scores, and the state transitions that produced your automations.',
    category: 'transparency',
    stats: 'Real-time decision inspector available locally',
  },
  {
    title: 'Privacy without compromise',
    description:
      'All processing runs on-device. No cameras. No cloud round trips. Just mmWave radar and your self-hosted backend.',
    category: 'privacy',
    stats: 'Data residency guaranteed: packets never leave your network',
  },
  {
    title: 'Cloudflare Worker BFF ready',
    description:
      'Provisioned APIs expose telemetry, tuning presets, and firmware updates through Workers KV and Durable Objects.',
    category: 'integration',
    stats: 'Latency <50ms from Worker to Hetzner edge node',
  },
  {
    title: 'Hetzner-native backend',
    description:
      'Single-node backend deploys in minutes with baked-in observability, MQTT bridging, and Home Assistant webhooks.',
    category: 'hardware',
    stats: 'Provisioning script builds full stack in under 12 minutes',
  },
  {
    title: 'Tune without reflashing',
    description:
      'Adaptive presets, OTA firmware, and configuration snapshots mean you never take the sensor offline to experiment.',
    category: 'software',
    stats: 'Roll back any change instantly with versioned configs',
  },
]

export const technologyLayers: TechnologyLayer[] = [
  {
    name: 'mmWave signal ingestion',
    summary: 'High-frequency LD2410 radar stream sampled at 40Hz.',
    detail:
      'We capture raw distance, still energy, and motion energy channels, denoise them, and normalize for ambient drift before the analytic engine processes the data.',
  },
  {
    name: 'Statistical decision engine',
    summary: 'Z-score and MAD based analyzer powering the four-state machine.',
    detail:
      'Our engine builds a continuously learning baseline, applies rolling windows, and enforces debounce timers with absolute clear delays to resist false negatives.',
  },
  {
    name: 'Edge orchestration',
    summary: 'ESPHome firmware coordinates OTA updates and telemetry.',
    detail:
      'Configuration is stored locally, synced with Hetzner backend, and surfaced through the Cloudflare Worker BFF for remote observability.',
  },
  {
    name: 'Home Assistant integration',
    summary: 'Native entities, diagnostics, and blueprint automations.',
    detail:
      'We expose presence entities, sensor diagnostics, and event streams that slot directly into your Home Assistant automations and dashboards.',
  },
]

export const workflowSteps: WorkflowStep[] = [
  {
    title: 'Sense',
    description: 'mmWave radar captures micro-movements above the bed surface.',
    duration: '40Hz sampling',
    outcome: 'High-resolution raw signal stream',
  },
  {
    title: 'Normalize',
    description: 'Adaptive baseline learning absorbs climate drift and static interference.',
    duration: 'Continuous',
    outcome: 'Noise-reduced, environment-specific signal',
  },
  {
    title: 'Decide',
    description: 'Four-state engine validates presence with separate on/off debounce timers and absolute clear delays.',
    duration: 'Configurable 1-30s windows',
    outcome: 'Authoritative presence entity with state explanations',
  },
  {
    title: 'Act',
    description: 'Cloudflare Worker streams decisions to Home Assistant, MQTT, and your automation targets.',
    duration: '<50ms propagation',
    outcome: 'Automations that react instantly and responsibly',
  },
]

export const comparisonTable: ComparisonRow[] = [
  {
    criterion: 'Detects still sleepers',
    opticWorks: 'Yes — stillness floor and absolute clear delay prevent dropouts.',
    pressureMats: 'Often misses due to pressure redistribution.',
    pirSensors: 'No — PIR requires motion.',
    mmwaveAlternatives: 'Varies — few expose tuning controls.',
    cameraSolutions: 'Yes, but requires intrusive video feeds.',
  },
  {
    criterion: 'Explains decisions',
    opticWorks: 'Full telemetry with z-scores and state transitions.',
    pressureMats: 'Binary signal only.',
    pirSensors: 'Binary signal only.',
    mmwaveAlternatives: 'Limited logs, often closed firmware.',
    cameraSolutions: 'Requires AI pipelines and data retention policies.',
  },
  {
    criterion: 'Privacy posture',
    opticWorks: 'Local-only processing, no cameras, self-hosted APIs.',
    pressureMats: 'Local-only, but lacks diagnostic tooling.',
    pirSensors: 'Local-only, but low fidelity.',
    mmwaveAlternatives: 'Mixed — some rely on vendor clouds.',
    cameraSolutions: 'High risk: video storage and compliance overhead.',
  },
  {
    criterion: 'Deployment effort',
    opticWorks: 'Provision scripts deploy Worker + backend in under an hour.',
    pressureMats: 'Simple hardware install, limited integration.',
    pirSensors: 'Simple install, lacks context awareness.',
    mmwaveAlternatives: 'Firmware flashing and manual tuning required.',
    cameraSolutions: 'High — compute, storage, and privacy reviews.',
  },
  {
    criterion: 'Automation depth',
    opticWorks: 'Native Home Assistant blueprints and API-first design.',
    pressureMats: 'Binary automations only.',
    pirSensors: 'Binary automations only.',
    mmwaveAlternatives: 'Limited ecosystem integrations.',
    cameraSolutions: 'Powerful but complex to manage securely.',
  },
]

export const documentationSections: DocumentationSection[] = [
  {
    title: 'System architecture',
    summary: 'Understand the flow from mmWave sensor to Home Assistant automations and the Workers BFF.',
    link: '/docs/architecture',
    audience: 'builders',
  },
  {
    title: 'Configuration reference',
    summary: 'All firmware, debounce, and telemetry settings with recommended presets for different bed sizes.',
    link: '/docs/configuration',
    audience: 'operators',
  },
  {
    title: 'API surface',
    summary: 'Workers endpoints for telemetry, OTA updates, and configuration snapshots.',
    link: '/documentation#api',
    audience: 'integrators',
  },
  {
    title: 'Calibration guide',
    summary: 'Step-by-step instructions to tune thresholds using the real-time inspector.',
    link: '/getting-started#calibration',
    audience: 'builders',
  },
  {
    title: 'Troubleshooting playbooks',
    summary: 'Root cause detection for noise, interference, and networking issues.',
    link: '/documentation#troubleshooting',
    audience: 'operators',
  },
]

export const communityResources: CommunityResource[] = [
  {
    title: 'GitHub repository',
    description: 'Star the firmware, Worker, and frontend code. Issues and discussions welcome.',
    link: 'https://github.com/opticworks/opticworks-sensing',
    type: 'code',
  },
  {
    title: 'Home Assistant forum',
    description: 'Share automations, presets, and bed frame mounting strategies with other builders.',
    link: 'https://community.home-assistant.io/tag/opticworks',
    type: 'forum',
  },
  {
    title: 'Deployment office hours',
    description: 'Join our monthly livestream for architecture deep dives and troubleshooting labs.',
    link: 'https://www.optic.works/events/office-hours',
    type: 'event',
  },
  {
    title: 'Implementation showcase',
    description: 'Real-world deployments from apartments to research labs with reproducible dashboards.',
    link: 'https://www.optic.works/showcase',
    type: 'showcase',
  },
]
