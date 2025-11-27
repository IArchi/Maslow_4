// Copyright (c) 2020 -	Bart Dring
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

/*
    This is used for Trinamic SPI controlled stepper motor drivers.
*/

#include "TrinamicSpiDriver.h"
#include "../Machine/MachineConfig.h"
#include <TMCStepper.h>  // https://github.com/teemuatlut/TMCStepper
#include <atomic>

namespace MotorDrivers {

    pinnum_t TrinamicSpiDriver::daisy_chain_cs_id = 255;
    uint8_t  TrinamicSpiDriver::spi_index_mask    = 0;

    void TrinamicSpiDriver::init() {}

    uint8_t TrinamicSpiDriver::setupSPI() {
        _has_errors = false;

        auto spiConfig = config->_spi;
        Assert(spiConfig && spiConfig->defined(), "SPI bus is not configured. Cannot initialize TMC driver.");

        uint8_t cs_id;
        if (daisy_chain_cs_id != 255) {
            cs_id = daisy_chain_cs_id;
        } else {
            _cs_pin.setAttr(Pin::Attr::Output | Pin::Attr::InitialOn);
            _cs_mapping = PinMapper(_cs_pin);
            cs_id       = _cs_mapping.pinId();
        }

        return cs_id;
    }

    /*
    This is the startup message showing the basic definition
    */
    void TrinamicSpiDriver::config_message() {
        char* buffer = getLogBuffer();
        snprintf(buffer, 1400, "    %s Step:%s Dir:%s CS:%s Disable:%s Index:%d R:%g",
                name(), _step_pin.name().c_str(), _dir_pin.name().c_str(), _cs_pin.name().c_str(),
                _disable_pin.name().c_str(), _spi_index, _r_sense);
        log_info(buffer);
        releaseLogBuffer();
    }

    uint8_t TrinamicSpiDriver::toffValue() {
        if (_disabled) {
            return _toff_disable;
        }
        return _mode == TrinamicMode::StealthChop ? _toff_stealthchop : _toff_coolstep;
    }

}
