# Website Content & Marketing Brief

**Objective:** To provide the front-end development and marketing teams with the core concepts, value propositions, and technical differentiators of the Bed Presence Sensor project, translated into a compelling narrative for a product landing page. This document is self-contained.

## 1. Target Audience

- **Primary:** Home Assistant power users and smart home enthusiasts who have been disappointed by the unreliability of existing presence detection solutions (like PIR sensors, bed mats, or basic mmWave sensors).
- **Secondary:** DIY electronics hobbyists looking for a sophisticated, well-documented project to integrate into their smart home.
- **Pain Points:**
    - "My lights turn off while I'm still in bed."
    - "My automations trigger falsely when my pet jumps on the bed or a fan is on."
    - "My current presence sensor is a 'black box'; I can't tune it or understand why it fails."
    - "Camera-based solutions feel like a privacy invasion."

## 2. Elevator Pitch (The "Hook")

**Tagline:** Stop Detecting Motion. Start Understanding Presence.

**Pitch:** The Bed Presence Sensor isn't just another sensor; it's an intelligent presence *engine* for your smart home. Using a statistical algorithm and temporal filtering, it offers rock-solid, reliable bed occupancy detection that virtually eliminates the false positives and negatives that plague other solutions. No more lights turning off while you're sleeping. No more false alarms from a fan. Just reliable automations, every time.

## 3. Key Selling Points & Value Propositions

These should be the headline features on the landing page.

1.  **Unmatched Reliability:** Our system uses a 4-state machine with temporal debouncing to filter out "noise." It requires a *sustained* change in presence before triggering, ending the "twitchiness" of other sensors.
2.  **Statistical Intelligence:** We don't just look for energy; we use z-score statistical analysis. The sensor learns the baseline of your empty room and only reacts to statistically significant changes. This makes it resilient to environmental variations.
3.  **Privacy by Design:** Using mmWave radar, the sensor detects presence without a camera. It knows *that* you're there, not *who* you are. All processing is done on-device with no cloud dependency.
4.  **Eliminates "Stillness" Errors:** Our innovative "Absolute Clear Delay" feature solves the age-old problem of sensors failing when a person lies perfectly still. The system remembers recent high-confidence presence and won't clear the room prematurely.
5.  **Fully Tunable & Transparent:** For the power user, every parameter—from statistical thresholds to debounce timers—is adjustable in real-time from the Home Assistant dashboard. A debug text sensor provides full transparency into the engine's state and reasoning.
6.  **Built for Real-World Conditions:** Our algorithm intentionally focuses on *still energy*, making it immune to false triggers from fans, HVAC systems, and motion outside the bed area—a key differentiator from competitors.

## 4. Feature Breakdown (The "How It Works")

This section should explain the features in user-benefit terms.

### The 4-State Presence Engine
- **What it is:** A sophisticated state machine that verifies presence before changing its state.
- **Why it matters:** It prevents your automations from firing instantly based on transient noise. The sensor verifies that presence is intentional and sustained, filtering out brief movements like walking past the bed or a pet jumping up for a moment.

### Temporal Filtering (Debounce Timers)
- **What it is:** Configurable timers that require a signal to be held for a set duration.
- **Why it matters:** This is the core of our reliability. It ensures the sensor only changes state when it's confident, eliminating the "flapping" or "twitchy" behavior seen in other sensors.
- **Default Timers:** 3 seconds to turn ON, 5 seconds to turn OFF.

### The "Absolute Clear Delay"
- **What it is:** A 30-second (default) cooldown period after the last high-confidence signal before the sensor will even *consider* marking the bed as empty.
- **Why it matters:** This is our solution for detecting a sleeping, motionless person. Even if your energy signature drops while you're perfectly still, the sensor intelligently waits before clearing, preventing your lights from turning off in the middle of the night.

### Z-Score Statistical Analysis
- **What it is:** Instead of using raw energy values, we calculate how statistically significant a reading is compared to the empty-bed baseline.
- **Why it matters:** This makes the system incredibly adaptable. It works reliably in different rooms with different hardware because it's not looking for a fixed number, but for a significant *change* from the norm.

---

## 5. Deep Dive: The 4-State Presence Engine

At the heart of our sensor's reliability is a 4-state finite state machine. Unlike simple sensors that are just ON or OFF, our engine moves through four distinct states to verify presence, eliminating false triggers.

### State Machine Diagram

```
                     z_still >= k_on
                ┌─────────────────────┐
                │                     │
                ▼                     │
    ┌───────────────────┐             │
    │       IDLE        │◄────────────┤
    │  (Binary: OFF)    │             │
    └───────────────────┘             │
                │                     │
                │ z_still >= k_on     │
                ▼                     │
    ┌───────────────────┐             │
    │  DEBOUNCING_ON    │             │
    │  (Binary: OFF)    │             │
    │  Timer running    │             │
    └───────────────────┘             │
                │                     │
     Timer >= on_debounce_ms          │
      & z_still >= k_on               │
                │                     │
                ▼                     │
    ┌───────────────────┐             │
    │     PRESENT       │             │
    │  (Binary: ON)     │             │
    │  Update high_conf │             │
    └───────────────────┘             │
                │                     │
     z_still < k_off &                │
     time since high_conf             │
       >= abs_clear_delay             │
                │                     │
                ▼                     │
    ┌───────────────────┐             │
    │  DEBOUNCING_OFF   │             │
    │  (Binary: ON)     │             │
    │  Timer running    │             │
    └───────────────────┘             │
                │                     │
     Timer >= off_debounce_ms         │
      & z_still < k_off               │
                │                     │
                └─────────────────────┘

Reset Conditions (abort debounce):
- DEBOUNCING_ON → IDLE:    if z_still < k_on (lost signal)
- DEBOUNCING_OFF → PRESENT: if z_still >= k_on (signal returned)
```

### How It Works, Step-by-Step:

1.  **IDLE:** The bed is empty. The sensor is waiting for a signal that is significantly above the empty-room baseline (`z_still >= k_on`).
    *   *Default `k_on` threshold: 9.0 (Signal must be 9 standard deviations above the baseline)*

2.  **DEBOUNCING_ON:** A high signal is detected! Instead of turning on immediately, the sensor enters a "verifying" state and starts a timer. The sensor remains OFF to the rest of your smart home.
    *   *Default `on_debounce_ms` timer: 3,000ms (3 seconds)*
    *   If the signal disappears during this time, the sensor aborts and goes back to IDLE. No false trigger!

3.  **PRESENT:** The high signal was sustained for the full 3 seconds. The sensor is now confident someone is in bed and finally switches its state to ON for Home Assistant to use. While in this state, it constantly tracks the last time a high-confidence signal was seen.

4.  **DEBOUNCING_OFF:** The person has likely left the bed, and the signal has dropped. But before turning off, two conditions must be met:
    *   The signal must be below the 'off' threshold (`z_still < k_off`).
        *   *Default `k_off` threshold: 4.0*
    *   A special "Absolute Clear Delay" timer must have passed since the last strong presence signal. This is our defense against false negatives when you're lying perfectly still.
        *   *Default `abs_clear_delay_ms`: 30,000ms (30 seconds)*
    *   Once both conditions are met, a final "off" debounce timer starts. The sensor is still ON for your smart home during this final check.
        *   *Default `off_debounce_ms`: 5,000ms (5 seconds)*

5.  **Return to IDLE:** If the low signal is sustained for the full 5-second "off" debounce, the sensor confidently reports the bed is empty and returns to the IDLE state. If presence is detected again during this countdown, it aborts and returns to PRESENT.

This entire process makes the sensor deliberate and resilient, which is why it's the most reliable solution for smart home automation.

---

## 6. Technical Differentiators (The "Secret Sauce")

- **Still Energy vs. Moving Energy:**
    - **The Problem:** Most mmWave sensors react to *any* energy, making them susceptible to fans, air currents, and pets.
    - **Our Solution:** We made a deliberate engineering decision to use **still energy** as the primary input. A sleeping human is a large, stationary object that reflects a high amount of still energy. A fan is constant motion. By focusing on the former, we gain massive immunity to environmental false positives.

- **On-Device, Cloud-Free Processing:**
    - **The Problem:** Many smart devices rely on the cloud, introducing latency and privacy concerns.
    - **Our Solution:** All calculations, from the raw sensor reading to the final binary ON/OFF state, happen locally on the ESP32. This ensures maximum speed, reliability, and privacy.

- **Hysteresis by Design:**
    - **The Problem:** Sensors can "flap" between ON and OFF when the signal is right on the threshold.
    - **Our Solution:** We use two separate thresholds: a higher one to turn ON (`k_on = 9.0`) and a lower one to turn OFF (`k_off = 4.0`). This creates a "dead zone" of stability, preventing oscillation.

## 7. Calls to Action (CTA)

- **Primary:** "Buy Now" / "Get Yours Today"
- **Secondary:** "View Documentation" / "See the Code on GitHub"
- **Tertiary:** "Read the Full Technical Architecture"

## 8. Visuals & Tone

- **Tone:** Confident, technical but accessible, and focused on reliability. We are solving a real pain point for smart home users.
- **Hero Image/Video:** A GIF or short video showing the Home Assistant dashboard. On one side, a "generic" sensor flaps on and off. On our side, the `binary_sensor.bed_occupied` remains stable, with the `text_sensor.presence_state_reason` showing the state machine working (e.g., "DEBOUNCING_ON...").
- **Diagrams:** The State Machine diagram above is highly effective at communicating the "intelligent" nature of the product.
- **Dashboard Screenshots:** Show the clean, informative Home Assistant dashboard, highlighting the real-time graphs and tunable number sliders.
