// Copyright (c) 2014-2016 Sungeun K. Jeon for Gnea Research LLC
// Copyright (c) 2018 -	Bart Dring
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

#include "Probe.h"

#include "Pin.h"

// Probe pin initialization routine.
void Probe::init() {
    static bool show_init_msg = true;  // used to show message only once.

    if (_probePin.defined()) {
        _probePin.setAttr(Pin::Attr::Input);

        if (show_init_msg) {
            _probePin.report("Probe Pin:");
            show_init_msg = false;
        }
    }
}

void Probe::set_direction(bool is_away) {
    _isProbeAway = is_away;
}

// Returns the probe pin state. Triggered = true. Called by gcode parser.
bool Probe::get_state() {
    return _probePin.read();
}

// Returns true if the probe pin is tripped, accounting for the direction (away or not).
// This function must be extremely efficient as to not bog down the stepper ISR.
// Should be called only in situations where the probe pin is known to be defined.
bool IRAM_ATTR Probe::tripped() {
    bool pin_state = _probePin.read();

    // For ProbeToward (G38.2/G38.3): trigger when probe becomes active
    // For ProbeAway (G38.4/G38.5): trigger when probe becomes inactive
    // Fixed logic to ensure proper behavior for Maslow CNC probe operations
    if (_isProbeAway) {
        // ProbeAway: probe is considered tripped when pin is inactive (not touching)
        return !pin_state;
    } else {
        // ProbeToward: probe is considered tripped when pin is active (touching)
        return pin_state;
    }
}

void Probe::validate() {}

void Probe::group(Configuration::HandlerBase& handler) {
    handler.item("pin", _probePin);
    handler.item("check_mode_start", _check_mode_start);
}
