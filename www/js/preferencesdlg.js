//Preferences dialog
var preferenceslist = [];
var language_save = language;

var preferences_file_name = '/preferences.json';

function initpreferences() {
    displayNone('DHT_pref_panel');
    displayBlock('grbl_pref_panel');
    displayTable('has_tft_sd');
    displayTable('has_tft_usb');
}

function getpreferenceslist() {
    preferenceslist = [];
    //removeIf(production)
    var response = JSON.stringify(default_preferenceslist);
    processPreferencesGetSuccess(response);
    return;
    //endRemoveIf(production)
    const cmd = buildHttpFileGetCmd(preferences_file_name);
    SendGetHttp(cmd, processPreferencesGetSuccess, processPreferencesGetFailed);
}

function prefs_toggledisplay(id_source) {
    switch (id_source) {
        case "show_files_panel":
            displayBlockOrNone("files_preferences", getChecked(id_source) === "true");
            break;
        case "show_grbl_panel":
            displayBlockOrNone("grbl_preferences", getChecked(id_source) === "true");
            break;
        case "show_camera_panel":
            displayBlockOrNone("camera_preferences", getChecked(id_source) === "true");
            break;
        case "show_control_panel":
            displayBlockOrNone("control_preferences", getChecked(id_source) === "true");
            break;
        case "show_commands_panel":
            displayBlockOrNone("cmd_preferences", getChecked(id_source) === "true");
            break;
        case "show_grbl_probe_tab":
            displayBlockOrNone("grbl_probe_preferences", getChecked(id_source) === "true");
            break;
    }
}

function processPreferencesGetSuccess(response) {
    Preferences_build_list(response);
}

function processPreferencesGetFailed(error_code, response) {
    conErr(error_code, response);
    Preferences_build_list("");
}

function Preferences_build_list(response_text) {
    preferenceslist = [];
    try {
        const prefTest = response_text ? response_text : JSON.stringify(default_preferenceslist)
        preferenceslist = JSON.parse(prefTest);
    } catch (e) {
        console.error("Preferences parsing error:", e);
        preferenceslist = default_preferenceslist;
    }
    applypreferenceslist();
}

function ontogglePing(forcevalue) {
    if (typeof forcevalue !== 'undefined') enable_ping = forcevalue
    else enable_ping = !enable_ping
    if (enable_ping) {
        if (interval_ping !== -1) clearInterval(interval_ping)
        last_ping = Date.now()
        interval_ping = setInterval(() => { check_ping() }, 10 * 1000)
        console.log('enable ping')
    } else {
        if (interval_ping !== -1) clearInterval(interval_ping)
        console.log('disable ping')
    }
}

/** Apply the preferences we have to the dialog */
function applypreferenceslist() {
    //Assign each control state
    translate_text(preferenceslist[0].language);
    build_HTML_setting_list(current_setting_filter);
    if (id('camtab')) {
        let camoutput = false;
        if (typeof (preferenceslist[0].enable_camera) !== 'undefined') {
            if (preferenceslist[0].enable_camera === 'true') {
                displayBlock('camtablink');
                camera_GetAddress();
                if (typeof (preferenceslist[0].auto_load_camera) !== 'undefined') {
                    if (preferenceslist[0].auto_load_camera === 'true') {
                        // const saddress = getValue('camera_webaddress');
                        camera_loadframe();
                        camoutput = true;
                    }
                }
            } else {
                id("tablettablink").click();
                displayNone('camtablink');
            }
        } else {
            id("tablettablink").click();
            displayNone('camtablink');
        }
        if (!camoutput) {
            id('camera_frame').src = "";
            displayNone('camera_frame_display');
            displayNone('camera_detach_button');
        }
    }
    if (preferenceslist[0].enable_grbl_probe_panel === 'true') {
        displayBlock('grblprobetablink');
    } else {
        id("grblcontroltablink").click();
        displayNone('grblprobetablink');
    }

    if (preferenceslist[0].enable_DHT === 'true') {
        displayBlock('DHT_humidity');
        displayBlock('DHT_temperature');
    } else {
        displayNone('DHT_humidity');
        displayNone('DHT_temperature');
    }
    if (preferenceslist[0].enable_lock_UI === 'true') {
        displayBlock('lock_ui_btn');
        ontoggleLock(true);
    } else {
        displayNone('lock_ui_btn');
        ontoggleLock(false);
    }
    if (preferenceslist[0].enable_ping === 'true') {
        ontogglePing(true);
    } else {
        ontogglePing(false);
    }

    if (preferenceslist[0].enable_grbl_panel === 'true') displayFlex('grblPanel');
    else {
        displayNone('grblPanel');
        reportNone(false);
    }

    if (preferenceslist[0].enable_control_panel === 'true') displayFlex('controlPanel');
    else {
        displayNone('controlPanel');
        on_autocheck_position(false);
    }
    setCheckedDefault("monitor_enable_verbose_mode", preferenceslist[0]?.enable_verbose_mode);
    if (preferenceslist[0].enable_verbose_mode === 'true') {
        Monitor_check_verbose_mode();
    }

    if (preferenceslist[0].enable_files_panel === 'true') displayFlex('filesPanel');
    else displayNone('filesPanel');

    if (preferenceslist[0].has_TFT_SD === 'true') {
        displayFlex('files_refresh_tft_sd_btn');
    } else {
        displayNone('files_refresh_tft_sd_btn');
    }

    if (preferenceslist[0].has_TFT_USB === 'true') {
        displayFlex('files_refresh_tft_usb_btn');
    } else {
        displayNone('files_refresh_tft_usb_btn');
    }

    if ((preferenceslist[0].has_TFT_SD === 'true') || (preferenceslist[0].has_TFT_USB === 'true')) {
        displayFlex('files_refresh_printer_sd_btn');
        displayNone('files_refresh_btn');
    } else {
        displayNone('files_refresh_printer_sd_btn');
        displayFlex('files_refresh_btn');
    }

    if (preferenceslist[0].enable_commands_panel === 'true') {
        displayFlex('commandsPanel');
        setCheckedDefault("monitor_enable_autoscroll", preferenceslist[0]?.enable_autoscroll);
        if (preferenceslist[0].enable_autoscroll === 'true') {
            Monitor_check_autoscroll();
        }
    } else displayNone('commandsPanel');

    const autoReportValue = Number.parseInt(preferenceslist[0].autoreport_interval);
    const autoReportChanged = getValue("preferences_autoReport_Interval") !== autoReportValue;
    if (autoReportChanged) {
        setValue("preferences_autoReport_Interval", autoReportValue);
    }
    const statusIntervalValue = Number.parseInt(preferenceslist[0].interval_status);
    statusIntervalChanged = getValue('preferences_status_Interval_check') !== statusIntervalValue;
    if (statusIntervalChanged) {
        setValue('preferences_status_Interval_check', statusIntervalValue);
    }
    if (autoReportChanged || statusIntervalChanged) {
        onAutoReportIntervalChange();
    }

    setValue('preferences_pos_Interval_check', Number.parseInt(preferenceslist[0].interval_positions));
    setValue('preferences_control_xy_velocity', Number.parseFloat(preferenceslist[0].xy_feedrate));
    setValue('preferences_control_z_velocity', Number.parseFloat(preferenceslist[0].z_feedrate));

    if (grblaxis > 2) axis_Z_feedrate = Number.parseFloat(preferenceslist[0].z_feedrate);
    if (grblaxis > 3) axis_A_feedrate = Number.parseFloat(preferenceslist[0].a_feedrate);
    if (grblaxis > 4) axis_B_feedrate = Number.parseFloat(preferenceslist[0].b_feedrate);
    if (grblaxis > 5) axis_C_feedrate = Number.parseFloat(preferenceslist[0].c_feedrate);

    if (grblaxis > 3) {
        const letter = id('control_select_axis').value;
        switch (letter) {
            case "Z":
                id('preferences_control_z_velocity').value = axis_Z_feedrate;
                break;
            case "A":
                id('preferences_control_a_velocity').value = axis_A_feedrate;
                break;
            case "B":
                id('preferences_control_b_velocity').value = axis_B_feedrate;
                break;
            case "C":
                id('preferences_control_c_velocity').value = axis_C_feedrate;
                break;
        }
    }

    id('preferences_probemaxtravel').value = Number.parseFloat(preferenceslist[0].probemaxtravel);
    id('preferences_probefeedrate').value = Number.parseFloat(preferenceslist[0].probefeedrate);
    id('preferences_proberetract').value = Number.parseFloat(preferenceslist[0].proberetract);
    id('preferences_probetouchplatethickness').value = Number.parseFloat(preferenceslist[0].probetouchplatethickness);
    build_file_filter_list(preferenceslist[0].f_filters);
}

function showpreferencesdlg() {
    const modal = setactiveModal('preferencesdlg.html');
    if (modal == null) return;
    language_save = language;
    build_dlg_preferences_list();
    displayNone('preferencesdlg_upload_msg');
    showModal();
}

/** use preferenceslist to set dlg status */
function build_dlg_preferences_list() {
    let content = "<table><tr><td>";
    content += `${get_icon_svg("flag")}&nbsp;</td><td>`;
    content += build_language_list("language_preferences");
    content += "</td></tr></table>";
    setHTML("preferences_langage_list", content);
    //camera
    setCheckedDefault("show_camera_panel", preferenceslist[0]?.enable_camera);
    //autoload camera
    setCheckedDefault("autoload_camera_panel", preferenceslist[0]?.auto_load_camera);
    //camera address
    setValue('preferences_camera_webaddress', (typeof (preferenceslist[0].camera_address) !== 'undefined')? HTMLDecode(preferenceslist[0].camera_address) : "");
    //DHT
    setCheckedDefault("enable_DHT", preferenceslist[0]?.enable_DHT);
    //lock UI
    setCheckedDefault("enable_lock_UI", preferenceslist[0]?.enable_lock_UI);
    //Monitor connection
    setCheckedDefault("enable_ping", preferenceslist[0]?.enable_ping);

    //grbl panel
    setCheckedDefault("show_grbl_panel", preferenceslist[0]?.enable_grbl_panel);
    //grbl probe panel
    setCheckedDefault("show_grbl_probe_tab", preferenceslist[0]?.enable_grbl_probe_panel);
    //control panel
    setCheckedDefault("show_control_panel", preferenceslist[0]?.enable_control_panel);
    //files panel
    setCheckedDefault("show_files_panel", preferenceslist[0]?.enable_files_panel);
    //TFT SD
    setCheckedDefault("has_tft_sd", preferenceslist[0]?.has_TFT_SD);

    //TFT USB
    setCheckedDefault("has_tft_usb", preferenceslist[0]?.has_TFT_USB);
    //commands
    setCheckedDefault("show_commands_panel", preferenceslist[0]?.enable_commands_panel);
    //autoreport interval
    if (typeof (preferenceslist[0].autoreport_interval) !== 'undefined') {
        id('preferences_autoReport_Interval').value = Number.parseInt(preferenceslist[0].autoreport_interval);
    } else id('preferences_autoReport_Interval').value = Number.parseInt(default_preferenceslist[0].autoreport_interval);
    //interval positions
    if (typeof (preferenceslist[0].interval_positions) !== 'undefined') {
        id('preferences_pos_Interval_check').value = Number.parseInt(preferenceslist[0].interval_positions);
    } else id('preferences_pos_Interval_check').value = Number.parseInt(default_preferenceslist[0].interval_positions);
    //interval status
    if (typeof (preferenceslist[0].interval_status) !== 'undefined') {
        id('preferences_status_Interval_check').value = Number.parseInt(preferenceslist[0].interval_status);
    } else id('preferences_status_Interval_check').value = Number.parseInt(default_preferenceslist[0].interval_status);
    //xy feedrate
    if (typeof (preferenceslist[0].xy_feedrate) !== 'undefined') {
        id('preferences_control_xy_velocity').value = Number.parseFloat(preferenceslist[0].xy_feedrate);
    } else id('preferences_control_xy_velocity').value = Number.parseFloat(default_preferenceslist[0].xy_feedrate);
    if (grblaxis > 2) {
        //z feedrate
        if (typeof (preferenceslist[0].z_feedrate) !== 'undefined') {
            id('preferences_control_z_velocity').value = Number.parseFloat(preferenceslist[0].z_feedrate);
        } else id('preferences_control_z_velocity').value = Number.parseFloat(default_preferenceslist[0].z_feedrate);
    }
    if (grblaxis > 3) {
        //a feedrate
        if (typeof (preferenceslist[0].a_feedrate) !== 'undefined') {
            id('preferences_control_a_velocity').value = Number.parseFloat(preferenceslist[0].a_feedrate);
        } else id('preferences_control_a_velocity').value = Number.parseFloat(default_preferenceslist[0].a_feedrate);
    }
    if (grblaxis > 4) {
        //b feedrate
        if (typeof (preferenceslist[0].b_feedrate) !== 'undefined') {
            id('preferences_control_b_velocity').value = Number.parseFloat(preferenceslist[0].b_feedrate);
        } else id('preferences_control_b_velocity').value = Number.parseFloat(default_preferenceslist[0].b_feedrate);
    }
    if (grblaxis > 5) {
        //c feedrate
        if (typeof (preferenceslist[0].c_feedrate) !== 'undefined') {
            id('preferences_control_c_velocity').value = Number.parseFloat(preferenceslist[0].c_feedrate);
        } else id('preferences_control_c_velocity').value = Number.parseFloat(default_preferenceslist[0].c_feedrate);
    }

    //probemaxtravel
    if ((typeof (preferenceslist[0].probemaxtravel) !== 'undefined') && (preferenceslist[0].probemaxtravel.length !== 0)) {
        id('preferences_probemaxtravel').value = Number.parseFloat(preferenceslist[0].probemaxtravel);
    } else {
        id('preferences_probemaxtravel').value = Number.parseFloat(default_preferenceslist[0].probemaxtravel);
    }
    //probefeedrate
    if ((typeof (preferenceslist[0].probefeedrate) !== 'undefined') && (preferenceslist[0].probefeedrate.length !== 0)) {
        id('preferences_probefeedrate').value = Number.parseFloat(preferenceslist[0].probefeedrate);
    } else id('preferences_probefeedrate').value = Number.parseFloat(default_preferenceslist[0].probefeedrate);
    //proberetract
    if ((typeof (preferenceslist[0].proberetract) !== 'undefined') && (preferenceslist[0].proberetract.length !== 0)) {
        id('preferences_proberetract').value = Number.parseFloat(preferenceslist[0].proberetract);
    } else id('preferences_proberetract').value = Number.parseFloat(default_preferenceslist[0].proberetract);
    //probetouchplatethickness
    if ((typeof (preferenceslist[0].probetouchplatethickness) !== 'undefined') && (preferenceslist[0].probetouchplatethickness.length !== 0)) {
        id('preferences_probetouchplatethickness').value = Number.parseFloat(preferenceslist[0].probetouchplatethickness);
    } else id('preferences_probetouchplatethickness').value = Number.parseFloat(default_preferenceslist[0].probetouchplatethickness);
    //autoscroll
    setCheckedDefault("preferences_autoscroll", preferenceslist[0]?.enable_autoscroll);
    //Verbose Mode
    setCheckedDefault("preferences_verbose_mode", preferenceslist[0]?.enable_verbose_mode);
    //file filters
    if (typeof (preferenceslist[0].f_filters) !== 'undefined') {
        console.log("Use prefs filters");
        id('preferences_filters').value = preferenceslist[0].f_filters;
    } else {
        console.log("Use default filters");
        id('preferences_filters').value = String(default_preferenceslist[0].f_filters);
    }

    prefs_toggledisplay('show_camera_panel');
    prefs_toggledisplay('show_grbl_panel');
    prefs_toggledisplay('show_control_panel');
    prefs_toggledisplay('show_commands_panel');
    prefs_toggledisplay('show_files_panel');
    prefs_toggledisplay('show_grbl_probe_tab');
}

function closePreferencesDialog() {
    const modified = PreferencesModified() || language_save !== language;

    if (modified) {
        confirmdlg(translate_text_item("Data mofified"), translate_text_item("Do you want to save?"), process_preferencesCloseDialog)
    } else {
        closeModal('cancel');
    }
}

function process_preferencesCloseDialog(answer) {
    if (answer == 'no') {
        //console.log("Answer is no so exit");
        translate_text(language_save);
        closeModal('cancel');
    } else {
        // console.log("Answer is yes so let's save");
        SavePreferences();
    }
}

function SavePreferences(current_preferences) {
    if (CheckForHttpCommLock()) {
        return;
    }

    console.log("save prefs");
    if (((typeof (current_preferences) !== 'undefined') && !current_preferences) || (typeof (current_preferences) == 'undefined')) {
        if (!Checkvalues("preferences_autoReport_Interval") ||
            !Checkvalues("preferences_pos_Interval_check") ||
            !Checkvalues("preferences_status_Interval_check") ||
            !Checkvalues("preferences_control_xy_velocity") ||
            !Checkvalues("preferences_filters") ||
            !Checkvalues("preferences_probemaxtravel") ||
            !Checkvalues("preferences_probefeedrate") ||
            !Checkvalues("preferences_proberetract") ||
            !Checkvalues("preferences_probetouchplatethickness")
        ) return;
        if (grblaxis > 2) {
            if (!Checkvalues("preferences_control_z_velocity")) return;
        }
        if ((grblaxis > 3) && (!Checkvalues("preferences_control_a_velocity"))) return;
        if ((grblaxis > 4) && (!Checkvalues("preferences_control_b_velocity"))) return;
        if ((grblaxis > 5) && (!Checkvalues("preferences_control_c_velocity"))) return;

        preferenceslist = [];
        let saveprefs = [`[{"language":"${language}"`];
        saveprefs.push(`"enable_lock_UI":"${getChecked('enable_lock_UI')}"`);
        saveprefs.push(`"enable_ping":"${getChecked('enable_ping')}"`);
        saveprefs.push(`"enable_DHT":"${getChecked('enable_DHT')}"`);

        saveprefs.push(`"enable_camera":"${getChecked('show_camera_panel')}"`);
        saveprefs.push(`"auto_load_camera":"${getChecked('autoload_camera_panel')}"`);
        saveprefs.push(`"camera_address":"${HTMLEncode(getValue('preferences_camera_webaddress') || "")}"`);

        saveprefs.push(`"enable_control_panel":"${getChecked('show_control_panel')}"`);
        saveprefs.push(`"interval_positions":"${getValue('preferences_pos_Interval_check') || ""}"`);
        saveprefs.push(`"xy_feedrate":"${getValue('preferences_control_xy_velocity') || ""}"`);
        if (grblaxis > 2) {
            saveprefs.push(`"z_feedrate":"${getValue('preferences_control_z_velocity') || ""}"`);
        }
        if (grblaxis > 3) {
            saveprefs.push(`"a_feedrate":"${getValue('preferences_control_a_velocity') || ""}"`);
        }
        if (grblaxis > 4) {
            saveprefs.push(`"b_feedrate":"${getValue('preferences_control_b_velocity') || ""}"`);
        }
        if (grblaxis > 5) {
            saveprefs.push(`"c_feedrate":"${getValue('preferences_control_c_velocity') || ""}"`);
        }

        saveprefs.push(`"enable_grbl_panel":"${getChecked('show_grbl_panel')}"`);
        saveprefs.push(`"autoreport_interval":"${getValue('preferences_autoReport_Interval') || ""}"`);
        saveprefs.push(`"interval_status":"${getValue('preferences_status_Interval_check') || ""}"`);
        saveprefs.push(`"enable_grbl_probe_panel":"${getChecked('show_grbl_probe_tab')}"`);
        saveprefs.push(`"probemaxtravel":"${getValue('preferences_probemaxtravel') || ""}"`);
        saveprefs.push(`"probefeedrate":"${getValue('preferences_probefeedrate') || ""}"`);
        saveprefs.push(`"probetouchplatethickness":"${getValue('preferences_probetouchplatethickness') || ""}"`);
        saveprefs.push(`"proberetract":"${getValue('preferences_proberetract') || ""}"`);

        saveprefs.push(`"enable_files_panel":"${getChecked('show_files_panel')}"`);
        saveprefs.push(`"has_TFT_SD":"${getChecked('has_tft_sd')}"`);
        saveprefs.push(`"has_TFT_USB":"${getChecked('has_tft_usb')}"`);
        saveprefs.push(`"f_filters":"${getValue('preferences_filters') || ""}"`);

        saveprefs.push(`"enable_commands_panel":"${getChecked('show_commands_panel')}"`);
        saveprefs.push(`"enable_autoscroll":"${getChecked('preferences_autoscroll')}"`);
        saveprefs.push(`"enable_verbose_mode":"${getChecked('preferences_verbose_mode')}"}]`);
        try {
            preferenceslist = JSON.parse(saveprefs.join(","));
        } catch (error) {
            console.error("There was an error preparing the preferences before saving them. The preferences have not been saved. This is probably a programmer error.");
            console.error(error);
            return;
        }
    }

    const file = BuildFormDataFiles(preferences_file_name, [JSON.stringify(preferenceslist, null, " ")], { type: 'application/json' });
    var formData = new FormData();
    formData.append('path', '/');
    formData.append('myfile[]', file, preferences_file_name);
    if ((typeof (current_preferences) != 'undefined') && current_preferences) {
        SendFileHttp(httpCmd.files, formData);
    } else {
        SendFileHttp(httpCmd.files, formData, preferencesdlgUploadProgressDisplay, preferencesUploadsuccess, preferencesUploadfailed);
    }
}

function preferencesdlgUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        setValue('preferencesdlg_prg', percentComplete);
        setHTML('preferencesdlg_upload_percent', percentComplete.toFixed(0));
        displayBlock('preferencesdlg_upload_msg');
    } else {
        // Impossible because size is unknown
    }
}

function preferencesUploadsuccess(response) {
    displayNone('preferencesdlg_upload_msg');
    applypreferenceslist();
    closeModal('ok');
}

function preferencesUploadfailed(error_code, response) {
    alertdlg(translate_text_item("Error"), translate_text_item("Save preferences failed!"));
}


function Checkvalues(id_2_check) {
    let status = true;
    let value = 0;
    switch (id_2_check) {
        case "preferences_autoReport_Interval":
            value = Number.parseInt(id(id_2_check).value);
            if (!(!Number.isNaN(value) && (value === 0 || (value >= 50 && value <= 30000)))) {
                error_message = translate_text_item("Value of auto-report must be 0 or between 50ms and 30000ms !!");
                status = false;
            }
            break;
        case "preferences_status_Interval_check":
            value = Number.parseInt(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0 && value <= 100)) {
                error_message = translate_text_item("Value of auto-check must be between 0s and 99s !!");
                status = false;
            }
            break;
        case "preferences_pos_Interval_check":
            value = Number.parseInt(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 1 && value <= 100)) {
                error_message = translate_text_item("Value of auto-check must be between 0s and 99s !!");
                status = false;
            }
            break;
        case "preferences_control_xy_velocity":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0.00001)) {
                error_message = translate_text_item("XY Feedrate value must be at least 0.00001 mm/min!");
                status = false;
            }
            break;
        case "preferences_control_z_velocity":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0.00001)) {
                error_message = translate_text_item("Z Feedrate value must be at least 0.00001 mm/min!");
                status = false;
            }
            break;
        case "preferences_control_a_velocity":
        case "preferences_control_b_velocity":
        case "preferences_control_c_velocity":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0.00001)) {
                error_message = translate_text_item("Axis Feedrate value must be at least 0.00001 mm/min!");
                status = false;
            }
            break;
        case "preferences_probefeedrate":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0.00001 && value <= 9999)) {
                error_message = translate_text_item("Value of probe feedrate must be between 0.00001 mm/min and 9999 mm/min !");
                status = false;
            }
            break;
        case "preferences_probemaxtravel":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0.00001 && value <= 9999)) {
                error_message = translate_text_item("Value of maximum probe travel must be between 0.00001 mm and 9999 mm !");
                status = false;
            }
            break;
        case "preferences_proberetract":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0 && value <= 9999)) {
                error_message = translate_text_item("Value of probe retract must be between 0 mm and 9999 mm !");
                status = false;
            }
            break;
        case "preferences_probetouchplatethickness":
            value = Number.parseFloat(id(id_2_check).value);
            if (!(!Number.isNaN(value) && value >= 0 && value <= 9999)) {
                error_message = translate_text_item("Value of probe touch plate thickness must be between 0 mm and 9999 mm !");
                status = false;
            }
            break;
        case "preferences_filters":
            //TODO a regex would be better
            value = id(id_2_check).value;
            if ((value.indexOf(".") !== -1) ||
                (value.indexOf("*") !== -1)) {
                error_message = translate_text_item("Only alphanumeric chars separated by ; for extensions filters");
                status = false;
            }
            break;
    }
    if (status) {
        id(`${id_2_check}_group`).classList.remove("has-feedback");
        id(`${id_2_check}_group`).classList.remove("has-error");
        setHTML(`${id_2_check}_icon`, "");
    } else {
        // has-feedback hides the value so it is hard to fix it
        // id(id_2_check + "_group").classList.add("has-feedback");
        id(`${id_2_check}_group`).classList.add("has-error");
        // setHTML(id_2_check + "_icon", get_icon_svg("remove"));
        alertdlg(translate_text_item("Out of range"), error_message);
    }
    return status;
}
