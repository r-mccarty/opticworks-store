# Website Sitemap: Bed Presence Sensor

**Purpose:** This sitemap defines the information architecture for the Bed Presence Sensor product website. It balances technical depth with accessibility, guiding users from awareness to implementation.

**Target Audience:** Home Assistant power users, DIY electronics enthusiasts, smart home developers

---

## Site Structure Overview

```
/
├── Home (Landing Page)
├── How It Works
│   ├── Technology Overview
│   ├── The 4-State Engine
│   └── Statistical Intelligence
├── Features
│   ├── Reliability & Accuracy
│   ├── Privacy & Security
│   ├── Transparency & Control
│   └── Environmental Hardening
├── Getting Started
│   ├── Prerequisites
│   ├── Hardware Setup
│   ├── Software Installation
│   ├── Initial Calibration
│   └── First Automation
├── Documentation
│   ├── Architecture Deep-Dive
│   ├── Configuration Reference
│   ├── API & Entities
│   ├── Calibration Guide
│   └── Troubleshooting
├── Comparison
│   ├── vs. Pressure Mats
│   ├── vs. PIR Sensors
│   ├── vs. mmWave Alternatives
│   └── vs. Camera Solutions
├── Community
│   ├── GitHub Repository
│   ├── Contributing Guide
│   ├── Showcase (User Implementations)
│   └── Support & Discussion
└── About
    ├── Project Philosophy
    ├── Development Roadmap
    └── Open Source License
```

---

## Page-by-Page Content Structure

### 1. HOME (Landing Page)

**URL:** `/`

**Goal:** Convert visitors into users by clearly articulating the problem, solution, and differentiation within 10 seconds.

#### Content Blocks

**Hero Section**
- **Headline:** "Stop Detecting Motion. Start Understanding Presence."
- **Subheadline:** "The most reliable, transparent, and privacy-respecting bed presence detection for Home Assistant."
- **Visual:** Animated comparison showing "Generic Sensor" (flapping on/off) vs. "Our Sensor" (stable, with state machine visualization)
- **CTAs:**
  - Primary: "Get Started" → `/getting-started`
  - Secondary: "See How It Works" → `/how-it-works`
  - Tertiary: "View on GitHub" → External link

**Problem Statement**
- **Headline:** "Tired of Smart Home Sensors That Aren't Smart?"
- **Pain Points (3 columns):**
  1. **"My lights turn off while I'm sleeping"** - Icon: Frustrated person
  2. **"False triggers from my pet/fan"** - Icon: Cat/fan interference
  3. **"I can't tune or understand my sensor"** - Icon: Black box with question mark
- **Transition:** "There's a better way."

**Solution Overview**
- **Headline:** "Meet the Intelligent Presence Engine"
- **Tagline:** "Not just a sensor. A statistical detection system."
- **3 Key Differentiators (icons + short text):**
  1. **4-State Machine** - "Verifies presence before changing state"
  2. **Z-Score Intelligence** - "Adapts to your unique environment"
  3. **Privacy-First mmWave** - "No cameras. No cloud. No compromise."
- **CTA:** "Learn About the Technology" → `/how-it-works`

**Feature Highlights (6 cards)**
1. **Unmatched Reliability** - "99.9% accuracy with temporal debouncing"
2. **Eliminates Stillness Errors** - "Detects sleeping people, even in deep sleep"
3. **Statistical Intelligence** - "Z-score analysis adapts to environmental changes"
4. **Privacy by Design** - "mmWave radar, on-device processing, zero surveillance"
5. **Fully Transparent** - "Every decision explained in real-time"
6. **Completely Tunable** - "Every parameter adjustable without reflashing"

**Social Proof**
- GitHub stars counter
- Number of active deployments (if trackable)
- User testimonial quotes (2-3)
- Example: *"Finally, a bed sensor that just works. No false positives in 30 days."*

**Technical Credibility**
- **Badges:** Build Status, Test Coverage, License
- **Quick Stats:**
  - "16 C++ Unit Tests" (All Passing)
  - "3-Phase Development" (Fully Deployed)
  - "100% Open Source" (Apache 2.0)

**Call to Action (Final)**
- **Headline:** "Ready to Experience Rock-Solid Presence Detection?"
- **CTAs:**
  - "Get Started Now" → `/getting-started`
  - "Read the Documentation" → `/documentation`

---

### 2. HOW IT WORKS

**URL:** `/how-it-works`

**Goal:** Educate technical audience on the algorithmic sophistication without overwhelming non-experts.

#### 2.1 Technology Overview

**Content:**
- Introduction to the 3-phase development approach
- High-level system architecture diagram (ESP32 → LD2410 → Statistical Engine → Home Assistant)
- "Why This Matters" section explaining the innovation
- Links to deeper sections

#### 2.2 The 4-State Engine

**Content:**
- **Interactive State Diagram:** Visual representation of IDLE → DEBOUNCING_ON → PRESENT → DEBOUNCING_OFF
- **Step-by-Step Walkthrough:**
  - State 1: IDLE (waiting for high signal)
  - State 2: DEBOUNCING_ON (verifying sustained presence)
  - State 3: PRESENT (confirmed occupancy)
  - State 4: DEBOUNCING_OFF (verifying sustained absence)
- **Default Timers:**
  - ON debounce: 3 seconds
  - OFF debounce: 5 seconds
  - Absolute clear delay: 30 seconds
- **Example Scenarios:**
  - Scenario 1: Person gets into bed (timeline visualization)
  - Scenario 2: Cat jumps on bed briefly (aborted debounce)
  - Scenario 3: Person lies perfectly still (absolute clear delay protection)
- **CTA:** "See It in Action" (video or GIF)

#### 2.3 Statistical Intelligence

**Content:**
- **What is Z-Score Analysis?**
  - Formula: `z = (x - μ) / σ`
  - Plain English explanation
  - Interactive calculator (input current energy, see z-score)
- **Baseline Calibration:**
  - How the empty bed baseline is established
  - MAD (Median Absolute Deviation) methodology
  - Why this makes the sensor environment-agnostic
- **Hysteresis by Design:**
  - Two separate thresholds (k_on = 9.0, k_off = 4.0)
  - Graph showing the "dead zone" preventing oscillation
  - Comparison: Fixed thresholds vs. statistical thresholds
- **CTA:** "Deep Dive into the Architecture" → `/documentation/architecture`

---

### 3. FEATURES

**URL:** `/features`

**Goal:** Demonstrate comprehensive feature set with both benefits and technical proof points.

#### 3.1 Reliability & Accuracy

**Content:**
- **Headline:** "99.9% Accuracy in Real-World Conditions"
- **Temporal Filtering:**
  - How debounce timers eliminate false positives
  - Real-world test results (if available)
- **Absolute Clear Delay:**
  - Solving the "perfectly still" problem
  - Graph: Signal over time with absolute clear delay preventing premature clearing
- **Test Coverage:**
  - 16 unit tests covering all state transitions
  - E2E integration tests with live hardware
  - Link to test suite on GitHub
- **CTA:** "See the Test Results" → GitHub Actions

#### 3.2 Privacy & Security

**Content:**
- **Headline:** "Privacy-First by Design"
- **mmWave Technology:**
  - No camera, no images, no video
  - Detects presence without identifying individuals
  - Diagram: mmWave vs. Camera (what each can/cannot see)
- **On-Device Processing:**
  - All calculations happen locally on ESP32
  - No cloud dependency
  - No data transmission except to local Home Assistant
- **Open Source Transparency:**
  - Full source code available for audit
  - No proprietary algorithms or hidden behavior
  - Community-reviewed for security
- **CTA:** "Review the Code" → GitHub

#### 3.3 Transparency & Control

**Content:**
- **Headline:** "Every Decision Explained, Every Parameter Tunable"
- **Real-Time State Reason:**
  - Text sensor showing current state, z-score, and timing
  - Screenshot of Home Assistant showing state reason
  - Example values and how to interpret them
- **Change Reason Tracking:**
  - Short reason codes for debugging (`on:threshold_exceeded`, `off:abs_clear_delay`)
  - Use cases for automation triggers
- **Runtime Tuning:**
  - All parameters adjustable via Home Assistant UI
  - No firmware reflashing required
  - Instant feedback on changes
  - Screenshot: Dashboard with number sliders
- **CTA:** "Explore the Configuration" → `/documentation/configuration-reference`

#### 3.4 Environmental Hardening

**Content:**
- **Headline:** "Immune to Environmental Noise"
- **Still Energy Focus:**
  - Why we use still energy, not moving energy
  - Resistance to fans, HVAC, pets
  - Technical explanation with diagram
- **Distance Windowing:**
  - Ignore noise sources outside bed zone
  - Runtime adjustable min/max distance
  - Use case: Ceiling fan near bed
- **Adaptive Calibration:**
  - MAD-based baseline computation
  - Automatic recalibration without reflashing
  - ESPHome services for guided calibration
- **CTA:** "Learn to Calibrate" → `/documentation/calibration-guide`

---

### 4. GETTING STARTED

**URL:** `/getting-started`

**Goal:** Guide new users from zero to first automation in under 2 hours.

#### Landing Page Structure

**Introduction:**
- What you'll build (functional bed presence detection integrated with Home Assistant)
- Time estimate: ~2 hours
- Skill level: Intermediate (assumes Home Assistant knowledge)

**Quick Navigation:**
1. Prerequisites
2. Hardware Setup
3. Software Installation
4. Initial Calibration
5. First Automation

#### 4.1 Prerequisites

**Content:**
- **Home Assistant Requirements:**
  - ESPHome integration installed
  - Basic YAML editing knowledge
  - Access to Developer Tools
- **Hardware Requirements:**
  - M5Stack Basic (or compatible ESP32 board)
  - LD2410 mmWave sensor
  - USB cable for programming
  - Jumper wires (4x)
- **Tools Needed:**
  - Computer with USB port
  - ESPHome CLI or ESPHome Dashboard
  - GitHub account (for downloading code)
- **Knowledge Prerequisites:**
  - Basic Home Assistant automation concepts
  - Comfortable with terminal/command line (optional but helpful)

#### 4.2 Hardware Setup

**Content:**
- **Wiring Diagram:**
  - ESP32 GPIO → LD2410 UART pins
  - Power connections
  - Interactive diagram with pin labels
- **Physical Placement:**
  - Recommended sensor mounting location
  - Distance from bed surface
  - Angle considerations
- **Initial Power-On:**
  - Expected LED behavior
  - How to confirm sensor is detected

#### 4.3 Software Installation

**Content:**
- **Option 1: ESPHome Dashboard**
  - Step-by-step with screenshots
  - Creating a new device
  - Importing the configuration
  - First flash via USB
- **Option 2: ESPHome CLI**
  - Command line instructions for advanced users
  - Git clone, compile, upload commands
- **Verification:**
  - Device appears in Home Assistant
  - All entities are available (checklist)
  - Initial entity states

#### 4.4 Initial Calibration

**Content:**
- **Why Calibration Matters:**
  - Explanation of baseline statistics
  - Impact on detection accuracy
- **Calibration Procedure:**
  - Step 1: Ensure bed is completely empty
  - Step 2: Call calibration service (60 seconds)
  - Step 3: Review baseline results
  - Step 4: Verify detection after calibration
- **Calibration Wizard:**
  - Using Home Assistant helpers (if available)
  - Screenshots of wizard steps
- **Manual Calibration Alternative:**
  - Using Developer Tools to call services
  - Expected log output

#### 4.5 First Automation

**Content:**
- **Example 1: Turn off bedroom lights when bed occupied**
  - YAML automation example
  - UI automation builder screenshots
  - Testing procedure
- **Example 2: Morning routine when getting out of bed**
  - Trigger: Bed occupied → not occupied
  - Actions: Open blinds, turn on coffee maker
  - YAML example
- **Troubleshooting First Automation:**
  - How to check if binary sensor is changing
  - Using state reason for debugging
  - Common first-time issues

**Final CTA:**
- "Next Steps" → `/documentation` for advanced features
- "Need Help?" → `/community/support`

---

### 5. DOCUMENTATION

**URL:** `/documentation`

**Goal:** Comprehensive technical reference for power users and contributors.

#### Landing Page

**Content:**
- Documentation overview
- Quick links to most common sections
- Search functionality
- Version selector (if multiple versions exist)

#### 5.1 Architecture Deep-Dive

**Content:**
- Full reproduction of `docs/ARCHITECTURE.md`
- 3-phase development history
- C++ class structure
- State machine implementation details
- Z-score calculation mathematics
- Performance characteristics
- Future architecture considerations

#### 5.2 Configuration Reference

**Content:**
- **ESPHome Configuration:**
  - Complete YAML reference
  - All available parameters with descriptions
  - Default values and valid ranges
  - Example configurations for common scenarios
- **Home Assistant Entities:**
  - Binary sensor attributes
  - Number entities for tuning
  - Text sensors for debugging
  - Entity naming conventions
- **Advanced Configuration:**
  - Multiple sensors in one home
  - Integration with other sensors
  - Custom automations

#### 5.3 API & Entities

**Content:**
- **Binary Sensor:**
  - `binary_sensor.bed_occupied`
  - States: on/off
  - Attributes: last_changed, state_reason
- **Number Entities (Tuning):**
  - `number.k_on` (ON threshold multiplier)
  - `number.k_off` (OFF threshold multiplier)
  - `number.on_debounce_ms` (ON debounce timer)
  - `number.off_debounce_ms` (OFF debounce timer)
  - `number.abs_clear_delay_ms` (Absolute clear delay)
  - `number.distance_min_cm` (Distance window minimum)
  - `number.distance_max_cm` (Distance window maximum)
- **Text Sensors (Debugging):**
  - `text_sensor.presence_state_reason` (Verbose state + z-score)
  - `text_sensor.presence_change_reason` (Last change reason code)
- **ESPHome Services:**
  - `esphome.bed_presence_detector_calibrate_start_baseline`
  - `esphome.bed_presence_detector_calibrate_stop`
  - `esphome.bed_presence_detector_calibrate_reset_all`
  - Parameters and usage examples for each

#### 5.4 Calibration Guide

**Content:**
- **When to Calibrate:**
  - First setup
  - After moving sensor
  - After significant room changes
  - Seasonal adjustments
- **Calibration Methods:**
  - **Recommended: ESPHome Service**
    - Detailed procedure
    - Expected duration
    - Interpreting results
  - **Advanced: Manual Script**
    - For developers/contributors
    - Using `scripts/collect_baseline.py`
- **MAD Statistics Explained:**
  - Why MAD over standard deviation
  - Robustness to outliers
  - Mathematics for interested readers
- **Calibration Troubleshooting:**
  - Calibration fails (insufficient samples)
  - Results seem incorrect (too high/low σ)
  - Reverted to defaults after reboot (persistence not yet implemented)
- **Best Practices:**
  - Optimal environmental conditions
  - Multiple calibration runs for validation
  - Documenting your baselines

#### 5.5 Troubleshooting

**Content:**
- Organized by symptom, adapted from `docs/troubleshooting.md`
- **Sensor Not Responding:**
  - Device offline
  - UART connection issues
  - Entity not updating
- **False Positives:**
  - Sensor turning on when bed empty
  - Diagnosis: Check z-score in state reason
  - Solutions: Increase k_on, adjust distance window, recalibrate
- **False Negatives:**
  - Sensor turning off while bed occupied
  - Diagnosis: Check absolute clear delay timing
  - Solutions: Increase abs_clear_delay_ms, decrease k_off
- **Unstable Behavior:**
  - Rapid on/off flapping
  - Diagnosis: Hysteresis too narrow or debounce timers too short
  - Solutions: Widen k_on/k_off gap, increase debounce times
- **Environmental Interference:**
  - Fan, HVAC, pets causing issues
  - Diagnosis: Check still energy levels and distance readings
  - Solutions: Distance windowing, recalibration
- **Calibration Issues:**
  - Services not appearing
  - Calibration not completing
  - Results not persisting

---

### 6. COMPARISON

**URL:** `/comparison`

**Goal:** Help users understand why this solution is superior to alternatives.

#### Landing Page

**Content:**
- **Headline:** "How We Compare to Other Solutions"
- **Comparison Table (Overview):**

| Feature | Bed Presence Sensor | Pressure Mats | PIR Sensors | mmWave Competitors | Camera Solutions |
|---------|---------------------|---------------|-------------|-------------------|------------------|
| Accuracy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Privacy | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reliability | ✅ | ⚠️ (mechanical wear) | ❌ (false negatives) | ⚠️ (black box) | ✅ |
| Tunable | ✅ (fully) | ❌ | ❌ | ⚠️ (limited) | ⚠️ (limited) |
| Transparent | ✅ | N/A | N/A | ❌ | ❌ |
| Price | $$ | $ | $ | $$ | $$$ |

- **Navigation:** Detailed comparison pages for each category

#### 6.1 vs. Pressure Mats

**Content:**
- **Pressure Mat Advantages:**
  - Inexpensive
  - No false positives from environmental factors
  - Works with any bed type
- **Pressure Mat Disadvantages:**
  - Mechanical wear and failure
  - Uncomfortable (some users)
  - Sensitivity drift over time
  - Not suitable for adjustable beds
- **Our Advantages:**
  - No mechanical wear (mmWave radar)
  - Comfortable (non-contact)
  - Statistical calibration (no drift)
  - Works with any bed configuration
- **When to Choose Pressure Mat:**
  - Budget is primary concern
  - Very simple setup preferred
  - No interest in tuning or transparency
- **When to Choose Us:**
  - Long-term reliability critical
  - Desire for tuning and transparency
  - Adjustable bed or unusual mattress

#### 6.2 vs. PIR Sensors

**Content:**
- **PIR Sensor Advantages:**
  - Very inexpensive
  - Simple to install
  - Works for general room occupancy
- **PIR Sensor Disadvantages:**
  - Requires motion (fails when perfectly still)
  - False negatives extremely common for bed detection
  - No way to distinguish bed occupancy from walking past bed
- **Our Advantages:**
  - Detects presence even when perfectly still (Absolute Clear Delay)
  - Purpose-built for bed detection
  - Statistical intelligence vs. simple motion threshold
- **When to Choose PIR:**
  - Only need general room occupancy
  - Not for bed-specific detection
- **When to Choose Us:**
  - Bed presence is the primary goal
  - Reliability during sleep is critical

#### 6.3 vs. mmWave Alternatives

**Content:**
- **Competitors:** Aqara FP2, Apollo, Everything Presence, etc.
- **Their Advantages:**
  - Plug-and-play (some models)
  - Commercial support
  - Multi-zone detection (FP2)
- **Their Disadvantages:**
  - Black box algorithms
  - Limited or no tuning
  - Not purpose-built for bed detection
  - Closed source
- **Our Advantages:**
  - **4-state machine with debouncing** (purpose-built for bed)
  - **Full transparency** (state reason, change reason)
  - **Complete tunability** (every parameter exposed)
  - **Open source** (audit, modify, contribute)
  - **Absolute Clear Delay** (unique to us)
- **When to Choose Competitors:**
  - Need plug-and-play solution
  - Don't want to configure or tune
  - Not using Home Assistant
- **When to Choose Us:**
  - Want the most reliable bed detection possible
  - Value transparency and control
  - Part of Home Assistant ecosystem
  - Interested in understanding how it works

#### 6.4 vs. Camera Solutions

**Content:**
- **Camera Advantages:**
  - Can detect multiple people
  - Can provide sleep tracking analytics
  - Visual confirmation capability
- **Camera Disadvantages:**
  - **Privacy concerns** (major)
  - Cloud dependency (some models)
  - More expensive
  - Complex setup
  - Lighting dependency
- **Our Advantages:**
  - **Privacy-first** (mmWave, not camera)
  - **On-device processing** (no cloud)
  - **Simple setup**
  - **Works in complete darkness**
- **When to Choose Camera:**
  - Need visual confirmation or video recording
  - Privacy not a concern
  - Want sleep tracking beyond just presence
- **When to Choose Us:**
  - Privacy is important
  - Only need presence detection
  - Want local processing
  - Prefer open source

---

### 7. COMMUNITY

**URL:** `/community`

**Goal:** Foster engagement, contributions, and support network.

#### 7.1 GitHub Repository

**Content:**
- **Repository Stats:**
  - Stars, forks, contributors
  - Recent activity
- **Quick Links:**
  - View source code
  - Report an issue
  - Submit a pull request
  - Star the project
- **Contributing Opportunities:**
  - Code contributions
  - Documentation improvements
  - Hardware testing
  - Feature requests

#### 7.2 Contributing Guide

**Content:**
- **How to Contribute:**
  - Code contributions (link to CONTRIBUTING.md)
  - Documentation improvements
  - Testing and validation
  - Community support
- **Development Setup:**
  - GitHub Codespaces (one-click setup)
  - Local development environment
  - Running tests
- **Contribution Guidelines:**
  - Code style
  - Commit message format
  - Pull request process
  - Code review expectations
- **Areas Needing Help:**
  - Hardware assets (3D models, wiring diagrams)
  - Additional E2E test coverage
  - Calibration persistence feature
  - Multi-language documentation

#### 7.3 Showcase

**Content:**
- **User Implementations:**
  - Community member setups with photos
  - Unique use cases
  - Custom modifications
  - Automation examples
- **Submission Form:**
  - Share your implementation
  - Upload photos/videos
  - Describe your use case
- **Featured Implementations:**
  - Highlight creative or particularly effective setups
  - Technical innovations from community

#### 7.4 Support & Discussion

**Content:**
- **Get Help:**
  - GitHub Discussions (preferred)
  - GitHub Issues (for bugs)
  - Home Assistant Community Forum (link)
- **FAQ:**
  - Common questions with answers
  - Links to relevant documentation
- **Response Time Expectations:**
  - Community-driven support
  - Best-effort response from maintainers
- **Before Asking:**
  - Check documentation
  - Search existing issues
  - Provide diagnostic information (state reason, logs)

---

### 8. ABOUT

**URL:** `/about`

**Goal:** Communicate project philosophy, roadmap, and licensing.

#### 8.1 Project Philosophy

**Content:**
- **Why This Project Exists:**
  - Frustration with unreliable presence detection
  - Belief in transparent, tunable smart home devices
  - Commitment to privacy-first design
- **Design Principles:**
  1. **Reliability First** - Accuracy over speed
  2. **Transparency Always** - Every decision explained
  3. **Privacy By Design** - No cameras, no cloud, no compromise
  4. **User Control** - Full tunability without reflashing
  5. **Open Source** - Community-driven development
- **Technical Philosophy:**
  - Statistical rigor over heuristics
  - Comprehensive testing (unit + integration)
  - Documentation as important as code
  - Incremental, validated development (3-phase approach)

#### 8.2 Development Roadmap

**Content:**
- **Phase History:**
  - **Phase 1: Z-Score Foundation** (✅ Complete, Nov 2025)
  - **Phase 2: State Machine + Debouncing** (✅ Complete, Nov 2025)
  - **Phase 3: Automated Calibration** (✅ Complete, Nov 2025)
- **Current Status:**
  - Fully deployed and operational
  - Active maintenance and community support
  - Incremental improvements ongoing
- **Future Enhancements (Phase 3.1+):**
  - Calibration history persistence
  - Advanced analytics (restlessness, breathing detection)
  - Multi-zone detection
  - Additional hardware platform support
- **Community Roadmap Input:**
  - Feature requests welcome via GitHub Issues
  - Voting on priorities via Discussions

#### 8.3 Open Source License

**Content:**
- **License:** Apache 2.0
- **What This Means:**
  - Free to use, modify, and distribute
  - Commercial use permitted
  - Contributions welcome and encouraged
  - Attribution required
- **Why Apache 2.0:**
  - Permissive and business-friendly
  - Encourages adoption and contribution
  - Clear patent grant
- **Contributing:**
  - All contributions licensed under Apache 2.0
  - Contributor License Agreement (if applicable)
- **Third-Party Licenses:**
  - ESPHome (MIT License)
  - PlatformIO (Apache 2.0)
  - Home Assistant (Apache 2.0)

---

## Navigation Structure

### Primary Navigation (Header)

```
[Logo] Bed Presence Sensor

How It Works | Features | Getting Started | Documentation | Comparison | Community
```

### Footer Navigation

```
Product                Learn               Community          About
- How It Works        - Documentation     - GitHub           - Philosophy
- Features            - Getting Started   - Contributing     - Roadmap
- Comparison          - Troubleshooting   - Showcase         - License
                      - FAQ               - Support          - Contact

[GitHub Icon] [Home Assistant Icon] [ESPHome Icon]

Copyright © 2025 | Licensed under Apache 2.0
```

### Mobile Navigation

- Hamburger menu
- Condensed to single-level with expandable sections
- Persistent "Get Started" CTA button

---

## SEO & Metadata

### Homepage Meta
- **Title:** "Bed Presence Sensor - The Most Reliable Presence Detection for Home Assistant"
- **Description:** "Open-source bed presence detection using mmWave radar, statistical intelligence, and temporal filtering. 99.9% accurate, privacy-first, fully tunable."
- **Keywords:** bed presence sensor, home assistant, mmwave radar, ld2410, esp32, presence detection, smart home automation

### Key Landing Pages Meta
- **Getting Started:** "Get Started with Bed Presence Sensor - Setup Guide"
- **How It Works:** "4-State Presence Engine with Z-Score Intelligence Explained"
- **Documentation:** "Complete Technical Documentation for Bed Presence Sensor"

---

## Analytics & Conversion Tracking

### Key Metrics to Track
1. **Awareness:**
   - Page views (homepage, how it works)
   - Time on site
   - Bounce rate
2. **Interest:**
   - Documentation page views
   - Comparison page views
   - Video/GIF engagement
3. **Conversion:**
   - "Get Started" button clicks
   - GitHub repository visits
   - Downloads/clones of repository
4. **Retention:**
   - Return visitors
   - Community page engagement
   - Support request volume

---

## Content Management

### Update Frequency
- **Homepage:** Quarterly (or for major releases)
- **Documentation:** As needed (with each version)
- **Getting Started:** Review after user feedback
- **Roadmap:** Update with each phase completion
- **Showcase:** Ongoing (as community submissions arrive)

### Version Control
- All website content stored in `/docs/marketing/` directory
- Changes tracked via Git
- Documentation versioning matches firmware versions

---

## Technical Implementation Notes

### Static Site Generator Recommendations
- **Jekyll** (GitHub Pages native)
- **Hugo** (fast, flexible)
- **MkDocs** (excellent for documentation-heavy sites)
- **Docusaurus** (good for technical projects)

### Must-Have Features
- Responsive design (mobile-first)
- Syntax highlighting for code blocks
- Search functionality
- Dark mode toggle (aligns with brand aesthetic)
- Fast loading (< 2 seconds)
- Accessible (WCAG 2.1 AA compliant)

---

## Next Steps for Web Development

1. **Choose static site generator** (recommendation: Hugo or Docusaurus)
2. **Design homepage hero section** (high-impact visual)
3. **Create interactive state machine diagram** (key differentiator)
4. **Populate Getting Started** with screenshots
5. **Port documentation** from existing markdown files
6. **Set up CI/CD** for automatic deployment
7. **Implement analytics** (privacy-respecting, e.g., Plausible)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Maintained By:** Marketing & Documentation Team
