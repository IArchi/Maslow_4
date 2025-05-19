//setup dialog

var active_wizard_page = 0;
var maz_page_wizard = 5;

const td = (value) => `<td>${value}</td>`;
const table = (value) => `<table><tr>${value}</tr></table>`;
const heading = (label) => `<h4>${translate_text_item(label)}</h4><hr>`;

const item = (label, pos, actions, extra) => {
    const sclIndex = get_index_from_eeprom_pos(pos);
    if (!scl[sclIndex]) {
        return "";
    }
    if (typeof extra === "function") {
        scl[sclIndex].extra = extra;
    }
    return `${translate_text_item(label)}${table(build_control_from_index(sclIndex, actions))}`;
}

function wizardDone(element) {
    id(element).className = id(element).className.replace(" wizard_done", "");
}
function disableStep(wizard, step) {
    id(wizard).style.background = "#e0e0e0";
    id(step).disabled = true;
    id(step).className = "steplinks disabled";
    wizardDone(step);
}
function openStep(wizard, step) {
    id(wizard).style.background = "#337AB7";
    id(step).disabled = "";
    id(step).className = id(step).className.replace(" disabled", "");
}
function closeStep(step) {
    if (id(step).className.indexOf(" wizard_done") === -1) {
        id(step).className += " wizard_done";
        if (!can_revert_wizard) id(step).className += " no_revert_wizard";
    }
}

const spacer = () => "<hr>\n";
const div = (name) => `<div id='${name}'>`;
const endDiv = () => "</div>";

function setupdlg() {
    setup_is_done = false;
    language_save = language;
    displayNone('main_ui');
    setHTML('settings_list_data', "");
    active_wizard_page = 0;

    wizardDone("startsteplink");

    setHTML("wizard_button", translate_text_item("Start setup"));

    disableStep("wizard_line1", "step1link");
    disableStep("wizard_line2", "step2link");
    disableStep("wizard_line3", "step3link");

    displayNone("step3link");
    displayNone("wizard_line4")
    disableStep("wizard_line4", "endsteplink");

    const content = table( td(`${get_icon_svg("flag")}&nbsp;`) + td(build_language_list("language_selection")));
    setHTML("setup_langage_list", content);

    const modal = setactiveModal('setupdlg.html', setupdone);
    if (modal == null) {
        return;
    }
    showModal();
    id("startsteplink", true).click();
}


function setupdone(response) {
    setup_is_done = true;
    do_not_build_settings = false;
    build_HTML_setting_list(current_setting_filter);
    translate_text(language_save);
    displayUndoNone('main_ui');
    closeModal("setup done");
}

function continue_setup_wizard() {
    active_wizard_page++;
    switch (active_wizard_page) {
        case 1:
            enablestep1();
            preferenceslist[0].language = language;
            SavePreferences(true);
            language_save = language;
            break;
        case 2:
            enablestep2();
            break;
        case 3:
            active_wizard_page++;
            id("wizard_line3").style.background = "#337AB7";
            enablestep4();
            break;
        case 4:
            enablestep4();
            break;
        case 5:
            closeModal('ok')
            break;
        default:
            console.log("wizard page out of range");
    }
}

const AddActionHandlers = (actions) => {
	for (const action of actions) {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", action.method);
		}
	}
}

function enablestep1() {
    closeStep("startsteplink")
    setHTML("wizard_button", translate_text_item("Continue"));
    openStep("wizard_line1", "step1link");

    const actions = [];
    const content = [
        heading("FluidNC Settings"),
        item("Define ESP name:", EP_HOSTNAME, actions)
    ];

    setHTML("step1", content.join(""));
    AddActionHandlers(actions);
    id("step1link").click();
}

function enablestep2() {
    closeStep("step1link");
    openStep("wizard_line2", "step2link");

    const actions = [];
    const content = [
        heading("WiFi Configuration"),
        item("Define ESP role:", EP_WIFI_MODE, actions, define_esp_role),
        translate_text_item("AP define access point / STA allows to join existing network"),
        "<br/>",
        spacer(),
        div("setup_STA"),
        item("What access point ESP need to be connected to:", EP_STA_SSID, actions),
        translate_text_item("You can use scan button, to list available access points."),
        "<br/>",
        spacer(),
        item("Password to join access point:", EP_STA_PASSWORD, actions),
        endDiv(),
        div("setup_AP"),
        item("What is ESP access point SSID:", EP_AP_SSID, actions),
        spacer(),
        item("Password for access point:", EP_AP_PASSWORD, actions),
        endDiv()
    ];

    setHTML("step2", content.join(""));
    AddActionHandlers(actions);
    define_esp_role_from_pos(EP_WIFI_MODE);
    id("step2link").click();
}

function define_sd_role(index) {
    if (setting_configList[index].defaultvalue === 1) {
        displayBlock("setup_SD");
        displayNone("setup_primary_SD");;
    } else {
        displayNone("setup_SD");
        displayNone("setup_primary_SD");
    }
}

function enablestep3() {
    closeStep("step2link");
    openStep("wizard_line3", "step3link");

    const actions = [];
    const content = [
        heading("SD Card Configuration"),
        item("Is ESP connected to SD card:", EP_IS_DIRECT_SD, actions, define_sd_role),
        spacer(),
        div("setup_SD"),
        item("Check update using direct SD access:", EP_DIRECT_SD_CHECK, actions),
        spacer(),
        div("setup_primary_SD"),
        item("SD card connected to ESP", EP_PRIMARY_SD, actions),
        spacer(),
        item("SD card connected to printer", EP_SECONDARY_SD, actions),
        spacer(),
        endDiv(),
        endDiv()
    ];

    setHTML("step3", content.join(""));
    AddActionHandlers(actions);
    define_sd_role(get_index_from_eeprom_pos(EP_IS_DIRECT_SD));
    id("step3link").click();
}

function enablestep4() {
    closeStep("step3link");
    setHTML("wizard_button", translate_text_item("Close"));
    openStep("wizard_line4", "endsteplink");
    id("endsteplink").click();
}
