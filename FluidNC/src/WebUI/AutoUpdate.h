// Copyright (c) 2024 - FluidNC Contributors
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

#pragma once

#include "../Config.h"

#ifdef ENABLE_WIFI

namespace WebUI {
    class AutoUpdate {
    public:
        static bool checkForUpdate();
        static bool downloadAndInstallUpdate(const std::string& firmwareUrl, const std::string& webUIUrl);

    private:
        static std::string getLatestReleaseInfo();
        static bool        downloadFileToLocalFS(const std::string& url, const std::string& filename);
        static bool        downloadAndInstallFirmware(const std::string& firmwareUrl);
        static bool        isNewerVersion(const std::string& latestVersion, const std::string& currentVersion);
        static std::string extractAssetDownloadURL(const std::string& jsonResponse, const std::string& assetName);
    };
}

#endif