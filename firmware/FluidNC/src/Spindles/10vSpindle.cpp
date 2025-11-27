// Copyright (c) 2020 -	Bart Dring
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

/*
    10vSpindle.cpp

    This is basically a PWM spindle with some changes, so a separate forward and
    reverse signal can be sent.

    The direction pins will act as enables for the 2 directions. There is usually
    a min RPM with VFDs, that speed will remain even if speed is 0. You
    must turn off both direction pins when enable is off.
*/

#include "10vSpindle.h"

#include "Driver/PwmPin.h"  // pwmInit(), etc.
#include "../System.h"      // sys.spindle_speed
#include "../GCode.h"       // gc_state.modal

namespace Spindles {
    void _10v::init() {
        // a couple more pins not inherited from PWM Spindle
        if (_output_pin.undefined()) {
            log_warn("Spindle output pin not defined");
            return;  // We cannot continue without the output pin
        }

        _pwm = new PwmPin(_output_pin, _pwm_freq);  // allocate and setup a PWM channel

        _enable_pin.setAttr(Pin::Attr::Output);
        _direction_pin.setAttr(Pin::Attr::Output);
        _forward_pin.setAttr(Pin::Attr::Output);
        _reverse_pin.setAttr(Pin::Attr::Output);

        if (_speeds.size() == 0) {
            shelfSpeeds(6000, 20000);
        }

        _current_state    = SpindleState::Disable;
        _current_pwm_duty = 0;

        // We set the dev_speed scale in the speed map to the full PWM period (64K)
        // Then, in set_output, we map the dev_speed range of 0..64K to the pulse
        // length range of ~1ms .. 2ms
        setupSpeeds(_pwm->period());

        stop();

        config_message();

        is_reversable = true;  // these VFDs are always reversable
    }

    // prints the startup message of the spindle config
    void _10v::config_message() {
        char* buffer = getLogBuffer();
        snprintf(buffer, 1400, "%s Spindle Ena:%s Out:%s Dir:%s Fwd:%s Rev:%s Freq:%dHz Period:%d",
                name(), _enable_pin.name().c_str(), _output_pin.name().c_str(), _direction_pin.name().c_str(),
                _forward_pin.name().c_str(), _reverse_pin.name().c_str(), _pwm->frequency(), _pwm->period());
        log_info(buffer);
        releaseLogBuffer();
    }

    // This appears identical to the code in PWMSpindle.cpp but
    // it uses the 10v versions of set_enable and set_output
    void IRAM_ATTR _10v::setSpeedfromISR(uint32_t dev_speed) {
        set_enable(gc_state.modal.spindle != SpindleState::Disable);
        set_output(dev_speed);
    }

    void IRAM_ATTR _10v::set_enable(bool enable) {
        if (_disable_with_zero_speed && sys.spindle_speed() == 0) {
            enable = false;
        }

        _enable_pin.synchronousWrite(enable);

        // turn off anything that acts like an enable
        if (!enable) {
            _direction_pin.synchronousWrite(enable);
            _forward_pin.synchronousWrite(enable);
            _reverse_pin.synchronousWrite(enable);
        }
    }

    void _10v::set_direction(bool Clockwise) {
        _direction_pin.synchronousWrite(Clockwise);
        _forward_pin.synchronousWrite(Clockwise);
        _reverse_pin.synchronousWrite(!Clockwise);
    }

    void _10v::deinit() {
        _enable_pin.setAttr(Pin::Attr::Input);
        _direction_pin.setAttr(Pin::Attr::Input);
        _forward_pin.setAttr(Pin::Attr::Input);
        _reverse_pin.setAttr(Pin::Attr::Input);
        if (_pwm) {
            delete _pwm;
            _pwm = nullptr;
        }
        _output_pin.setAttr(Pin::Attr::Input);
    }

    // Configuration registration
    namespace {
        SpindleFactory::InstanceBuilder<_10v> registration("10V");
    }
}
