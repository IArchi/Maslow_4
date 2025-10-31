// Copyright (c) 2020 -	Bart Dring
// Copyright (c) 2020 -	The Ant Team
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

/*
    This is used for Trinamic UART controlled stepper motor drivers.

    TMC2209 Datasheet
    https://www.trinamic.com/fileadmin/assets/Products/ICs_Documents/TMC2209_Datasheet_V103.pdf
*/

#include "TrinamicUartDriver.h"

#include "../Machine/MachineConfig.h"
#include "../Uart.h"

#include <TMCStepper.h>  // https://github.com/teemuatlut/TMCStepper
#include <atomic>

namespace MotorDrivers {

    void TrinamicUartDriver::init() {
        _uart = config->_uarts[_uart_num];
        if (!_uart) {
            log_error("TMC2208: Missing uart" << _uart_num << "section");
            return;
        }
    }

    /*
        This is the startup message showing the basic definition. 
    */
    void TrinamicUartDriver::config_message() {  //TODO: The RX/TX pin could be added to the msg.
        char* buffer = getLogBuffer();
        snprintf(buffer, 1400, "    %s UART%d Addr:%d Step:%s Dir:%s Disable:%s R:%g",
                name(), _uart_num, _addr, _step_pin.name().c_str(), _dir_pin.name().c_str(),
                _disable_pin.name().c_str(), _r_sense);
        log_info(buffer);
        releaseLogBuffer();
    }

    uint8_t TrinamicUartDriver::toffValue() {
        if (_disabled) {
            return _toff_disable;
        }
        return _mode == TrinamicMode::StealthChop ? _toff_stealthchop : _toff_coolstep;
    }

}
