// Check for Updates dialog
// Fetches the latest release from GitHub for the configured update stream,
// then downloads and installs firmware.bin and index.html.gz if an update is available.

const GITHUB_REPO = "MaslowCNC/Maslow_4";
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/releases`;

let checkUpdates_latestRelease = null;
let checkUpdates_ongoing = false;

/** Open the Check for Updates dialog */
const checkupdatesdlg = () => {
    const modal = setactiveModal("checkupdatesdlg.html");
    if (modal == null) {
        return;
    }

    id("checkUpdatesDlgCancel").addEventListener("click", closeCheckUpdatesDialog);
    id("checkUpdatesDlgClose").addEventListener("click", closeCheckUpdatesDialog);
    id("checkUpdatesDlgCheck").addEventListener("click", checkForUpdates);
    id("checkUpdatesDlgInstall").addEventListener("click", installUpdate);

    resetCheckUpdatesDialog();
    showModal();

    // Automatically check for updates when dialog opens
    checkForUpdates();
};

function closeCheckUpdatesDialog() {
    if (checkUpdates_ongoing) {
        alertdlg(
            translate_text_item("Busy..."),
            translate_text_item("Update is in progress, please wait.")
        );
        return;
    }
    closeModal("cancel");
}

function resetCheckUpdatesDialog() {
    checkUpdates_latestRelease = null;
    setHTML("checkupdates_status", translate_text_item("Checking for updates..."));
    displayNone("checkupdates_info");
    displayNone("checkupdates_progress");
    displayNone("checkUpdatesDlgInstall");
    displayBlock("checkUpdatesDlgCheck");
}

/** Return the configured update stream from preferences */
function getUpdateStream() {
    return GetPrefOrDefault("update_stream") || "release";
}

/** Select the best release from the list based on the configured stream.
 *
 * Tag convention (see .github/workflows in PR #975):
 *   nightly      — rolling pre-release published daily; tag_name is literally "nightly"
 *   experimental — versioned pre-release; tag_name matches v*-exp* (e.g. v1.2.3-exp.1)
 *   release      — stable full release; tag_name is bare semver (e.g. v1.2.3)
 */
function selectReleaseForStream(releases, stream) {
    if (!releases || releases.length === 0) {
        return null;
    }
    let candidates;
    switch (stream) {
        case "nightly":
            // The nightly workflow always recreates a single rolling release whose
            // tag_name is the literal string "nightly".
            candidates = releases.filter(r => r.tag_name === "nightly" && !r.draft);
            break;
        case "experimental":
            // Versioned pre-releases (v*-exp.*) — exclude the rolling nightly tag.
            candidates = releases.filter(
                r => r.prerelease && !r.draft && r.tag_name !== "nightly"
            );
            break;
        case "release":
        default:
            // Stable, non-prerelease only.
            candidates = releases.filter(r => !r.prerelease && !r.draft);
            break;
    }
    // GitHub returns releases newest-first; pick the first match.
    return candidates.length > 0 ? candidates[0] : null;
}

/** Return true if latestTag is newer than currentVersion */
function isNewerVersion(currentVersion, latestTag) {
    // Normalize: strip leading 'v', convert to lower-case, drop pre-release suffix for comparison
    const normalize = (v) => {
        // Strip leading 'v', lowercase, then remove any pre-release suffix (e.g. '-beta', '-rc1')
        return v.replace(/^v/i, "").trim().toLowerCase().replace(/-.*$/, "");
    };
    const cur = normalize(currentVersion || "");
    const latest = normalize(latestTag || "");
    if (!cur || !latest) {
        return (latest !== cur);
    }
    if (cur === latest) {
        return false;
    }
    // Numeric semver comparison
    const toNum = (s) => s.split(".").map(p => parseInt(p, 10) || 0);
    const curParts = toNum(cur);
    const latestParts = toNum(latest);
    const len = Math.max(curParts.length, latestParts.length);
    for (let i = 0; i < len; i++) {
        const c = curParts[i] || 0;
        const l = latestParts[i] || 0;
        if (l > c) return true;
        if (l < c) return false;
    }
    return false;
}

/** Look up an asset by name (case-insensitive) in a release */
function findAsset(release, name) {
    if (!release || !release.assets) return null;
    return release.assets.find(
        a => a.name.toLowerCase() === name.toLowerCase()
    ) || null;
}

/** Fetch releases from GitHub and update the dialog */
function checkForUpdates() {
    displayNone("checkupdates_info");
    displayNone("checkUpdatesDlgInstall");
    setHTML("checkupdates_status", translate_text_item("Checking for updates..."));
    displayBlock("checkUpdatesDlgCheck");

    const stream = getUpdateStream();

    fetch(GITHUB_API_BASE, {
        headers: {
            "Accept": "application/vnd.github+json",
            "User-Agent": "MaslowCNC-WebUI"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            return response.json();
        })
        .then(releases => {
            const release = selectReleaseForStream(releases, stream);
            handleReleaseFetched(release, stream);
        })
        .catch(err => {
            console.error("Error checking for updates:", err);
            setHTML(
                "checkupdates_status",
                `<span style="color:red;">${translate_text_item("Failed to check for updates:")} ${err.message}</span>`
            );
        });
}

function streamLabel(stream) {
    switch (stream) {
        case "experimental": return translate_text_item("Experimental (pre-release)");
        case "nightly": return translate_text_item("Nightly (latest)");
        default: return translate_text_item("Release (stable)");
    }
}

function handleReleaseFetched(release, stream) {
    checkUpdates_latestRelease = release;

    setHTML("checkupdates_stream", streamLabel(stream));

    if (!release) {
        setHTML(
            "checkupdates_status",
            translate_text_item("No releases found for the selected update stream.")
        );
        return;
    }

    const latestTag = release.tag_name || "";
    const currentFw = fw_version || "";
    const currentUi = web_ui_version || "";

    // Display versions, flagging each if it's behind
    const fwUpdateAvailable = isNewerVersion(currentFw, latestTag);
    const uiUpdateAvailable = isNewerVersion(currentUi, latestTag);

    const updateBadge = (label) =>
        `${label} <span style="color:orange;">(&#x25B2; update available)</span>`;

    const fwLabel = currentFw || translate_text_item("unknown");
    const uiLabel = currentUi || translate_text_item("unknown");

    setHTML("checkupdates_fw_version", fwUpdateAvailable ? updateBadge(fwLabel) : fwLabel);
    setHTML("checkupdates_ui_version", uiUpdateAvailable ? updateBadge(uiLabel) : uiLabel);
    setHTML("checkupdates_latest_version", latestTag);
    displayBlock("checkupdates_info");

    // Show release notes if present
    if (release.body && release.body.trim()) {
        setHTML("checkupdates_notes", release.body.trim());
        displayBlock("checkupdates_notes_section");
    } else {
        displayNone("checkupdates_notes_section");
    }

    const hasFirmware = !!findAsset(release, "firmware.bin");
    const hasUI = !!findAsset(release, "index.html.gz");

    if (!hasFirmware && !hasUI) {
        setHTML(
            "checkupdates_status",
            translate_text_item("Release found but no installable assets (firmware.bin / index.html.gz) are attached.")
        );
        return;
    }

    if (fwUpdateAvailable || uiUpdateAvailable) {
        setHTML(
            "checkupdates_status",
            `<span style="color:green;">${translate_text_item("A new update is available!")}</span>`
        );
        displayBlock("checkUpdatesDlgInstall");
    } else {
        setHTML(
            "checkupdates_status",
            translate_text_item("Your firmware is up to date.")
        );
    }
}

/**
 * Resolve the URL the firmware should download an asset from.
 * Prefer the GitHub API asset URL (api.github.com/.../releases/assets/{id});
 * it 302-redirects to the signed binary when requested with
 * `Accept: application/octet-stream`. The ESP32 performs the download itself
 * (see /downloadupdate), so it is not affected by the missing CORS headers on
 * the final release-assets.githubusercontent.com host that block the browser.
 */
function assetDownloadUrl(asset) {
    return (asset && asset.url) || (asset && asset.browser_download_url) || "";
}

/** Wrap SendGetHttp in a Promise */
function sendGetHttpPromise(url) {
    return new Promise((resolve, reject) => {
        SendGetHttp(
            url,
            (response) => resolve(response),
            (error_code, response) => reject(new Error(`HTTP ${error_code} — ${response}`))
        );
    });
}

/**
 * Ask the firmware to download a release asset directly from GitHub.
 * target: "firmware" to OTA-flash (triggers reboot), or "file" to save to the
 * local filesystem under `name` (e.g. index.html.gz).
 */
function proxyDownload(asset, target, name) {
    const params = new URLSearchParams();
    params.set("url", assetDownloadUrl(asset));
    params.set("target", target);
    if (name) {
        params.set("name", name);
    }
    return sendGetHttpPromise(`${httpCmd.downloadUpdate}?${params.toString()}`);
}

/** Install the update: have the firmware download and install each asset */
function installUpdate() {
    if (!checkUpdates_latestRelease) {
        alertdlg(translate_text_item("Error"), translate_text_item("No release selected."));
        return;
    }
    confirmdlg(
        translate_text_item("Please confirm"),
        translate_text_item("Install Update?") + "\n" + checkUpdates_latestRelease.tag_name,
        startInstallUpdate
    );
}

async function startInstallUpdate(response) {
    if (response !== "yes") return;

    const release = checkUpdates_latestRelease;
    const fwAsset = findAsset(release, "firmware.bin");
    const uiAsset = findAsset(release, "index.html.gz");

    if (!fwAsset && !uiAsset) {
        alertdlg(translate_text_item("Error"), translate_text_item("No installable assets found in this release."));
        return;
    }

    checkUpdates_ongoing = true;
    displayNone("checkUpdatesDlgInstall");
    displayNone("checkUpdatesDlgCheck");
    displayBlock("checkupdates_progress");
    setHTML("checkupdates_status", translate_text_item("Installing update..."));

    // Disable ping monitoring during install
    disablePingForUpload();

    try {
        // The firmware downloads each asset directly from GitHub (server-side),
        // which avoids the release-asset CORS restriction that blocks the browser.

        // Phase 1: Install the web UI (index.html.gz) — saved to the filesystem (0–50 %)
        if (uiAsset) {
            setHTML("checkupdates_step", `${translate_text_item("Downloading")} index.html.gz...`);
            setProgress(10);
            await proxyDownload(uiAsset, "file", "index.html.gz");
            setProgress(50);
        }

        // Phase 2: Install firmware — downloaded and OTA-flashed, triggers reboot (50–100 %)
        if (fwAsset) {
            setHTML("checkupdates_step", `${translate_text_item("Installing firmware")}...`);
            setProgress(60);
            // The device reboots on success; this resolves just before the reboot.
            await proxyDownload(fwAsset, "firmware");
        }

        finishInstallUpdate();
    } catch (err) {
        checkUpdates_ongoing = false;
        restorePingAfterUpload();
        displayBlock("checkUpdatesDlgCheck");
        setHTML(
            "checkupdates_status",
            `<span style="color:red;">${translate_text_item("Update failed:")} ${err.message}</span>`
        );
        console.error("Update failed:", err);
    }
}

function finishInstallUpdate() {
    checkUpdates_ongoing = false;
    restorePingAfterUpload();
    setHTML("checkupdates_step", translate_text_item("Update installed. Restarting..."));
    setProgress(100);
    setHTML("checkupdates_status", translate_text_item("Restarting, please wait...."));

    let i = 0;
    const prg = id("checkupdates_prg");
    prg.max = 30;
    prg.value = 0;
    const interval = setInterval(() => {
        i++;
        prg.value = i;
        setHTML("checkupdates_step",
            `${translate_text_item("Restarting, please wait....")} ${31 - i} ${translate_text_item("seconds")}`
        );
        if (i >= 30) {
            clearInterval(interval);
            location.reload();
        }
    }, 1000);
}

function setProgress(pct) {
    const prg = id("checkupdates_prg");
    prg.max = 100;
    prg.value = pct;
    setHTML("checkupdates_pct", `${pct}%`);
}
