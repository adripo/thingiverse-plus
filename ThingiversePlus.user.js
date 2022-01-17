// ==UserScript==
// @name         Thingiverse Plus
// @namespace    https://thingiverse.com/
// @version      0.7.0
// @description  Thingiverse with extra features
// @author       adripo
// @homepage     https://github.com/adripo/thingiverse-plus
// @icon         https://www.thingiverse.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.meta.js
// @downloadURL  https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.user.js
// @supportURL   https://github.com/adripo/thingiverse-plus/issues
// @match        https://www.thingiverse.com/*
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/src/FileSaver.js
// @require      https://raw.githubusercontent.com/Stuk/jszip/master/dist/jszip.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

//TODO docs for functions
//TODO check emenets that need to waitForKeyElements before executing action
(function () {
    'use strict';

    // Global variables
    let cssHideAdsElement;
    let cssElementsPerPageElement;
    let cssElementsPerPageExtraElement;
    const elNameHideAds = 'hide-ads';
    const elNameAdvancedCollections = 'advanced-collections';
    const elNameElementsPerPage = 'elements-per-page';
    const elNameElementsPerPagePosition = 'elements-per-page-position';
    const elNameDownloadAllFiles = 'download-all-files';
    const elNameDownloadAllFilesImages = 'download-all-files-images';

    // Start-up
    setup();


    /*** FUNCTIONS ***/


    /* Setup */

    function setup() {
        // Add ThingiversePlus Settings Button
        addPlusSettings();

        // Enable Hide Ads
        checkAndHideAds();

        // Enable Advanced Collections
        checkAndEnableAdvancedCollections();

        // Enable Elements Per Page
        checkAndEnableElementsPerPage();

        // Enable 'Download All Files' button
        checkAndEnableDownloadAllFilesButton();
    }


    /* Settings Button */

    function addPlusSettings() {
        createPlusSettingsCSS();
        createSettingsButton();
        createSettingsContainer();
    }

    function createPlusSettingsCSS() {
        const cssPlusSettings =
            `.wait {
                cursor: wait;
            }
            
            .plus-settings-button {
                position: fixed;
                z-index: 101;
                bottom: 10px;
                right: 10px;
                border-radius: 3px;
                padding: 5px;
                background-color: #fff;
            }
            
            .plus-settings-button img {
                box-sizing: content-box;
                max-width: 20px;
                padding: 10px;
                border-radius: 3px;
                vertical-align: middle;
                background-color: #248bfb;
                cursor: pointer;
            }
            
            .plus-settings-container {
                position: fixed;
                transition: max-height 0.3s, max-width 0.3s, visibility 0.3s, opacity 0.3s linear;
                z-index: 101;
                bottom: 70px;
                right: 10px;
                max-height: 100%;
                max-width: 100%;
                visibility: visible;
                opacity: 1;
                background-color: #248bfb;
                overflow: hidden;
                padding: 5px;
                border-radius: 3px;
                box-sizing: content-box;
            }
            
            .plus-settings-container.hidden {
                max-width: 0;
                max-height: 0;
                visibility: hidden;
                opacity: 0;
            }
            
            .plus-settings-container>div {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 3px;
            }
            
            .plus-settings-container>div:not(:last-child) {
                margin-bottom: 5px;
            }
            
            .plus-settings-checkbox {
                vertical-align: middle;
                width: 32px;
                height: 32px;
                margin: 0;
                cursor: pointer;
            }
            
            .plus-settings-checkbox+label {
                display: inline-block;
                vertical-align: middle;
                color: #555;
                opacity: 1;
                font-size: 16px;
                margin: 0 10px 0 10px;
                line-height: 32px;
                cursor: pointer;
                font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol!important;
            }
            
            .plus-subsettings-element>.plus-settings-checkbox {
                width: 24px;
                height: 24px;
            }
            
            .plus-subsettings-element>.plus-settings-checkbox+label {
                font-size: 14px;
            }
            
            .plus-subsettings-element {
                --height: 32px;
                
                transition: max-height 0.3s, visibility 0.3s, opacity 0.3s linear;
                max-height: var(--height);
                visibility: visible;
                opacity: 1;
                overflow: hidden;
            }
            
            .plus-subsettings-element.hidden {
                max-height: 0;
                visibility: hidden;
                opacity: 0;
            }
            
            .plus-settings-pipe {
                --width: 32px;
                --top-gap: 2px;
                
                display: inline-block;
                vertical-align: middle;
                width: calc(var(--width) / 2);
                height: calc(var(--height) / 2 - var(--top-gap));
                margin: var(--top-gap) 0 calc(var(--height) / 2 - var(--top-gap)) calc(var(--width) / 2);
                color: #555;
                opacity: .8;
                border-left: 1px dashed;
                border-bottom: 1px dashed;
            }
            
            .plus-settings-pipe+span {
                color: #555;
                opacity: 1;
                font-size: 16px;
                margin: 0 10px 0 10px;
                font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol!important;
            }`;

        GM_addStyle(cssPlusSettings);

        createToggleSwitchCSS();
    }

    function createSettingsButton() {
        const buttonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABCCAYAAAAMlmvWAAAACXBIWXMAAC4jAAAuIwF4pT92AAAG2GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZWRhMmIzZiwgMjAyMS8xMS8xNC0xMjozMDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMi0wMS0wM1QwMzoxMzoyNCswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2YzMWI3NWQtMDZiYy1jMzRhLWIyOGYtZTdlODA2NDc4YjRlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MmE0NjVlNzAtZDg4Ni04MTQzLThmYjItNTcyMWYxZjcyOTM0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWNmYjU5ODctOTJjMi0xODQ4LWI4MzktNGU2YTEzMDA0M2I3Ij4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSIrIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSIrIi8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1Y2ZiNTk4Ny05MmMyLTE4NDgtYjgzOS00ZTZhMTMwMDQzYjciIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MTM6MjQrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3ZjMxYjc1ZC0wNmJjLWMzNGEtYjI4Zi1lN2U4MDY0NzhiNGUiIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBh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';

        let settingsButton = document.createElement('div');
        settingsButton.className = 'plus-settings-button';

        let img = document.createElement('img');
        img.src = buttonImage;
        img.alt = 'ThingiversePlus-logo';

        img.onclick = function(){
            let settingsContainer = document.querySelector('.plus-settings-container');
            settingsContainer.classList.toggle('hidden');
        };

        settingsButton.appendChild(img);

        document.body.appendChild(settingsButton);
    }

    function createSettingsContainer() {
        let settingsContainer = document.createElement('div');
        settingsContainer.classList.add('plus-settings-container')
        settingsContainer.classList.add('hidden');

        // Download All Files Button
        let settingsDownloadAllFilesContainer = document.createElement('div');

        let settingsDownloadAllFiles = createSettingsElement(elNameDownloadAllFiles, 'Download All Files As Zip', checkAndEnableDownloadAllFilesButton);
        settingsDownloadAllFilesContainer.appendChild(settingsDownloadAllFiles);

        let settingsDownloadAllFilesImages = createSubsettingsCheckboxElement(elNameDownloadAllFilesImages, 'include images', downloadAllFilesImagesOnClick, elNameDownloadAllFiles);
        settingsDownloadAllFilesContainer.appendChild(settingsDownloadAllFilesImages);

        settingsContainer.appendChild(settingsDownloadAllFilesContainer);

        // Elements Per Page
        let settingsElementsPerPageContainer = document.createElement('div');

        let settingsElementsPerPage = createSettingsElement(elNameElementsPerPage, 'Elements Per Page Selector', checkAndEnableElementsPerPage);
        settingsElementsPerPageContainer.appendChild(settingsElementsPerPage);

        let settingsElementsPerPagePosition = createSubsettingsToggleElement(elNameElementsPerPagePosition, 'Position', 'left', 'right', elementsPerPagePositionOnClick, elNameElementsPerPage);
        settingsElementsPerPageContainer.appendChild(settingsElementsPerPagePosition);

        settingsContainer.appendChild(settingsElementsPerPageContainer);

        // Advanced Collections
        let settingsAdvancedCollections = createSettingsElement(elNameAdvancedCollections, 'Advanced Collections', checkAndEnableAdvancedCollections);
        settingsContainer.appendChild(settingsAdvancedCollections);

        // Hide Ads
        let settingsHideAds = createSettingsElement(elNameHideAds, 'Hide Ads', checkAndHideAds);
        settingsContainer.appendChild(settingsHideAds);

        document.body.appendChild(settingsContainer);
        addCloseContainerListener();
    }

    function addCloseContainerListener() {
        window.addEventListener('click', function(e){
            let settingsContainer = document.querySelector('.plus-settings-container');
            const settingsButton = document.querySelector('.plus-settings-button');

            // if Settings Container is visible and click outside of Settings Button and outside the Settings Container
            if (!settingsContainer.classList.contains('hidden') &&
                !settingsButton.contains(e.target) &&
                !settingsContainer.contains(e.target)
            ){
                settingsContainer.classList.add('hidden');
            }
        });
    }

    function createSettingsElement(name, description, onChangeFunction) {
        let settingsElement = document.createElement('div');
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'plus-checkbox-' + name;
        checkbox.className = 'plus-settings-checkbox';
        checkbox.onchange = function(){
            onChangeFunction();
        };

        // Get previously saved value
        const checkboxSavedStatus = GM_getValue('settings_' + name, false);
        checkbox.checked = !!checkboxSavedStatus;

        let label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.innerHTML = description;

        settingsElement.appendChild(checkbox);
        settingsElement.appendChild(label);

        return settingsElement;
    }

    function createSubsettingsCheckboxElement(name, description, onChangeFunction, parentName){
        // Get parent status
        const parentSavedStatus = GM_getValue('settings_' + parentName, false);

        // Settings element
        let settingsElement = document.createElement('div');
        settingsElement.id = 'plus-settings-' + name;
        settingsElement.className = 'plus-subsettings-element';
        if(!parentSavedStatus) {
            settingsElement.classList.add('hidden');
        }

        // Pipe element
        let pipeElement = document.createElement('div');
        pipeElement.className = 'plus-settings-pipe';
        settingsElement.appendChild(pipeElement);

        // Get previously saved value
        const checkboxSavedStatus = GM_getValue('subsettings_' + name, false);

        // Checkbox
        let checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.id = 'plus-checkbox-' + name;
        checkboxElement.className = 'plus-settings-checkbox';
        checkboxElement.checked = !!checkboxSavedStatus;
        checkboxElement.disabled = !parentSavedStatus;
        checkboxElement.onchange = function(){
            onChangeFunction();
        };
        settingsElement.appendChild(checkboxElement);

        let labelElement = document.createElement('label');
        labelElement.htmlFor = checkboxElement.id;
        labelElement.innerHTML = description;
        settingsElement.appendChild(labelElement);

        return settingsElement;
    }

    function createToggleSwitchCSS(){
        const cssToggleSwitch =
            `.plus-toggle {
                --width: 60px;
                --height: calc(var(--width) / 3);
                
                position: relative;
                display: inline-block;
                opacity: 1;
                width: var(--width);
                height: var(--height);
                border-radius: var(--height);
                cursor: pointer;
            }
        
            .plus-toggle input {
                display: none;
            }
        
            .plus-toggle .slider {
                position: absolute;
                opacity: 1;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: var(--height);
                border: 2px solid #aaa;
                transition: all 0.4s ease-in-out;
            }
        
            .plus-toggle .slider::before {
                content: '';
                position: absolute;
                top: calc((var(--height) * 0.1) / 2);
                left: calc((var(--height) * 0.1) / 2);
                width: calc(var(--height)*0.9);
                height: calc(var(--height)*0.9);
                border-radius: calc(var(--height) / 2);
                background-color: #fff;
                transition: all 0.4s ease-in-out;
            }
        
            .plus-toggle input:checked+.slider {
                border: 2px solid #248bfb;
            }
        
            .plus-toggle input:checked+.slider::before {
                background-color: #2475ff;
            }
        
            .plus-toggle .labels {
                position: absolute;
                opacity: 1;
                font-size: 0.75rem;
                top: calc(var(--height) * 0.5 - (16px / 2)); /*16px = height of 0.75rem font*/
                left: calc(var(--height) + 2px);
                /*width: 100%;*/
                /*height: 100%;*/
                color: #555;
                transition: all 0.4s ease-in-out;
            }
        
            .plus-toggle .labels::after {
                content: attr(data-off);
                position: absolute;
                opacity: 1;
                transition: all 0.4s ease-in-out;
            }
        
            .plus-toggle .labels::before {
                content: attr(data-on);
                position: absolute;
                opacity: 0;
                transition: all 0.4s ease-in-out;
            }
        
            .plus-toggle input:checked~.labels::after {
                opacity: 0;
            }
        
            .plus-toggle input:checked~.labels::before {
                opacity: 1;
            }`;

        GM_addStyle(cssToggleSwitch);
    }

    function createSubsettingsToggleElement(name, description, option_off, option_on, onChangeFunction, parentName) {
        // Get parent status
        const parentSavedStatus = GM_getValue('settings_' + parentName, false);

        // Settings element
        let settingsElement = document.createElement('div');
        settingsElement.id = 'plus-settings-' + name;
        settingsElement.className = 'plus-subsettings-element';
        if(!parentSavedStatus) {
            settingsElement.classList.add('hidden');
        }

        // Pipe element
        let pipeElement = document.createElement('div');
        pipeElement.className = 'plus-settings-pipe';
        settingsElement.appendChild(pipeElement);

        // Description span
        let descriptionElement = document.createElement('span');
        descriptionElement.innerHTML = description + ':';
        settingsElement.appendChild(descriptionElement);

        // Get previously saved value
        const toggleSavedStatus = GM_getValue('subsettings_' + name, false);

        // Toggle switch element
        let toggleElement = document.createElement('label');
        toggleElement.className = 'plus-toggle';

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'plus-toggle-' + name;
        checkbox.checked = !!toggleSavedStatus;
        checkbox.disabled = !parentSavedStatus;
        checkbox.onchange = function(){
            onChangeFunction();
        };
        toggleElement.appendChild(checkbox);

        let slider = document.createElement('span');
        slider.className = 'slider';
        toggleElement.appendChild(slider);

        let labels = document.createElement('span');
        labels.className = 'labels';
        labels.setAttribute('data-off', option_off.toUpperCase());
        labels.setAttribute('data-on', option_on.toUpperCase());
        toggleElement.appendChild(labels);

        settingsElement.appendChild(toggleElement);

        return settingsElement;
    }

    function checkAndHideAds() {
        let cb = document.getElementById('plus-checkbox-' + elNameHideAds);

        // update checkbox value
        GM_setValue('settings_' + elNameHideAds, cb.checked);

        if (cb.checked) {
            const pathname = window.location.pathname;
            if (pathname.startsWith('/thing:')) {
                // Set 6 elements per page in 'More' section
                changeElementsPerPage(6);
            }

            hideAds();
        }
        else {
            unhideAds();
        }
    }

    function checkAndEnableAdvancedCollections() {
        let cb = document.getElementById('plus-checkbox-' + elNameAdvancedCollections);

        // get last checkbox status
        const cbLastStatus = GM_getValue('settings_' + elNameAdvancedCollections, false);

        // update checkbox value
        GM_setValue('settings_' + elNameAdvancedCollections, cb.checked);

        if (cb.checked) {
            enableAdvancedCollections();
        }
        else {
            // check last status and reload if changed
            if (!!cbLastStatus) {
                window.location.reload();
            }
        }
    }

    function checkAndEnableElementsPerPage() {
        let cb = document.getElementById('plus-checkbox-' + elNameElementsPerPage);

        // get last checkbox status
        const cbLastStatus = GM_getValue('settings_' + elNameElementsPerPage, false);

        // update checkbox value
        GM_setValue('settings_' + elNameElementsPerPage, cb.checked);

        // If checkbox is clicked
        if (cb.checked !== cbLastStatus) {
            // Toggle subSettings elements
            toggleChildSettings(elNameElementsPerPagePosition);
        }

        if (cb.checked) {
            // If was disabled


            enableElementsPerPage();
        }
        else{
            if (!!cbLastStatus) {
                disableElementsPerPage();
            }
        }


    }

    function checkAndEnableDownloadAllFilesButton() {
        let cb = document.getElementById('plus-checkbox-' + elNameDownloadAllFiles);

        // get last checkbox status
        const cbLastStatus = GM_getValue('settings_' + elNameDownloadAllFiles, false);

        // update checkbox value
        GM_setValue('settings_' + elNameDownloadAllFiles, cb.checked);

        // If checkbox is clicked
        if (cb.checked !== cbLastStatus) {
            // Toggle subSettings elements
            toggleChildSettings(elNameDownloadAllFilesImages);
        }

        if (cb.checked) {
            enableDownloadAllFilesBindButton();
        }
        else{
            disableDownloadAllFilesBindButton();
        }
    }

    function elementsPerPagePositionOnClick() {
        let cb = document.getElementById('plus-toggle-' + elNameElementsPerPagePosition);

        // update checkbox value
        GM_setValue('subsettings_' + elNameElementsPerPagePosition, cb.checked);

        // Remove old selector and CSS
        disableElementsPerPage();

        // Recall creation function
        checkAndEnableElementsPerPage();
    }

    function downloadAllFilesImagesOnClick() {
        let cb = document.getElementById('plus-checkbox-' + elNameDownloadAllFilesImages);

        // update checkbox value
        GM_setValue('subsettings_' + elNameDownloadAllFilesImages, cb.checked);
    }

    function disableElementsPerPage() {
        let select = document.querySelector('.plus-elements-per-page');
        if (select) {
            select.remove();
        }
        if (cssElementsPerPageElement){
            cssElementsPerPageElement.remove();
            cssElementsPerPageElement = undefined;
        }
        if (cssElementsPerPageExtraElement){
            cssElementsPerPageExtraElement.remove();
            cssElementsPerPageExtraElement = undefined;
        }
    }

    function enableElementsPerPage() {
        const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '/search') {
            const positionRightStatus = GM_getValue('subsettings_' + elNameElementsPerPagePosition, false);

            enablePerPageSelect(positionRightStatus);
        }
    }

    function toggleChildSettings(elementName){
        let el = document.getElementById('plus-settings-' + elementName);
        el.classList.toggle('hidden');

        // Enable checkboxes
        let checkboxes = Array.from(el.querySelectorAll('input[type=checkbox]'));
        checkboxes.forEach(checkbox => {
            checkbox.disabled = !checkbox.disabled;
        });
    }


    /* Hide Ads */

    function hideAds() {
        if(!cssHideAdsElement) {
            const cssHideAds =
                `div[class^='AdCard__'] {
                    display: none !important;
                }`;

            cssHideAdsElement = GM_addStyle(cssHideAds);
        }
    }

    function unhideAds() {
        if (cssHideAdsElement) {
            cssHideAdsElement.remove();
            cssHideAdsElement = undefined;
        }
    }


    /* Change Elements Per Page */

    function changeElementsPerPage(elementsPerPage) {
        URLSearchParams.prototype._append = URLSearchParams.prototype.append;
        URLSearchParams.prototype.append = function append(k, v) {
            if (k === 'per_page') v = elementsPerPage;
            return this._append(k, v);
        }
    }


    /* Append Per Page Select */

    function enablePerPageSelect(positionRight = false) {
        const availablePerPageValues = [20, 30, 60, 100, 200];

        // Get previously saved value for elements_per_page
        const elementsPerPage = GM_getValue('elements_per_page', availablePerPageValues[0]);
        // Change value of elements per page to load
        changeElementsPerPage(elementsPerPage);

        // Generate CSS
        const cssElementsPerPage =
            `.plus-elements-per-page {
                display: inline-block;
                position: relative;
                background-color: #fff;
                width: 300px;
                margin-bottom: 10px;
                margin-right: 20px;
                vertical-align: top;
            }

            .plus-elements-per-page > label {
                display: inline-block;
                width: 210px;
                margin-left: 10px;
                font-size: 12px;
                color: #555;
                text-align: left;
            }

            .plus-elements-per-page > select {
                width: 80px;
                height: 30px;
                cursor: pointer;
                border: 0;
                border-left: 1px solid rgba(85, 85, 85, .8);
                color: #555;
                opacity: 0.8;
            }`;

        const cssElementsPerPageExtraLeft =
            `div[class^='Sort__dropdown--'] {
                margin-left: 0px;
            }`;

        const cssElementsPerPageExtraRight =
            `div[class^='FilterBySort__dropdown--'] {
                margin-right: 20px;
            }
            
            .plus-elements-per-page {
                margin-right: 0;
            }`;


        // Generate options from given values
        let availableOptions = [];
        availablePerPageValues.forEach(value => {
            let option = document.createElement('option');
            option.value = value.toString();
            option.selected = elementsPerPage === value;
            option.innerHTML = value.toString();

            availableOptions.push(option);
        });

        // Generate html
        let htmlElementsPerPage = document.createElement('div');
        htmlElementsPerPage.className = 'plus-elements-per-page';

        let select = document.createElement('select');
        select.id = 'plus-elements-per-page';
        availableOptions.forEach(option => {
            select.add(option);
        });
        select.onchange = function(){
            const newPerPageValue = parseInt(this.value);
            if (availablePerPageValues.includes(newPerPageValue)) {
                GM_setValue('elements_per_page', newPerPageValue);
            }
            window.location.reload();
        };

        let label = document.createElement('label');
        label.htmlFor = select.id;
        label.innerHTML = "Elements per page:";

        htmlElementsPerPage.appendChild(label);
        htmlElementsPerPage.appendChild(select);

        // Add CSS
        cssElementsPerPageElement = GM_addStyle(cssElementsPerPage);

        // Add html
        const filterBySortDiv = document.querySelector('div[class^="FilterBySort__dropdown--"]');
        if (!positionRight) {
            // Add Extra CSS
            cssElementsPerPageExtraElement = GM_addStyle(cssElementsPerPageExtraLeft);
            // Add html
            filterBySortDiv.parentNode.prepend(htmlElementsPerPage);
        }
        else {
            // Add Extra CSS
            cssElementsPerPageExtraElement = GM_addStyle(cssElementsPerPageExtraRight);
            // Add html
            filterBySortDiv.parentNode.append(htmlElementsPerPage);
        }
    }


    /* Advanced Collections */

    function enableAdvancedCollections() {

        let collections = extractCollections();
        console.log(collections);

        collections.forEach(collection => {
            console.log(collection);
        });


        const bearer = extractBearer();

        if (bearer) {
            const username = extractUsername();

            //TODO wait

            getCollections(username, bearer)
                .then(collectionsList => {
                    console.log('Successfully retrieved Collections.');

                    // Put most recent Collection in the first place
                    let indexMR = indexOfMostRecentCollection(collectionsList);
                    if (indexMR) {
                        collectionsList.unshift(
                            collectionsList.splice(indexMR, 1)[0]
                        );
                    }

                    // Generate list of option nodes with all Collections
                    //let first = true;
                    let optionList = [];
                    collectionsList.forEach(collection => {
                        let option = document.createElement('option');
                        option.value = collection.id;

                        // if (first){
                        //     option.selected = true;
                        //     first = false;
                        // }
                        option.text = collection.name + ' (' + collection.count + ')';
                        optionList.push(option);
                    });

                    // Generate option to 'Create new Collection'
                    let createNewOption = document.createElement('option');
                    createNewOption.style.cssText = 'display: none;';
                    createNewOption.value = '-1';
                    createNewOption.text = 'Create a new Collection';
                    optionList.push(createNewOption);

                    // Get all select nodes that contains Collections
                    let selectList = Array.from(document.querySelectorAll('.react-app select>option'))
                        .filter(option => option.innerHTML === 'Create a new Collection')
                        .map(option => option.parentNode);



                    /** just a Workaround to select first option of connections. it automatically selects the last created.*/
                    /* instead use observer.observe to intercept when select changes (visible) and select the correct option  */
                    // Get 'Collect Thing' nodes
                    let collectThingListFirst = Array.from(document.querySelectorAll('a[class^="SideMenuItem__textWrapper--"]'))
                        .filter(option => option.innerHTML === 'Collect Thing')
                        .map(option => option.parentNode);

                    let collectThingListBottom = Array.from(document.querySelectorAll('div[class^="CardActionItem__textWrapper--"]'))
                        .filter(option => option.innerHTML === 'Collect Thing')
                        .map(option => option.parentNode.parentNode.parentNode);

                    let collectThingList = collectThingListFirst.concat(collectThingListBottom);

                    collectThingList.forEach(collectButton => {
                        collectButton.onclick = async function(){
                            await sleep(0);
                            selectList.forEach(selectEl => {
                                selectEl.selectedIndex = 0;
                            });
                        };
                    });

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    /*** end workaround */

                    // Replace existing option nodes with new ones in all select nodes
                    selectList.forEach(selectEl => {
                        // Clone nodes
                        const newOptionList = optionList.map(option => option.cloneNode(true));

                        // Replace children
                        selectEl.replaceChildren(...newOptionList);
                        selectEl.selectedIndex = 0;
                        //TODO if account has no collections select 'create new collection' and trigger selectEl.dispatchEvent(changeEvent);

                        // Generate button that can be used to 'Create new Collection'
                        //TODO generate one button and function outside foreach. Inside just clone button and associate function with current select
                        let plusButton = document.createElement('button');
                        plusButton.style.cssText = 'width: 16%; height: 30px;';
                        plusButton.textContent = '+';
                        plusButton.onclick = function(){
                            selectEl.value = '-1';
                            const changeEvent = new Event('change', {
                                bubbles: true
                            });
                            selectEl.dispatchEvent(changeEvent);
                        };

                        // Generate span with button
                        let plusButtonSpan = generateSpan(plusButton);

                        // Change current select style
                        selectEl.style = 'width: 84%;';

                        // Append created span with button after current select
                        selectEl.after(plusButtonSpan);
                    });
                    //TODO wait end
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }

    function extractCollections() {
        try {
            return JSON.parse(
                stripBackslashes(JSON.parse(window.localStorage['persist:root']).collections)).userData;
        } catch (e) {
            return null;
        }
    }

    function extractBearer() {
        try {
            return JSON.parse(window.localStorage['user-data']).user;
        } catch (e) {
            return null;
        }
    }

    function extractUsername() {
        try {
            return JSON.parse(window.localStorage['user-data']).data.name;
        } catch (e) {
            return null;
        }
    }

    async function getCollections(username = '', bearer = '') {
        const collectionsUrl = 'https://api.thingiverse.com/users/' + username + '/collections/true';
        const response = await fetch(collectionsUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + bearer
            }
        });
        return response.json();
    }

    function indexOfMostRecentCollection(collections) {
        if (collections.length === 0) {
            return null;
        }

        let mostRecent = new Date(collections[0].modified);
        let mostRecentIndex = 0;

        for (let i = 1; i < collections.length; i++) {
            if (new Date(collections[i].modified) > mostRecent) {
                mostRecentIndex = i;
                mostRecent = new Date(collections[i].modified);
            }
        }

        return mostRecentIndex;
    }

    function generateSpan(childNode = null){
        let spanEl = document.createElement('span');
        if(childNode){
            spanEl.appendChild(childNode);
        }
        return spanEl;
    }


    /* Download All Files */

    function downloadAllFiles() {
        // set cursor to wait
        document.body.classList.add('wait');

        let zip = new JSZip();

        let thing = JSON.parse(stripBackslashes(extractCurrentThing())).thing;

        // Zip thing files
        let files = thing.files;

        files.forEach(file => {
            let filePromise = downloadFile(file.public_url);
            zip.file(file.name, filePromise);
        });

        // Include images
        const includeImages = GM_getValue('subsettings_' + elNameDownloadAllFilesImages, false);

        if (includeImages) {
            let imgFolder = zip.folder('images');

            let images = thing.images;

            images.forEach(image => {
                let largeImages = image.sizes.filter( el => {
                    return el.type==='display' &&
                        el.size==='large';
                });
                let imageUrl = largeImages[0].url;

                let filePromise = downloadFile(imageUrl);
                imgFolder.file(image.name, filePromise);
            });
        }

        let zipName = thing.id + ' - ' + thing.name;
        zipName = filenameValidator(zipName).fname;

        zip.generateAsync({type: 'blob'})
            .then(function (content) {
                saveAs(content, zipName);

                // set cursor back to normal (remove wait)
                document.body.classList.remove('wait');
            });
    }

    function enableDownloadAllFilesBindButton() {
        const sidebarMenuBtnSelector = 'a[class^="SidebarMenu__download--"]';

        // Sidebar menu download button
        let downloadButton = document.querySelector(sidebarMenuBtnSelector);
        if (downloadButton) {
            downloadAllFilesAttach(downloadButton);
        } else {
            waitForKeyElements(sidebarMenuBtnSelector, (loadedDownloadButton) => {
                downloadAllFilesAttach(loadedDownloadButton);
            });
        }
    }

    function downloadAllFilesAttach(button) {
        button.onclick = async function(){
            downloadAllFiles();
        };
    }

    function disableDownloadAllFilesBindButton() {
        const sidebarMenuBtnSelector = 'a[class^="SidebarMenu__download--"]';

        // Sidebar menu download button
        let downloadButton = document.querySelector(sidebarMenuBtnSelector);
        if (downloadButton) {
            downloadAllFilesDetach(downloadButton);
        } else {
            waitForKeyElements(sidebarMenuBtnSelector, (loadedDownloadButton) => {
                downloadAllFilesDetach(loadedDownloadButton);
            });
        }
    }

    function downloadAllFilesDetach(button) {
        button.onclick = null;
    }

    function extractCurrentThing() {
        try {
            return JSON.parse(window.localStorage['persist:root']).currentThing;
        } catch (e) {
            return null;
        }
    }

    function stripBackslashes(str) {
        return (str + '').replace('\\', '');
    }

    async function downloadFile(url) {
        const response = await fetch(url, {
            method: 'GET'
        }).catch((error) => {
            console.error('Error:', error);
        });

        return response.arrayBuffer();
    }

    function filenameValidator(fname, { replacement = '�' } = {}) {
        // https://stackoverflow.com/a/31976060
        // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3

        const fname_original = fname;

        // resolve multi-line, whitespace trimming
        fname = fname.split(/[\r\n]/).map(s => s.trim()).filter(s => s.length).join('  ');

        // forbidden characters
        // (after multi-line, because new-line-chars are themselves forbidden characters)
        fname = fname.replaceAll(/[<>:"\/\\|?*\x00-\x1F]/g, replacement);

        // advanced trim
        fname = fname.replace(/\.$/, '');

        // empty filename
        if (!fname.length) {
            fname = '_';
        }

        // forbidden filenames
        if (fname.match(/^(CON|PRN|AUX|NUL|COM1|COM2|COM3|COM4|COM5|COM6|COM7|COM8|COM9|LPT1|LPT2|LPT3|LPT4|LPT5|LPT6|LPT7|LPT8|LPT9)(\..+)?$/)) {
            fname = `_${fname}`;
        }

        return {
            fname,
            isOriginal: (fname === fname_original),
        };
    }

    /*** ***/

})();