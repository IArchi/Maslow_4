// Motor Current Debugging functionality

let motorCurrentData = {
    TLC: 0,
    TRC: 0,
    BLC: 0,
    BRC: 0,
    lastUpdate: null
};

const MAX_CURRENT = 4000; // Maximum current value for gauge scaling

/**
 * Parse motor current message in format: [MSG:INFO: TLC: 0.000 TRC: 0.000 BLC: 0.000 BRC: 0.000]
 * @param {string} message - The motor current message to parse
 */
const parseMotorCurrentMessage = (message) => {
    const motorCurrentRegex = /\[MSG:INFO:\s*TLC:\s*([\d.]+)\s*TRC:\s*([\d.]+)\s*BLC:\s*([\d.]+)\s*BRC:\s*([\d.]+)\]/;
    const match = message.match(motorCurrentRegex);
    
    if (match) {
        motorCurrentData.TLC = Number.parseFloat(match[1]);
        motorCurrentData.TRC = Number.parseFloat(match[2]);
        motorCurrentData.BLC = Number.parseFloat(match[3]);
        motorCurrentData.BRC = Number.parseFloat(match[4]);
        motorCurrentData.lastUpdate = new Date();
        
        updateMotorCurrentDisplay();
        return true;
    }
    return false;
};

/**
 * Update the gauge display with current motor current values
 */
const updateMotorCurrentDisplay = () => {
    const motors = ['TLC', 'TRC', 'BLC', 'BRC'];
    
    motors.forEach(motor => {
        const value = motorCurrentData[motor];
        const percentage = Math.min((value / MAX_CURRENT) * 100, 100);
        const circumference = 2 * Math.PI * 60; // radius = 60
        const offset = circumference - (percentage / 100) * circumference;
        
        // Update gauge progress
        const gaugeElement = id(`${motor.toLowerCase()}-gauge-progress`);
        if (gaugeElement) {
            gaugeElement.style.strokeDashoffset = offset;
            
            // Change color based on current level
            let color = '#4CAF50'; // Green for low current
            if (percentage > 75) {
                color = '#F44336'; // Red for high current
            } else if (percentage > 50) {
                color = '#FF9800'; // Orange for medium current
            } else if (percentage > 25) {
                color = '#2196F3'; // Blue for low-medium current
            }
            gaugeElement.style.stroke = color;
        }
        
        // Update gauge value text
        const valueElement = id(`${motor.toLowerCase()}-value`);
        if (valueElement) {
            valueElement.textContent = Math.round(value);
        }
        
        // Update status text
        const statusElement = id(`${motor.toLowerCase()}-status`);
        if (statusElement) {
            statusElement.textContent = `${Math.round(value)} mA`;
        }
    });
    
    // Update last update timestamp
    const lastUpdateElement = id('last-update');
    if (lastUpdateElement && motorCurrentData.lastUpdate) {
        lastUpdateElement.textContent = motorCurrentData.lastUpdate.toLocaleTimeString();
    }
};

/**
 * Initialize the debugging tab functionality
 */
const initDebuggingTab = () => {
    // Set initial gauge states
    updateMotorCurrentDisplay();
    
    // Add event listener for tab activation to refresh display
    const debugTab = id('debuggingtab');
    if (debugTab) {
        debugTab.addEventListener('activate', () => {
            // Refresh display when tab becomes active
            updateMotorCurrentDisplay();
        });
    }
};

/**
 * Reset motor current data (useful for testing or connection reset)
 */
const resetMotorCurrentData = () => {
    motorCurrentData = {
        TLC: 0,
        TRC: 0,
        BLC: 0,
        BRC: 0,
        lastUpdate: null
    };
    updateMotorCurrentDisplay();
    
    const lastUpdateElement = id('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = translate_text_item('No data received');
    }
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseMotorCurrentMessage,
        updateMotorCurrentDisplay,
        initDebuggingTab,
        resetMotorCurrentData,
        motorCurrentData
    };
}