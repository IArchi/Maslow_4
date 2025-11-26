#include "TestFramework.h"
#include "../../src/Kinematics/MaslowKinematics.h"
#include "../../src/Maslow/Maslow.h"

// Test to verify that XY scale factors are applied correctly in coordinate transformations
Test(MaslowKinematicsScaleFactors, ScaleFactorTest) {
    using namespace Kinematics;
    
    // Create a MaslowKinematics instance and initialize it
    MaslowKinematics kinematics;
    kinematics.init();
    
    // Set up test scale factors
    Maslow.scaleX = 1.1f;  // 10% increase in X
    Maslow.scaleY = 0.9f;  // 10% decrease in Y
    
    // Test cartesian coordinates
    float cartesian[3] = {100.0f, 200.0f, 10.0f};  // X=100, Y=200, Z=10
    float motors[6];
    
    // Transform cartesian to motors (scale factors should be applied)
    kinematics.transform_cartesian_to_motors(motors, cartesian);
    
    // Now transform back to cartesian (inverse scale factors should be applied)
    float result_cartesian[3];
    kinematics.motors_to_cartesian(result_cartesian, motors, 6);
    
    // The result should match the original cartesian coordinates within a small tolerance
    // because the scale factors should be applied and then inverted
    float tolerance = 0.01f;
    Assert(fabs(result_cartesian[0] - cartesian[0]) < tolerance, "X coordinate should match after round-trip transformation");
    Assert(fabs(result_cartesian[1] - cartesian[1]) < tolerance, "Y coordinate should match after round-trip transformation");
    Assert(fabs(result_cartesian[2] - cartesian[2]) < tolerance, "Z coordinate should match after round-trip transformation");
}

// Test that scale factors of 1.0 don't change behavior
Test(MaslowKinematicsScaleFactorsUnity, ScaleFactorTest) {
    using namespace Kinematics;
    
    // Create a MaslowKinematics instance and initialize it
    MaslowKinematics kinematics;
    kinematics.init();
    
    // Set scale factors to 1.0 (no scaling)
    Maslow.scaleX = 1.0f;
    Maslow.scaleY = 1.0f;
    
    // Test cartesian coordinates
    float cartesian[3] = {150.0f, 250.0f, 5.0f};  // X=150, Y=250, Z=5
    float motors[6];
    
    // Transform cartesian to motors
    kinematics.transform_cartesian_to_motors(motors, cartesian);
    
    // Transform back to cartesian
    float result_cartesian[3];
    kinematics.motors_to_cartesian(result_cartesian, motors, 6);
    
    // The result should exactly match the original cartesian coordinates
    float tolerance = 0.001f;
    Assert(fabs(result_cartesian[0] - cartesian[0]) < tolerance, "X coordinate should match exactly with unity scale");
    Assert(fabs(result_cartesian[1] - cartesian[1]) < tolerance, "Y coordinate should match exactly with unity scale");
    Assert(fabs(result_cartesian[2] - cartesian[2]) < tolerance, "Z coordinate should match exactly with unity scale");
}

// Test that different scale factors produce proportional changes in motor space
Test(MaslowKinematicsScaleFactorsProportional, ScaleFactorTest) {
    using namespace Kinematics;
    
    // Create a MaslowKinematics instance and initialize it
    MaslowKinematics kinematics;
    kinematics.init();
    
    // Test coordinates
    float cartesian[3] = {100.0f, 100.0f, 0.0f};  // Simple square coordinates
    
    // First, test with no scaling
    Maslow.scaleX = 1.0f;
    Maslow.scaleY = 1.0f;
    float motors_no_scale[6];
    kinematics.transform_cartesian_to_motors(motors_no_scale, cartesian);
    
    // Then test with X scaling
    Maslow.scaleX = 2.0f;  // Double X scale
    Maslow.scaleY = 1.0f;
    float motors_x_scaled[6];
    kinematics.transform_cartesian_to_motors(motors_x_scaled, cartesian);
    
    // The motor values should be different when scaling is applied
    // We can't predict exact values without complex math, but they should be different
    bool motors_changed = false;
    for (int i = 0; i < 4; i++) {  // Check belt motors (A, B, C, D)
        if (fabs(motors_no_scale[i] - motors_x_scaled[i]) > 0.1f) {
            motors_changed = true;
            break;
        }
    }
    
    Assert(motors_changed, "Motor values should change when scale factors are applied");
    
    // Z motor should remain the same (no scaling applied to Z)
    Assert(fabs(motors_no_scale[4] - motors_x_scaled[4]) < 0.001f, "Z motor should not be affected by XY scaling");
}