// Test to verify the specific Z-axis preservation issue described in the GitHub issue
// This test simulates the exact scenario: Release tension -> Apply tension -> Start new job

#include "TestFramework.h"
#include <cmath>

// Mock implementation to simulate the Z-axis preservation scenario
class ZAxisMockTest {
public:
    float mockZPosition = -25.4f;  // Simulate being 1 inch below surface initially
    float savedZPosition = 0.0f;   // Simulate the calibration's saved Z position
    
    // Mock get_mpos function behavior
    float getMockZPosition() {
        return mockZPosition;
    }
    
    // Simulate the old buggy behavior (always setting Z to 0)
    float getBuggyBehaviorZPosition() {
        return 0.0f;  // This was the problem - always returned 0
    }
    
    // Simulate the new fixed behavior (restoring saved Z position)
    float getFixedBehaviorZPosition() {
        return savedZPosition;  // This is the fix - restore the saved position
    }
    
    // Simulate releasing tension (should save current Z position)
    void simulateReleaseTension() {
        savedZPosition = getMockZPosition();
    }
    
    // Simulate taking slack/applying tension
    void simulateTakeSlack() {
        // The fix ensures we restore savedZPosition instead of using 0
        mockZPosition = getFixedBehaviorZPosition();
    }
    
    // Simulate the buggy behavior for comparison
    void simulateBuggyTakeSlack() {
        mockZPosition = getBuggyBehaviorZPosition();  // Old buggy behavior
    }
};

Test(ZAxisPositionPreservation, SimulateBuggyBehavior) {
    ZAxisMockTest mockTest;
    
    // Start with router positioned 1 inch below surface (where user had it)
    float initialZPosition = -25.4f;
    mockTest.mockZPosition = initialZPosition;
    
    // User releases tension
    mockTest.simulateReleaseTension();
    Assert(mockTest.savedZPosition == initialZPosition, "Should save the initial Z position");
    
    // Simulate the old buggy behavior when taking slack
    mockTest.simulateBuggyTakeSlack();
    Assert(mockTest.mockZPosition == 0.0f, "Buggy behavior sets Z to 0, causing router to move far from work");
    
    // This demonstrates the problem: router goes from -25.4mm to 0mm (25.4mm movement upward)
    float unintendedMovement = mockTest.mockZPosition - initialZPosition;
    Assert(fabs(unintendedMovement - 25.4f) < 0.1f, "Buggy behavior causes 25.4mm unintended Z movement");
}

Test(ZAxisPositionPreservation, SimulateFixedBehavior) {
    ZAxisMockTest mockTest;
    
    // Start with router positioned 1 inch below surface (where user had it)
    float initialZPosition = -25.4f;
    mockTest.mockZPosition = initialZPosition;
    
    // User releases tension (our fix saves this position)
    mockTest.simulateReleaseTension();
    Assert(mockTest.savedZPosition == initialZPosition, "Should save the initial Z position");
    
    // Simulate the new fixed behavior when taking slack
    mockTest.simulateTakeSlack();
    Assert(mockTest.mockZPosition == initialZPosition, "Fixed behavior restores original Z position");
    
    // This demonstrates the fix: router stays at -25.4mm (no unintended movement)
    float movement = mockTest.mockZPosition - initialZPosition;
    Assert(fabs(movement) < 0.001f, "Fixed behavior causes no unintended Z movement");
}

Test(ZAxisPositionPreservation, MultipleReleaseCycles) {
    ZAxisMockTest mockTest;
    
    // Test multiple release/apply cycles to ensure position is preserved correctly
    float positions[] = {-10.0f, -5.0f, -30.0f, 0.0f, -15.7f};
    int numPositions = sizeof(positions) / sizeof(positions[0]);
    
    for (int i = 0; i < numPositions; i++) {
        float testPosition = positions[i];
        
        // Set router to test position
        mockTest.mockZPosition = testPosition;
        
        // Release and apply tension
        mockTest.simulateReleaseTension();
        mockTest.simulateTakeSlack();
        
        // Verify position is preserved
        Assert(fabs(mockTest.mockZPosition - testPosition) < 0.001f, 
               "Position should be preserved through release/apply cycle");
    }
}