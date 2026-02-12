# Captive Portal URL Response Verification

This document traces each captive portal detection URL to verify it returns the correct HTTP response when the Maslow CNC operates in AP mode.

## Overview

When devices connect to the Maslow's WiFi Access Point, they automatically check specific URLs to determine if internet access is available. If these URLs don't respond correctly, the device treats the network as a "captive portal" (like hotel/airport WiFi requiring login), which triggers:
- Limited browser functionality
- Automatic disconnection after timeout
- Poor user experience

By responding to these URLs with the expected content, we "trick" devices into thinking they have full internet access, allowing normal web browsing of the Maslow's interface.

## URL Tracing and Verification

### Android / Chrome / Chromium / Brave

#### 1. `http://connectivitycheck.gstatic.com/generate_204`
- **Path**: `/generate_204`
- **Handler**: `handle_generate_204()`
- **Response**: HTTP 204 No Content (empty body)
- **Code**: `_webserver->send(204, "text/plain", "");`
- **Status**: ✅ CORRECT

#### 2. `http://clients3.google.com/gen_204`
- **Path**: `/gen_204`
- **Handler**: `handle_generate_204()`
- **Response**: HTTP 204 No Content (empty body)
- **Code**: `_webserver->send(204, "text/plain", "");`
- **Status**: ✅ CORRECT

#### 3. `http://clients3.google.com/generate_204`
- **Path**: `/generate_204`
- **Handler**: `handle_generate_204()`
- **Response**: HTTP 204 No Content (empty body)
- **Code**: `_webserver->send(204, "text/plain", "");`
- **Status**: ✅ CORRECT

### iOS / macOS (Apple)

#### 4. `http://captive.apple.com/hotspot-detect.html`
- **Path**: `/hotspot-detect.html`
- **Handler**: `handle_hotspot_detect()`
- **Response**: HTTP 200 OK with HTML containing "Success"
- **Code**: `_webserver->send(200, "text/html", "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>");`
- **Status**: ✅ CORRECT

#### 5. `http://www.apple.com/library/test/success.html`
- **Path**: `/library/test/success.html`
- **Handler**: `handle_hotspot_detect()`
- **Response**: HTTP 200 OK with HTML containing "Success"
- **Code**: `_webserver->send(200, "text/html", "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>");`
- **Status**: ✅ CORRECT

#### 6. Legacy Apple URLs (iOS 6.x and earlier)
- **URLs**: `http://www.apple.com/`, `http://www.appleiphonecell.com/`, `http://captive.apple.com/`, `http://www.itools.info/`, `http://www.ibook.info/`, `http://www.airport.us/`, `http://www.thinkdifferent.us/`
- **Handler**: DNS redirects to ESP32 IP → `handle_not_found()` → `sendCaptivePortal()`
- **Response**: HTTP 200 OK with HTML (captive portal redirect page)
- **Status**: ✅ CORRECT (200 with HTML is acceptable for legacy devices)

### Windows (Microsoft)

#### 7. `http://www.msftconnecttest.com/connecttest.txt`
- **Path**: `/connecttest.txt`
- **Handler**: `handle_connecttest()`
- **Response**: HTTP 200 OK with text "Microsoft Connect Test"
- **Code**: `_webserver->send(200, "text/plain", "Microsoft Connect Test");`
- **Status**: ✅ CORRECT

#### 8. `http://www.msftncsi.com/ncsi.txt`
- **Path**: `/ncsi.txt`
- **Handler**: `handle_ncsi()`
- **Response**: HTTP 200 OK with text "Microsoft NCSI"
- **Code**: `_webserver->send(200, "text/plain", "Microsoft NCSI");`
- **Status**: ✅ CORRECT

#### 9. `http://edge-http.microsoft.com/captiveportal/generate_204`
- **Path**: `/generate_204`
- **Handler**: `handle_generate_204()`
- **Response**: HTTP 204 No Content (empty body)
- **Code**: `_webserver->send(204, "text/plain", "");`
- **Status**: ✅ CORRECT

#### 10. `http://www.msftconnecttest.com/fwlink/`
- **Path**: `/fwlink/`
- **Handler**: `handle_root()`
- **Response**: HTTP 200 OK with HTML (index.html or PAGE_NOFILES)
- **Status**: ✅ CORRECT (redirect URL, 200 with HTML acceptable)

#### 11. `http://www.msftconnecttest.com/fwlink`
- **Path**: `/fwlink`
- **Handler**: `handle_root()`
- **Response**: HTTP 200 OK with HTML (index.html or PAGE_NOFILES)
- **Status**: ✅ CORRECT (redirect URL, 200 with HTML acceptable)

#### 12. `http://www.msftconnecttest.com/redirect`
- **Path**: `/redirect`
- **Handler**: `handle_root()`
- **Response**: HTTP 200 OK with HTML (index.html or PAGE_NOFILES)
- **Status**: ✅ CORRECT (redirect URL, 200 with HTML acceptable)

### Firefox (Mozilla)

#### 13. `http://detectportal.firefox.com/canonical.html`
- **Path**: `/canonical.html`
- **Handler**: `handle_firefox_detect()`
- **Response**: HTTP 200 OK with minimal HTML (meta refresh to /success.txt)
- **Code**: `_webserver->send(200, "text/html", "<HTML><HEAD><META HTTP-EQUIV=\"REFRESH\" CONTENT=\"0;URL=/success.txt\"></HEAD><BODY></BODY></HTML>");`
- **Status**: ✅ CORRECT

#### 14. `http://detectportal.firefox.com/success.txt`
- **Path**: `/success.txt`
- **Handler**: `handle_success()`
- **Response**: HTTP 200 OK with text "success"
- **Code**: `_webserver->send(200, "text/plain", "success");`
- **Status**: ✅ CORRECT

### Linux (GNOME NetworkManager)

#### 15. `http://nmcheck.gnome.org/check_network_status.txt`
- **Path**: `/check_network_status.txt`
- **Handler**: `handle_nm_check()`
- **Response**: HTTP 200 OK with text "NetworkManager is online"
- **Code**: `_webserver->send(200, "text/plain", "NetworkManager is online");`
- **Status**: ✅ CORRECT

### Linux (KDE Plasma)

#### 16. `http://networkcheck.kde.org/` (any path)
- **Detection**: Host header equals `networkcheck.kde.org`
- **Handler**: `handle_root()` → checks Host header → `handle_kde_ok()`
- **Response**: HTTP 200 OK with text "OK"
- **Code**: `_webserver->send(200, "text/plain", "OK");`
- **Status**: ✅ CORRECT

### Linux (Ubuntu)

#### 17. `http://connectivity-check.ubuntu.com/` (any path)
- **Detection**: Host header equals `connectivity-check.ubuntu.com` or `connectivity-check.ubuntu.com.`
- **Handler**: `handle_root()` → checks Host header → `handle_generate_204()`
- **Response**: HTTP 204 No Content (empty body)
- **Code**: `_webserver->send(204, "text/plain", "");`
- **Status**: ✅ CORRECT

### Amazon Kindle and Fire Devices

#### 18. `http://spectrum.s3.amazonaws.com/kindle-wifi/wifistub.html`
- **Path**: `/kindle-wifi/wifistub.html`
- **Handler**: `handle_hotspot_detect()`
- **Response**: HTTP 200 OK with HTML containing "Success"
- **Code**: `_webserver->send(200, "text/html", "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>");`
- **Note**: Kindle accepts the same simple "Success" HTML structure as Apple devices
- **Status**: ✅ CORRECT

### Legacy and Other Devices

#### 19. `http://*/mobile/status.php` (various hosts)
- **Path**: `/mobile/status.php`
- **Handler**: `handle_success()`
- **Response**: HTTP 200 OK with text "success"
- **Code**: `_webserver->send(200, "text/plain", "success");`
- **Status**: ✅ CORRECT

## Response Type Summary

### HTTP 204 No Content
Used by Android, Chrome, Chromium, Brave, Windows 10 (alternative), and Ubuntu.

**Handler**: `handle_generate_204()`
- `/generate_204`
- `/gen_204`
- Host: `connectivity-check.ubuntu.com`

### HTTP 200 with HTML "Success"
Used by iOS, macOS, and Kindle devices.

**Handler**: `handle_hotspot_detect()`
- `/hotspot-detect.html`
- `/library/test/success.html`
- `/kindle-wifi/wifistub.html`

### HTTP 200 with Platform-Specific Text

**Windows (current)**: `handle_connecttest()`
- `/connecttest.txt` → "Microsoft Connect Test"

**Windows (legacy)**: `handle_ncsi()`
- `/ncsi.txt` → "Microsoft NCSI"

**Firefox**: `handle_success()`
- `/success.txt` → "success"
- `/mobile/status.php` → "success"

**Linux GNOME**: `handle_nm_check()`
- `/check_network_status.txt` → "NetworkManager is online"

**Linux KDE**: `handle_kde_ok()`
- Host: `networkcheck.kde.org` → "OK"

### HTTP 200 with HTML Pages
Used for Microsoft redirect URLs and legacy Apple URLs.

**Handler**: `handle_root()` or `sendCaptivePortal()`
- `/fwlink`, `/fwlink/`, `/redirect`
- Legacy Apple URLs (via DNS redirect)

## DNS Redirection

The Maslow's DNS server is configured with wildcard redirection (`"*"`), meaning:
1. All domain names resolve to the ESP32's IP address
2. Clients request URLs like `http://captive.apple.com/hotspot-detect.html`
3. DNS resolves `captive.apple.com` to the ESP32's IP
4. WebServer receives request with path `/hotspot-detect.html` and Host header `captive.apple.com`
5. Path-based routing handles the request

## Implementation Details

### File Locations
- **Implementation**: `firmware/FluidNC/src/WebUI/WebServer.cpp`
- **Declarations**: `firmware/FluidNC/src/WebUI/WebServer.h`

### Route Registration
All routes are registered in `Web_Server::begin()` when `WiFi.getMode() == WIFI_AP`.

### Handler Functions
Each handler is a static member function of the `Web_Server` class that:
1. Receives the HTTP request via `_webserver`
2. Sends the appropriate response using `_webserver->send()`
3. Returns control to the WebServer

### Host Header Detection
Special handling in `handle_root()` checks the HTTP Host header for:
- KDE Plasma: `networkcheck.kde.org`
- Ubuntu: `connectivity-check.ubuntu.com` or `connectivity-check.ubuntu.com.`

## Verification Result

✅ **ALL CAPTIVE PORTAL DETECTION URLs RETURN CORRECT RESPONSES**

All 19 documented captive portal detection URLs/patterns have been verified to return the appropriate HTTP response codes and content that indicate the network has full internet access (even though it's a local AP without internet).

This prevents devices from:
- Showing captive portal login prompts
- Opening limited browsers
- Disconnecting after timeout
- Restricting network functionality
