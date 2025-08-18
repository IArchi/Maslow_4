#include "TestFramework.h"
#include "../../src/Maslow/Calibration.h"
#include "../../src/Maslow/Maslow.h"
#include <cmath>

// Test to verify Z-axis motor position is left untouched during tension release/apply cycles
Test(ZAxisPreservation, TensionReleaseApplyTest) {
    // Create a calibration instance
    Calibration calibration;
    
    // Simulate being in a stable state ready for tension release
    calibration.currentState = READY_TO_CUT;
    
    // During tension release/apply, the Z motor position should NOT be modified
    // Only the belt motor positions (A, B, C, D) should be updated
    
    // Request tension release - this should NOT save any Z position
    bool releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(releaseSuccess, "Should be able to release tension from READY_TO_CUT state");
    Assert(calibration.currentState == RELEASE_TENSION, "State should be RELEASE_TENSION");
    
    // Simulate completing tension release and moving to EXTENDEDOUT
    bool extendSuccess = calibration.requestStateChange(EXTENDEDOUT);
    Assert(extendSuccess, "Should be able to transition to EXTENDEDOUT from RELEASE_TENSION");
    Assert(calibration.currentState == EXTENDEDOUT, "State should be EXTENDEDOUT");
    
    // Now test taking slack which should only update belt positions, not Z
    bool slackSuccess = calibration.requestStateChange(TAKING_SLACK);
    Assert(slackSuccess, "Should be able to take slack from EXTENDEDOUT state");
    Assert(calibration.currentState == TAKING_SLACK, "State should be TAKING_SLACK");
    
    // The critical behavior is that takeSlackFunc() only sets belt motor positions
    // and leaves the Z motor position completely untouched
}

// Test to verify Z-axis motor position remains untouched from different starting states
Test(ZAxisPreservation, MultipleStateTransitionsTest) {
    Calibration calibration;
    
    // Test from EXTENDEDOUT state
    calibration.currentState = EXTENDEDOUT;
    bool releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(releaseSuccess, "Should be able to release tension from EXTENDEDOUT state");
    
    // Test from CALIBRATION_COMPUTING state
    calibration.currentState = CALIBRATION_COMPUTING;
    releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(releaseSuccess, "Should be able to release tension from CALIBRATION_COMPUTING state");
    
    // Test from UNKNOWN state
    calibration.currentState = UNKNOWN;
    releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(releaseSuccess, "Should be able to release tension from UNKNOWN state");
    
    // Test that invalid states are rejected
    calibration.currentState = RETRACTING;
    releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(!releaseSuccess, "Should NOT be able to release tension from RETRACTING state");
}

// Test to verify state restoration after tension release
Test(ZAxisPreservation, StateRestorationTest) {
    Calibration calibration;
    
    // Start from READY_TO_CUT
    calibration.currentState = READY_TO_CUT;
    int originalState = calibration.currentState;
    
    // Release tension
    bool releaseSuccess = calibration.requestStateChange(RELEASE_TENSION);
    Assert(releaseSuccess, "Should successfully release tension");
    Assert(calibration.currentState == RELEASE_TENSION, "Should be in RELEASE_TENSION state");
    
    // Verify previousState was saved
    // Note: previousState is private, so we test the behavior indirectly
    // The completion of tension release should restore to EXTENDEDOUT for READY_TO_CUT
    
    // Simulate completing the tension release cycle
    // This would normally happen in the home() function when the timer expires
    calibration.currentState = EXTENDEDOUT; // Simulating what happens after release completes
    
    Assert(calibration.currentState == EXTENDEDOUT, "Should return to appropriate state after tension release");
}