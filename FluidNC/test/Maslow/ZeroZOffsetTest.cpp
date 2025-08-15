#include "TestFramework.h"
#include "../../src/Kinematics/MaslowKinematics.h"
#include <cmath>

// Test to verify proper handling when all z-axis offsets are zero
Test(MaslowKinematicsZeroZOffset, ZeroZOffsetTest) {
    using namespace Kinematics;
    
    // Create a MaslowKinematics instance
    MaslowKinematics kinematics;
    
    // Set anchor coordinates with all Z offsets as zero
    float tlX = 0.0f, tlY = 2000.0f, tlZ = 0.0f;
    float trX = 2000.0f, trY = 2000.0f, trZ = 0.0f;
    float blX = 0.0f, blY = 0.0f, blZ = 0.0f;
    float brX = 2000.0f, brY = 0.0f, brZ = 0.0f;
    
    kinematics.updateAnchorCoordinates(tlX, tlY, tlZ, trX, trY, trZ, blX, blY, blZ, brX, brY, brZ);
    
    // Test position at origin with zero Z
    float testX = 0.0f, testY = 0.0f, testZ = 0.0f;
    
    // Calculate belt lengths - this should not fail or produce invalid results
    float tlLength = kinematics.computeTL(testX, testY, testZ);
    float trLength = kinematics.computeTR(testX, testY, testZ);
    float blLength = kinematics.computeBL(testX, testY, testZ);
    float brLength = kinematics.computeBR(testX, testY, testZ);
    
    // Verify that all belt lengths are valid numbers (not NaN or infinite)
    Assert(!std::isnan(tlLength), "TL belt length should not be NaN");
    Assert(!std::isnan(trLength), "TR belt length should not be NaN");
    Assert(!std::isnan(blLength), "BL belt length should not be NaN");
    Assert(!std::isnan(brLength), "BR belt length should not be NaN");
    
    Assert(!std::isinf(tlLength), "TL belt length should not be infinite");
    Assert(!std::isinf(trLength), "TR belt length should not be infinite");
    Assert(!std::isinf(blLength), "BL belt length should not be infinite");
    Assert(!std::isinf(brLength), "BR belt length should not be infinite");
    
    // Belt lengths should be positive and reasonable
    Assert(tlLength > 0, "TL belt length should be positive");
    Assert(trLength > 0, "TR belt length should be positive");
    Assert(blLength > 0, "BL belt length should be positive");
    Assert(brLength > 0, "BR belt length should be positive");
    
    // Test with non-zero Z position to see difference
    float testZ_nonzero = -10.0f; // Router below anchors
    float tlLength_z = kinematics.computeTL(testX, testY, testZ_nonzero);
    float trLength_z = kinematics.computeTR(testX, testY, testZ_nonzero);
    float blLength_z = kinematics.computeBL(testX, testY, testZ_nonzero);
    float brLength_z = kinematics.computeBR(testX, testY, testZ_nonzero);
    
    // Belt lengths should be different when Z changes
    Assert(tlLength_z != tlLength, "TL belt length should change with Z position");
    Assert(trLength_z != trLength, "TR belt length should change with Z position");
    Assert(blLength_z != blLength, "BL belt length should change with Z position");
    Assert(brLength_z != brLength, "BR belt length should change with Z position");
}

// Test edge case where Z components might cause mathematical issues
Test(MaslowKinematicsZeroZOffsetEdgeCase, ZeroZOffsetTest) {
    using namespace Kinematics;
    
    // Create a MaslowKinematics instance
    MaslowKinematics kinematics;
    
    // Set anchor coordinates with all Z offsets as zero
    kinematics.updateAnchorCoordinates(0.0f, 2000.0f, 0.0f,   // TL
                                      2000.0f, 2000.0f, 0.0f, // TR
                                      0.0f, 0.0f, 0.0f,       // BL
                                      2000.0f, 0.0f, 0.0f);   // BR
    
    // Test position where router is at same height as anchors (Z=0)
    // and at center of frame where X,Y distances might be equal
    float centerX = 1000.0f, centerY = 1000.0f, centerZ = 0.0f;
    
    float tlLength = kinematics.computeTL(centerX, centerY, centerZ);
    float trLength = kinematics.computeTR(centerX, centerY, centerZ);
    float blLength = kinematics.computeBL(centerX, centerY, centerZ);
    float brLength = kinematics.computeBR(centerX, centerY, centerZ);
    
    // All calculations should produce valid finite results
    Assert(std::isfinite(tlLength) && tlLength > 0, "TL belt length should be finite and positive");
    Assert(std::isfinite(trLength) && trLength > 0, "TR belt length should be finite and positive");
    Assert(std::isfinite(blLength) && blLength > 0, "BL belt length should be finite and positive");
    Assert(std::isfinite(brLength) && brLength > 0, "BR belt length should be finite and positive");
    
    // Test that different positions produce different belt lengths
    float offset_x = centerX + 100.0f;
    float offset_y = centerY + 100.0f;
    
    float tlLength_offset = kinematics.computeTL(offset_x, offset_y, centerZ);
    float trLength_offset = kinematics.computeTR(offset_x, offset_y, centerZ);
    float blLength_offset = kinematics.computeBL(offset_x, offset_y, centerZ);
    float brLength_offset = kinematics.computeBR(offset_x, offset_y, centerZ);
    
    // At least some belt lengths should change when position changes
    bool lengthsChanged = (tlLength_offset != tlLength) || (trLength_offset != trLength) ||
                         (blLength_offset != blLength) || (brLength_offset != brLength);
    Assert(lengthsChanged, "Belt lengths should change when position changes");
}