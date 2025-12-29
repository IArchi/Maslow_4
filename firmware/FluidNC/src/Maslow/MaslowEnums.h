// Copyright (c) 2024 Maslow CNC. All rights reserved.
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file with
// following exception: it may not be used for any reason by MakerMade or anyone with a business or personal connection to MakerMade

#pragma once

// Enums for indexing arms and axes to reduce code duplication
enum MaslowArm {
    _TL       = 0,  // Top Left
    _TR       = 1,  // Top Right
    _BL       = 2,  // Bottom Left
    _BR       = 3,  // Bottom Right
    ARM_COUNT = 4
};

enum CartesianAxis {
    Coord_X     = 0,  // X axis
    Coord_Y     = 1,  // Y axis
    Coord_Z     = 2,  // Z axis
    Coord_COUNT = 3
};
