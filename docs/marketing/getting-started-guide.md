# Getting Started Guide: Bed Presence Sensor

Welcome to the most reliable bed presence detection solution for Home Assistant. This guide will walk you through everything you need to know to get your sensor up and running.

**Time to Complete:** ~2 hours
**Skill Level:** Intermediate (Home Assistant experience required)

---

## What You'll Build

By the end of this guide, you'll have:

✅ A fully functional bed presence sensor integrated with Home Assistant
✅ Accurate detection that works even when you're lying perfectly still
✅ Zero false positives from fans, pets, or ambient motion
✅ A transparent system where you can see exactly why each decision is made
✅ Complete control over tuning parameters without ever reflashing firmware

---

## Table of Contents

1. [Before You Begin](#before-you-begin)
2. [What You'll Need](#what-youll-need)
3. [Hardware Assembly](#hardware-assembly)
4. [Software Setup](#software-setup)
5. [Initial Calibration](#initial-calibration)
6. [Understanding Your Sensor](#understanding-your-sensor)
7. [Creating Your First Automation](#creating-your-first-automation)
8. [Tuning for Your Environment](#tuning-for-your-environment)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Before You Begin

### Prerequisites

Before starting, make sure you have:

**Home Assistant Setup:**
- Home Assistant installed and running
- ESPHome integration installed (Settings → Devices & Services → Add Integration → ESPHome)
- Basic familiarity with Home Assistant automations
- Access to Home Assistant's Developer Tools

**Technical Knowledge:**
- Comfortable connecting wires to electronic components
- Ability to use a USB cable to flash firmware
- Basic understanding of YAML (helpful but not required)

**Time & Space:**
- 2 hours of uninterrupted time
- Clear workspace for hardware assembly
- Access to your bed for sensor placement testing

### What Makes This Different?

Unlike simple motion sensors or pressure mats, this system uses:
- **Statistical Intelligence** - Learns your bed's "empty" baseline and only reacts to significant changes
- **4-State Verification** - Requires sustained presence before triggering (no more false alarms)
- **Stillness Detection** - Detects sleeping people even in deep sleep (no more lights turning off at night)
- **Complete Transparency** - Shows you exactly why it's making each decision

---

## What You'll Need

### Required Hardware

| Component | Description | Approx. Cost |
|-----------|-------------|--------------|
| **ESP32 Board** | M5Stack Basic recommended, or any ESP32 dev board | $15-30 |
| **LD2410 mmWave Sensor** | 24GHz radar module for presence detection | $8-15 |
| **USB Cable** | For programming the ESP32 (usually included) | $3-5 |
| **Jumper Wires** | 4x female-to-female (for UART connection) | $2-5 |

**Total Hardware Cost:** ~$30-55

#### Where to Buy

- **AliExpress:** Best prices, 2-4 week shipping
- **Amazon:** Faster shipping, slightly higher cost
- **Adafruit/SparkFun:** Premium suppliers with excellent documentation

### Required Software

All software is **free and open source**:

- **ESPHome** (for compiling and flashing firmware)
- **Git** (for downloading the project code)
- **Python 3.8+** (usually pre-installed on most systems)

Don't worry if you don't have these installed yet—we'll walk you through it.

---

## Hardware Assembly

### Step 1: Understand the Components

**ESP32 (M5Stack Basic):**
- This is the "brain" that runs the detection algorithm
- Connects to your WiFi network
- Communicates with Home Assistant

**LD2410 mmWave Sensor:**
- Emits 24GHz radar waves
- Detects presence without cameras (privacy-first!)
- Provides "still energy" readings that our algorithm analyzes

### Step 2: Wiring Diagram

Connect the LD2410 sensor to your ESP32 using 4 jumper wires:

```
LD2410 Sensor          →    ESP32 (M5Stack)
─────────────────────────────────────────────
VCC (Power)            →    3.3V
GND (Ground)           →    GND
TX (Transmit)          →    GPIO 16 (RX)
RX (Receive)           →    GPIO 17 (TX)
```

**Important Notes:**
- **TX → RX and RX → TX** (the connections are crossed)
- Use **3.3V**, not 5V (the LD2410 is 3.3V only)
- Ensure connections are firm—loose wires cause intermittent issues

### Step 3: Physical Placement

**Recommended Placement:**
- **Height:** 1-3 feet above the mattress
- **Position:** Centered over the area where you sleep (head/torso area)
- **Angle:** Pointing straight down at the bed surface
- **Clear line of sight:** No obstructions between sensor and bed

**What to Avoid:**
- Placing sensor too far from bed (weak signal)
- Pointing sensor at walls or ceiling (interference)
- Near sources of vibration (fans, HVAC vents)

**Pro Tip:** Start with temporary placement (tape or clip) and optimize after initial testing.

### Step 4: First Power-On

Connect your ESP32 to your computer via USB. You should see:
- **M5Stack:** Screen lights up
- **Generic ESP32:** Power LED turns on

If nothing happens:
- Try a different USB cable (some are power-only)
- Check that your USB port works with other devices

---

## Software Setup

### Option 1: Using ESPHome Dashboard (Recommended for Beginners)

**Step 1: Access ESPHome Dashboard**
1. In Home Assistant, go to **Settings → Add-ons → ESPHome**
2. If not installed, install the ESPHome add-on first
3. Click "OPEN WEB UI"

**Step 2: Download the Project Code**
1. Open a terminal or command prompt on your computer
2. Clone the repository:
   ```bash
   git clone https://github.com/r-mccarty/bed-presence-sensor.git
   cd bed-presence-sensor
   ```

**Step 3: Create Your Secrets File**
1. In the `esphome` directory, create a file called `secrets.yaml`
2. Add your WiFi credentials:
   ```yaml
   wifi_ssid: "YourNetworkName"
   wifi_password: "YourNetworkPassword"
   ```
3. Save the file

**Step 4: Compile and Upload**
1. In ESPHome Dashboard, click **"+ NEW DEVICE"**
2. Click **"CONTINUE"**, then **"SKIP"** (we're using existing config)
3. Click the three dots on your new device → **"Install"**
4. Choose **"Plug into this computer"**
5. Select your ESP32's USB port
6. Wait for compilation and upload (~5-10 minutes first time)

**Step 5: Verify Connection**
1. Device should appear in Home Assistant: **Settings → Devices & Services → ESPHome**
2. Click on the device—you should see multiple entities

---

### Option 2: Using ESPHome CLI (Advanced Users)

**Step 1: Install ESPHome**
```bash
pip install esphome
```

**Step 2: Clone Repository**
```bash
git clone https://github.com/r-mccarty/bed-presence-sensor.git
cd bed-presence-sensor/esphome
```

**Step 3: Create Secrets File**
```bash
cat > secrets.yaml << EOF
wifi_ssid: "YourNetworkName"
wifi_password: "YourNetworkPassword"
EOF
```

**Step 4: Compile and Upload**
```bash
esphome run bed-presence-detector.yaml
```

**Step 5: Monitor Logs**
```bash
esphome logs bed-presence-detector.yaml
```

---

## Initial Calibration

Calibration is **critical** for accurate detection. The sensor needs to learn what your empty bed looks like.

### Why Calibration Matters

The sensor uses **z-score statistical analysis**, which compares current readings to a baseline. Without calibration, the sensor doesn't know what "empty" means for your specific bed, room, and sensor placement.

### Calibration Procedure

**Step 1: Prepare the Environment**
- Ensure the bed is **completely empty** (no people, pets, or objects)
- Normal room conditions (don't artificially quiet the room)
- Allow sensor to stabilize for 1-2 minutes after power-on

**Step 2: Start Calibration**

**Using Home Assistant UI:**
1. Go to **Developer Tools → Services**
2. Select service: `esphome.bed_presence_detector_calibrate_start_baseline`
3. Click **"CALL SERVICE"**
4. Wait 60 seconds—do not disturb the bed during this time

**Using Home Assistant Calibration Wizard (if available):**
1. Go to your Bed Presence Sensor dashboard
2. Click **"Start Calibration"** button
3. Follow on-screen instructions
4. Wizard will guide you through the 60-second process

**Step 3: Monitor Progress**

Watch the ESPHome logs or Home Assistant notification:
```
Calibration started - collecting samples for 60 seconds...
Collected 120 samples
Computing baseline statistics via MAD...
Baseline computed: μ=6.7%, σ=3.5%
Calibration complete!
```

**Step 4: Verify Calibration**

Check the **"Presence Change Reason"** text sensor:
- Should read: `calibration:completed`
- Indicates baseline was successfully updated

**Step 5: Test Detection**

1. Get into bed
2. Within 3-5 seconds, `binary_sensor.bed_occupied` should turn **ON**
3. Get out of bed and wait 30-40 seconds
4. Sensor should turn **OFF**

If detection isn't working:
- Ensure sensor is properly positioned
- Check wiring connections
- Review the [Troubleshooting](#troubleshooting) section
- Consider recalibrating

---

## Understanding Your Sensor

Your sensor creates several entities in Home Assistant. Here's what each one does:

### Primary Entities

#### 1. `binary_sensor.bed_occupied`
**Purpose:** The main presence sensor (ON = occupied, OFF = empty)

**Usage:**
- Use this in your automations
- ON state means someone is confidently in bed
- OFF state means bed is empty (verified for 30+ seconds)

**Example:**
```yaml
trigger:
  - platform: state
    entity_id: binary_sensor.bed_occupied
    to: "on"
```

---

#### 2. `text_sensor.presence_state_reason`
**Purpose:** Shows the current state and reasoning (for debugging)

**Example Values:**
- `IDLE (z=0.3, binary=OFF)` - Bed empty, baseline levels
- `DEBOUNCING_ON (z=10.2, 1.5s/3.0s, binary=OFF)` - High signal detected, waiting to confirm
- `PRESENT (z=9.8, binary=ON)` - Presence confirmed
- `DEBOUNCING_OFF (z=3.1, 2.0s/5.0s, last_hc=8.2s, binary=ON)` - Low signal, waiting to clear

**How to Read:**
- **z** = z-score (statistical significance)
- **Timer** = Current/Required time (e.g., 1.5s/3.0s = 1.5 seconds into 3-second timer)
- **last_hc** = Time since last high confidence reading
- **binary** = Binary sensor state (what Home Assistant sees)

---

#### 3. `text_sensor.presence_change_reason`
**Purpose:** Short reason code for last state change

**Possible Values:**
- `on:threshold_exceeded` - Z-score went above k_on threshold
- `off:debounce_elapsed` - Low signal sustained for required time
- `off:abs_clear_delay` - Absolute clear delay timer allowed debounce to start
- `calibration:completed` - Baseline was just updated
- `calibration:reset` - Parameters reset to defaults

**Use Case:** Trigger automations based on specific events
```yaml
trigger:
  - platform: state
    entity_id: text_sensor.presence_change_reason
    to: "on:threshold_exceeded"
```

---

### Tuning Controls (Number Entities)

These allow you to adjust the sensor's behavior without reflashing firmware:

#### `number.k_on` (ON Threshold Multiplier)
- **Default:** 9.0
- **Range:** 0.0 - 15.0
- **What it does:** Z-score must exceed this value to start turning ON
- **Lower = More Sensitive:** Triggers more easily (may cause false positives)
- **Higher = Less Sensitive:** Requires stronger presence (may miss subtle presence)

#### `number.k_off` (OFF Threshold Multiplier)
- **Default:** 4.0
- **Range:** 0.0 - 15.0
- **What it does:** Z-score must drop below this value to consider turning OFF
- **Creates hysteresis:** Difference between k_on and k_off prevents rapid flickering

#### `number.on_debounce_ms` (ON Debounce Time)
- **Default:** 3000 (3 seconds)
- **Range:** 0 - 60000 ms
- **What it does:** How long high signal must be sustained before turning ON
- **Lower:** Faster response, but more prone to false positives
- **Higher:** Slower response, but more reliable

#### `number.off_debounce_ms` (OFF Debounce Time)
- **Default:** 5000 (5 seconds)
- **Range:** 0 - 60000 ms
- **What it does:** How long low signal must be sustained before turning OFF
- **Lower:** Faster clearing
- **Higher:** More forgiving of brief stillness

#### `number.absolute_clear_delay_ms` (Absolute Clear Delay)
- **Default:** 30000 (30 seconds)
- **Range:** 0 - 300000 ms (5 minutes)
- **What it does:** Prevents clearing until this much time has passed since last strong presence
- **This is the "magic" that detects sleeping people:** Even if you're perfectly still, sensor won't clear for 30 seconds after your last movement

#### `number.distance_min_cm` and `number.distance_max_cm`
- **Defaults:** 0 cm (min), 600 cm (max)
- **What it does:** Ignore readings outside this distance range
- **Use case:** Filter out ceiling fans, hallway motion, etc.

---

## Creating Your First Automation

### Example 1: Turn Off Bedroom Lights When Going to Bed

```yaml
automation:
  - alias: "Bedroom Lights Off When Bed Occupied"
    trigger:
      - platform: state
        entity_id: binary_sensor.bed_occupied
        to: "on"
        for: "00:00:10"  # Wait 10 seconds to avoid false triggers during bedtime prep
    condition:
      - condition: time
        after: "21:00:00"  # Only after 9 PM
        before: "07:00:00"  # And before 7 AM
    action:
      - service: light.turn_off
        target:
          entity_id: light.bedroom
        data:
          transition: 30  # Gradual 30-second fade
      - service: notify.mobile_app
        data:
          message: "Good night! Lights fading off."
```

### Example 2: Morning Routine When Getting Out of Bed

```yaml
automation:
  - alias: "Morning Routine When Leaving Bed"
    trigger:
      - platform: state
        entity_id: binary_sensor.bed_occupied
        from: "on"
        to: "off"
    condition:
      - condition: time
        after: "06:00:00"
        before: "10:00:00"
      - condition: state
        entity_id: sun.sun
        state: "above_horizon"
    action:
      - service: cover.open_cover
        target:
          entity_id: cover.bedroom_blinds
      - service: switch.turn_on
        target:
          entity_id: switch.coffee_maker
      - service: climate.set_temperature
        target:
          entity_id: climate.bedroom
        data:
          temperature: 72
      - service: media_player.play_media
        target:
          entity_id: media_player.bedroom_speaker
        data:
          media_content_type: "playlist"
          media_content_id: "morning_news"
```

### Example 3: Prevent Lights Turning On While in Bed

```yaml
automation:
  - alias: "Disable Motion Lights When in Bed"
    mode: restart
    trigger:
      - platform: state
        entity_id: binary_sensor.bed_occupied
        to: "on"
    action:
      - service: input_boolean.turn_on
        target:
          entity_id: input_boolean.bedtime_mode
      - wait_for_trigger:
          - platform: state
            entity_id: binary_sensor.bed_occupied
            to: "off"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.bedtime_mode
```

Then, in your motion light automations, add:
```yaml
condition:
  - condition: state
    entity_id: input_boolean.bedtime_mode
    state: "off"
```

---

## Tuning for Your Environment

### Common Tuning Scenarios

#### Issue: Sensor Turning ON Too Easily (False Positives)

**Symptoms:**
- Turns on when you walk past the bed
- Triggers from pets jumping on bed
- Activates from fan or HVAC

**Solutions:**
1. **Increase k_on threshold:**
   - Try: 10.0 or 11.0 (from default 9.0)
   - Requires stronger presence to trigger

2. **Increase on_debounce_ms:**
   - Try: 5000 (5 seconds) instead of 3000
   - Requires longer sustained presence

3. **Use distance windowing:**
   - Set `distance_max_cm` to focus on bed area only
   - Example: Set to 200 cm if bed is 6 feet away

4. **Recalibrate:**
   - With all normal "noise" present (fan on, etc.)
   - Sensor will learn to ignore ambient conditions

---

#### Issue: Sensor Turning OFF While Still in Bed (False Negatives)

**Symptoms:**
- Lights turn off while you're sleeping
- Clears when you're lying very still
- Turns off during deep sleep

**Solutions:**
1. **Increase absolute_clear_delay_ms:**
   - Try: 60000 (60 seconds) or even 120000 (2 minutes)
   - Gives more time before considering bed empty

2. **Decrease k_off threshold:**
   - Try: 3.0 or 3.5 (from default 4.0)
   - Allows lower signal to maintain presence state

3. **Increase off_debounce_ms:**
   - Try: 10000 (10 seconds)
   - Requires longer confirmation before clearing

4. **Check sensor placement:**
   - May be too far or at poor angle
   - Should point at torso area for best still detection

---

#### Issue: Sensor is Slow to Respond

**Symptoms:**
- Takes 10+ seconds to turn on
- Slow to clear after leaving bed

**Solutions:**
1. **Decrease on_debounce_ms:**
   - Try: 1000 (1 second)
   - Faster triggering, but may increase false positives

2. **Decrease off_debounce_ms:**
   - Try: 2000 (2 seconds)
   - Faster clearing

3. **Check z-score in state reason sensor:**
   - If z-score is only slightly above k_on, increase sensor sensitivity or improve placement

---

#### Issue: Unstable (Rapid ON/OFF Flapping)

**Symptoms:**
- Rapidly switches between ON and OFF
- Binary sensor "flickers"

**Solutions:**
1. **Widen hysteresis gap:**
   - Increase k_on: 10.0
   - Decrease k_off: 3.0
   - Creates larger "dead zone"

2. **Increase both debounce timers:**
   - on_debounce_ms: 5000
   - off_debounce_ms: 8000

3. **Check wiring:**
   - Loose connections cause intermittent readings
   - Re-seat all jumper wires

---

### Advanced Tuning: Reading Z-Scores

The `text_sensor.presence_state_reason` shows real-time z-scores. Use this to optimize:

**Example Readings:**
- **Empty bed:** z = 0.2 to 1.5 (near baseline)
- **Occupied bed:** z = 8.0 to 15.0 (high signal)
- **Edge cases:** z = 4.0 to 6.0 (ambiguous—tune here)

**Tuning Strategy:**
1. Note z-score when bed is occupied: e.g., z = 12.0
2. Note z-score when bed is empty: e.g., z = 0.5
3. Set k_on between empty and occupied: e.g., 8.0
4. Set k_off well below k_on but above empty: e.g., 3.0
5. Test and adjust

---

## Troubleshooting

### Device Not Appearing in Home Assistant

**Possible Causes:**
1. **WiFi credentials incorrect**
   - Check `secrets.yaml` for typos
   - Ensure network name and password are correct

2. **ESP32 not on same network as Home Assistant**
   - Some routers have guest network isolation
   - Ensure ESP32 is on main network

3. **ESPHome API encryption key mismatch**
   - Re-flash firmware
   - Check ESPHome logs for errors

**Solution Steps:**
1. Connect ESP32 via USB
2. Check ESPHome logs: `esphome logs bed-presence-detector.yaml`
3. Look for "WiFi connected" message
4. If not connected, update secrets and re-flash

---

### Binary Sensor Always OFF

**Possible Causes:**
1. **Sensor not calibrated**
   - Run calibration procedure

2. **Sensor placement too far from bed**
   - Move sensor closer (1-3 feet above mattress)

3. **Wiring incorrect**
   - Verify TX/RX connections (crossed)
   - Check 3.3V power connection

4. **Threshold too high**
   - Check z-score in state reason sensor
   - If z-score when occupied is 6.0, but k_on is 9.0, decrease k_on

**Solution Steps:**
1. Check `text_sensor.presence_state_reason` when in bed
2. Note the z-score value
3. If z-score is high (>8) but sensor doesn't turn ON:
   - Wait for debounce timer (3 seconds default)
   - Check that z-score stays high
4. If z-score is low (<5) when occupied:
   - Recalibrate sensor
   - Improve sensor placement
   - Decrease k_on threshold

---

### Binary Sensor Always ON

**Possible Causes:**
1. **Baseline incorrectly calibrated with person in bed**
   - Recalibrate with bed completely empty

2. **Constant interference (fan, HVAC) not accounted for**
   - Recalibrate with normal ambient conditions
   - Use distance windowing to exclude interference source

3. **Threshold too low**
   - k_on set too low (e.g., 2.0)

**Solution Steps:**
1. Ensure bed is completely empty
2. Run calibration: `esphome.bed_presence_detector_calibrate_start_baseline`
3. Wait 60 seconds
4. Verify sensor turns OFF

---

### Sensor Turns OFF While Sleeping

**This is the most common issue.** See [Tuning: False Negatives](#issue-sensor-turning-off-while-still-in-bed-false-negatives) above.

**Quick Fix:**
1. Increase `number.absolute_clear_delay_ms` to **60000** (60 seconds)
2. Test again

If issue persists:
3. Increase to **120000** (2 minutes)
4. Consider decreasing `k_off` to 3.0

---

### Need More Help?

**Check the Documentation:**
- [Full Troubleshooting Guide](../troubleshooting.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [FAQ](../faq.md)

**Community Support:**
- GitHub Issues: [Report a bug or request help](https://github.com/r-mccarty/bed-presence-sensor/issues)
- GitHub Discussions: [Ask questions and share tips](https://github.com/r-mccarty/bed-presence-sensor/discussions)
- Home Assistant Community Forum: [Smart Home Enthusiasts](https://community.home-assistant.io/)

**When Asking for Help, Provide:**
1. Contents of `text_sensor.presence_state_reason` (when issue occurs)
2. ESPHome logs (last 50-100 lines)
3. Your current tuning parameters (k_on, k_off, debounce timers)
4. Description of environment (sensor height, bed type, nearby noise sources)

---

## Next Steps

### Optimize Your Setup

Now that your sensor is working, consider:

1. **Fine-tune parameters** for your specific sleeping patterns
2. **Create advanced automations** (pre-bedtime routines, wake-up sequences)
3. **Add dashboard visualizations** to monitor sensor behavior over time
4. **Experiment with distance windowing** to isolate bed zone

### Explore Advanced Features

- **Calibration History:** Track baseline changes over time (coming soon)
- **Multi-Zone Detection:** Detect which side of bed is occupied (future feature)
- **Restlessness Tracking:** Measure sleep quality via movement (experimental)

### Contribute Back

This is an open-source project that thrives on community contributions:

- **Share your setup** in the [Showcase](https://github.com/r-mccarty/bed-presence-sensor/discussions/categories/show-and-tell)
- **Report bugs or suggest features** via [GitHub Issues](https://github.com/r-mccarty/bed-presence-sensor/issues)
- **Contribute code** improvements or documentation via Pull Requests
- **Help others** in GitHub Discussions

### Stay Updated

- **Star the repository** on GitHub to get notified of updates
- **Watch for releases** for new features and improvements
- **Join the community** for tips and best practices

---

## Congratulations!

You now have the most reliable bed presence detection solution available for Home Assistant. Your lights will never turn off while you're sleeping again, and you'll never have false triggers from your cat or fan.

**Enjoy your perfectly automated smart home!**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Project:** [Bed Presence Sensor on GitHub](https://github.com/r-mccarty/bed-presence-sensor)
**License:** Apache 2.0
