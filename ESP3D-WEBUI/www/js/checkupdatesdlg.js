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

/** Select the best release from the list based on the configured stream */
function selectReleaseForStream(releases, stream) {
    if (!releases || releases.length === 0) {
        return null;
    }
    let candidates;
    switch (stream) {
        case "experimental":
            // prerelease builds only
            candidates = releases.filter(r => r.prerelease && !r.draft);
            break;
        case "nightly":
            // all published releases (prerelease or not), most recent first
            candidates = releases.filter(r => !r.draft);
            break;
        case "release":
        default:
            // stable, non-prerelease only
            candidates = releases.filter(r => !r.prerelease && !r.draft);
            break;
    }
    // Releases are returned by GitHub newest-first, so pick the first match
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

    setHTML("checkupdates_current_version", currentFw || translate_text_item("unknown"));
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

    if (isNewerVersion(currentFw, latestTag)) {
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

/** Download a file from a URL and return a Blob */
async function downloadAsset(url, onProgress) {
    const response = await fetch(url, { headers: { "Accept": "application/octet-stream" } });
    if (!response.ok) {
        throw new Error(`Download failed (${response.status} ${response.statusText}): ${url}`);
    }

    // Stream the download so we can report progress
    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0 && onProgress) {
            onProgress(loaded, total);
        }
    }

    return new Blob(chunks);
}

/** Upload a File object to the ESP32 firmware update endpoint */
function uploadFirmware(file, onProgress, onSuccess, onFailure) {
    const formData = BuildFileUploadFormData("/", [file]);
    SendFileHttp(httpCmd.fwUpdate, formData, onProgress, onSuccess, onFailure);
}

/** Upload a file to the ESP32 local filesystem */
function uploadFileToFS(file, onProgress, onSuccess, onFailure) {
    const formData = BuildFileUploadFormData("/", [file]);
    SendFileHttp(httpCmd.files, formData, onProgress, onSuccess, onFailure);
}

/** Install the update: download firmware.bin and/or index.html.gz, then upload them */
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

function startInstallUpdate(response) {
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

    // Chain: download+upload firmware, then download+upload UI
    const steps = [];
    if (fwAsset) steps.push({ asset: fwAsset, label: "firmware.bin", type: "firmware" });
    if (uiAsset) steps.push({ asset: uiAsset, label: "index.html.gz", type: "ui" });

    processNextUpdateStep(steps, 0);
}

function processNextUpdateStep(steps, idx) {
    if (idx >= steps.length) {
        // All done — reboot
        finishInstallUpdate();
        return;
    }

    const step = steps[idx];
    setHTML("checkupdates_step", `${translate_text_item("Downloading")} ${step.label}...`);
    setProgress(0);

    downloadAsset(step.asset.browser_download_url, (loaded, total) => {
        setProgress(Math.round((loaded / total) * 50)); // download = 0-50%
    })
        .then(blob => {
            const file = new File([blob], step.label);
            setHTML("checkupdates_step", `${translate_text_item("Uploading")} ${step.label}...`);
            setProgress(50);

            const onProgress = (evt) => {
                if (evt.lengthComputable) {
                    const pct = 50 + Math.round((evt.loaded / evt.total) * 50);
                    setProgress(pct);
                }
            };

            const onSuccess = () => {
                setProgress(100);
                processNextUpdateStep(steps, idx + 1);
            };

            const onFailure = (error_code, response) => {
                checkUpdates_ongoing = false;
                restorePingAfterUpload();
                displayBlock("checkUpdatesDlgCheck");
                setHTML(
                    "checkupdates_status",
                    `<span style="color:red;">${translate_text_item("Upload failed:")} ${step.label}</span>`
                );
                console.error("Update upload failed:", error_code, response);
            };

            if (step.type === "firmware") {
                uploadFirmware(file, onProgress, onSuccess, onFailure);
            } else {
                uploadFileToFS(file, onProgress, onSuccess, onFailure);
            }
        })
        .catch(err => {
            checkUpdates_ongoing = false;
            restorePingAfterUpload();
            displayBlock("checkUpdatesDlgCheck");
            setHTML(
                "checkupdates_status",
                `<span style="color:red;">${translate_text_item("Download failed:")} ${step.label}: ${err.message}</span>`
            );
            console.error("Update download failed:", err);
        });
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
