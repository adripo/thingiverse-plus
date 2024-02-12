// ==UserScript==
// @name         Thingiverse Plus
// @namespace    https://thingiverse.com/
// @version      3.0.0
// @description  Thingiverse with extra features
// @author       adripo
// @homepage     https://github.com/adripo/thingiverse-plus
// @icon         https://www.thingiverse.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.meta.js
// @downloadURL  https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.user.js
// @supportURL   https://github.com/adripo/thingiverse-plus/issues
// @match        https://www.thingiverse.com/*
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/GM_wrench@v1.3/dist/GM_wrench.min.js
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/src/FileSaver.js
// @require      https://raw.githubusercontent.com/Stuk/jszip/master/dist/jszip.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

//TODO docs for functions
//TODO check elements that need to waitForKeyElements before executing action
//todo change plus-settings-checkbox with config
//todo convert styles; example: var.style.cssText = 'display: none;'; into createNewOption.style.display = 'none;';
//TODO change foreach with for.. of

(function () {
    'use strict';

    // Global variables
    let cssGraphicalImprovementsElement;
    let cssHideBannersElement;
    let cssHideAdsElement;
    let cssElementsPerPageElement;
    let advancedCollectionObserver;

    // Feature ids
    const idGraphicalImprovements = 'graphical-improvements';
    const idDownloadAllFiles = 'download-all-files';
    const idDownloadAllFilesImages = 'images';
    const idAdvancedCollections = 'advanced-collections';
    const idElementsPerPage = 'elements-per-page';
    const idElementsPerPagePositionRight = 'position-right';
    const idHideBanners = 'hide-banners';
    const idHideAds = 'hide-ads';

    const features = [
        {
            id: idGraphicalImprovements,
            description: 'Graphical Improvements',
            enableFunction: enableGraphicalImprovements,
            disableFunction: disableGraphicalImprovements,
        },
        {
            id: idDownloadAllFiles,
            description: 'Download All Files As Zip',
            enableFunction: enableDownloadAllFilesBindButton,
            disableFunction: disableDownloadAllFilesBindButton,
            options: [
                {
                    id: idDownloadAllFilesImages,
                    description: 'include images',
                    type: 'checkbox',
                    enableFunction: toggleDownloadAllFilesImages,
                    disableFunction: toggleDownloadAllFilesImages,
                }
            ]
        },
        {
            id: idAdvancedCollections,
            description: 'Advanced Collections',
            enableFunction: enableAdvancedCollections,
            disableFunction: disableAdvancedCollections
        },
        {
            id: idElementsPerPage,
            description: 'Elements Per Page Selector',
            enableFunction: enableElementsPerPage,
            disableFunction: disableElementsPerPage,
            options: [
                {
                    id: idElementsPerPagePositionRight,
                    description: 'Position',
                    type: 'toggle',
                    left: 'Left',
                    right: 'Right',
                    enableFunction: toggleElementsPerPagePosition,
                    disableFunction: toggleElementsPerPagePosition,
                }
            ]
        },
        {
            id: idHideBanners,
            description: 'Hide Banners',
            enableFunction: enableHideBanners,
            disableFunction: disableHideBanners
        },
        {
            id: idHideAds,
            description: 'Hide Ads',
            enableFunction: enableHideAds,
            disableFunction: disableHideAds
        },
    ];

    // Start-up
    setup();


    /*** FUNCTIONS ***/


    /* Setup */

    function setup() {
        // Add ThingiversePlus Settings Button
        addPlusSettings();

        // Setup features
        features.forEach(feature => setupFeature(feature));
    }

    function setupFeature(feature) {
        const featureStatus = getConfigStatus(feature.id);

        if (featureStatus) {
            feature.enableFunction();
        } else {
            feature.disableFunction();
        }
    }


    /* Settings Button */

    function addPlusSettings() {
        createPlusSettingsCSS();
        createToggleSwitchCSS();
        createSpinnerLoadingCSS();

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
                z-index: 500;
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
                z-index: 500;
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

            .plus-settings-container > div {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 3px;
            }

            .plus-settings-container > div:not(:last-child) {
                margin-bottom: 5px;
            }

            .plus-settings-checkbox {
                vertical-align: middle;
                width: 32px;
                height: 32px;
                margin: 0;
                cursor: pointer;
            }

            .plus-settings-checkbox + label {
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

            .plus-subsettings-element label,
            .plus-subsettings-element span {
                color: #555;
                opacity: 1;
                font-size: 14px;
                margin: auto;
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

            .plus-settings-pipe + span,
            .plus-settings-pipe + input {
                margin: 0 10px 0 10px;
            }

            .plus-subsettings-element > .plus-settings-checkbox {
                width: 24px;
                height: 24px;
            }`;

        GM_addStyle(cssPlusSettings);
    }

    function createSettingsButton() {
        const buttonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABCCAYAAAAMlmvWAAAACXBIWXMAAC4jAAAuIwF4pT92AAAG2GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZWRhMmIzZiwgMjAyMS8xMS8xNC0xMjozMDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMi0wMS0wM1QwMzoxMzoyNCswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2YzMWI3NWQtMDZiYy1jMzRhLWIyOGYtZTdlODA2NDc4YjRlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MmE0NjVlNzAtZDg4Ni04MTQzLThmYjItNTcyMWYxZjcyOTM0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWNmYjU5ODctOTJjMi0xODQ4LWI4MzktNGU2YTEzMDA0M2I3Ij4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSIrIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSIrIi8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1Y2ZiNTk4Ny05MmMyLTE4NDgtYjgzOS00ZTZhMTMwMDQzYjciIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MTM6MjQrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3ZjMxYjc1ZC0wNmJjLWMzNGEtYjI4Zi1lN2U4MDY0NzhiNGUiIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBh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';

        let settingsButton = document.createElement('div');
        settingsButton.className = 'plus-settings-button';

        let img = document.createElement('img');
        img.src = buttonImage;
        img.alt = 'ThingiversePlus-logo';

        img.onclick = function () {
            let settingsContainer = document.querySelector('.plus-settings-container');
            settingsContainer.classList.toggle('hidden');
        };

        settingsButton.appendChild(img);

        document.body.appendChild(settingsButton);
    }

    function createSettingsContainer() {
        let settingsContainer = document.createElement('div');
        settingsContainer.classList.add('plus-settings-container');
        settingsContainer.classList.add('hidden');

        // Create features
        features.forEach(feature => {
            settingsContainer.appendChild(createFeatureConfig(feature));
        });

        document.body.appendChild(settingsContainer);
        addCloseContainerListener();
    }

    function addCloseContainerListener() {
        window.addEventListener('click', function (e) {
            let settingsContainer = document.querySelector('.plus-settings-container');
            const settingsButton = document.querySelector('.plus-settings-button');

            // if Settings Container is visible and click outside of Settings Button and outside the Settings Container
            if (!settingsContainer.classList.contains('hidden') &&
                !settingsButton.contains(e.target) &&
                !settingsContainer.contains(e.target)
            ) {
                settingsContainer.classList.add('hidden');
            }
        });
    }

    function createFeatureConfig(feature) {
        let featureContainer = document.createElement('div');
        featureContainer.className = 'plus-settings-feature-container';

        let featureConfig = document.createElement('div');
        featureConfig.className = 'plus-settings-feature-config';

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'plus-checkbox-' + feature.id;
        checkbox.className = 'plus-settings-checkbox';
        checkbox.onchange = function () {
            updateConfigStatus(this, feature);
        };

        // Get previously saved value
        const checkboxSavedStatus = getConfigStatus(feature.id);
        checkbox.checked = !!checkboxSavedStatus;

        let label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.innerHTML = feature.description;

        featureConfig.appendChild(checkbox);
        featureConfig.appendChild(label);

        featureContainer.appendChild(featureConfig);

        if (feature.options !== undefined) {
            feature.options.forEach(option => {
                let featureSubconfig = createFeatureSubconfig(feature, option, checkbox.checked)
                featureContainer.appendChild(featureSubconfig);
            });
        }

        return featureContainer;
    }

    function createFeatureSubconfig(feature, option, visible) {
        let featureSubconfig;

        switch (option.type) {
            case 'checkbox':
                featureSubconfig = createSubconfigCheckbox(feature, option, visible);
                break;
            case 'toggle':
                featureSubconfig = createSubconfigToggle(feature, option, visible);
                break;
        }

        return featureSubconfig;
    }

    function createSubconfigCheckbox(feature, option, visible) {
        // Settings element
        let subconfig = document.createElement('div');
        subconfig.id = 'plus-settings-' + option.id;
        subconfig.className = 'plus-subsettings-element';
        if (!visible) {
            subconfig.classList.add('hidden');
        }

        // Pipe element
        let pipeElement = document.createElement('div');
        pipeElement.className = 'plus-settings-pipe';
        subconfig.appendChild(pipeElement);

        // Get previously saved value
        const checkboxSavedStatus = getConfigStatus(feature.id, option.id);

        // Checkbox
        let checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.id = 'plus-checkbox-' + feature.id + '-' + option.id;
        checkboxElement.className = 'plus-settings-checkbox';
        checkboxElement.checked = !!checkboxSavedStatus;
        checkboxElement.disabled = !visible;
        checkboxElement.onchange = function () {
            updateConfigStatus(this, feature, option);
        };
        subconfig.appendChild(checkboxElement);

        let labelElement = document.createElement('label');
        labelElement.htmlFor = checkboxElement.id;
        labelElement.innerHTML = option.description;
        subconfig.appendChild(labelElement);

        return subconfig;
    }

    function createSubconfigToggle(feature, option, visible) {
        // Settings element
        let subconfig = document.createElement('div');
        subconfig.id = 'plus-settings-' + option.id;
        subconfig.className = 'plus-subsettings-element';
        if (!visible) {
            subconfig.classList.add('hidden');
        }

        // Pipe element
        let pipeElement = document.createElement('div');
        pipeElement.className = 'plus-settings-pipe';
        subconfig.appendChild(pipeElement);

        // Description span
        let descriptionElement = document.createElement('span');
        descriptionElement.innerHTML = option.description + ':';
        subconfig.appendChild(descriptionElement);

        // Get previously saved value
        const toggleSavedStatus = getConfigStatus(feature.id, option.id);

        // Toggle switch element
        let toggleElement = document.createElement('label');
        toggleElement.className = 'plus-toggle';

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'plus-toggle-' + option.id;
        checkbox.checked = !!toggleSavedStatus;
        checkbox.disabled = !visible;
        checkbox.onchange = function () {
            updateConfigStatus(this, feature, option);
        };
        toggleElement.appendChild(checkbox);

        let slider = document.createElement('div');
        slider.className = 'slider';
        toggleElement.appendChild(slider);

        let labelLeft = document.createElement('span');
        labelLeft.className = 'labels';
        labelLeft.innerHTML = option.left.toUpperCase();
        toggleElement.appendChild(labelLeft);

        let labelRight = document.createElement('span');
        labelRight.className = 'labels right';
        labelRight.innerHTML = option.right.toUpperCase();
        toggleElement.appendChild(labelRight);

        subconfig.appendChild(toggleElement);

        return subconfig;
    }

    function createToggleSwitchCSS() {
        const cssToggleSwitch =
            `/* Toggle Style */

            .plus-toggle {
                --width: 120px;
                --height: calc(var(--width) / 6);

                position: relative;
                display: inline-block;
                opacity: 1;
                width: var(--width);
                height: var(--height);
                vertical-align: middle;
                margin: auto;
                background-color: rgba(0,0,0,.1);
                cursor: pointer;
            }

            .plus-toggle, .plus-toggle .slider {
                height: var(--height);
                border-radius: calc( var(--height) / 2);
            }

            .plus-toggle .slider {
                position: absolute;
                width: 50%;
                background-color: #248bfb;
                box-shadow: 0 2px 15px rgba(0,0,0,.15);
                transition: transform .2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .plus-toggle .labels {
                width: 50%;
                height: 100%;
                position: absolute;
                display: flex;
                opacity: 1;
                justify-content: center;
                align-items: center;
                font-size: 0.75rem;
                color: #555;
                transition: color .2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .plus-toggle .labels.right {
                right: 0;
            }

            /* Toggle */
            .plus-toggle input[type="checkbox"] {
                display: none;
            }

            .plus-toggle input[type="checkbox"]:checked + .slider {
                transform: translateX(100%);
            }

            .plus-toggle input[type="checkbox"]:checked ~ .labels.right,
            .plus-toggle input[type="checkbox"]:not(:checked) ~ .labels:not(.right) {
                color: white;
            }`;

        GM_addStyle(cssToggleSwitch);
    }

    function getConfigStatus(idFeature, idOption) {
        if (typeof idOption === 'undefined') {
            return GM_getValue('settings_' + idFeature, false);
        }
        else {
            return GM_getValue('settings_' + idFeature + '_' + idOption, false);
        }
    }

    function updateConfigStatus(targetCheckbox, feature, option) {
        if (typeof option === 'undefined') {
            // update config value
            GM_setValue('settings_' + feature.id, targetCheckbox.checked);

            if (targetCheckbox.checked) {
                feature.enableFunction();
            } else {
                feature.disableFunction();
            }

            updateSiblingsVisibility(targetCheckbox, targetCheckbox.checked);
        }
        else {
            // update config value
            GM_setValue('settings_' + feature.id + '_' + option.id, targetCheckbox.checked);

            // if enable/disable functions are defined
            if (typeof option.enableFunction !== 'undefined' && targetCheckbox.checked) {
                option.enableFunction();
            } else if (typeof option.disableFunction !== 'undefined') {
                option.disableFunction();
            }
        }
    }

    //TODO convert to toggle and use el.classList.toggle('hidden');
    function updateSiblingsVisibility(targetCheckbox, visible) {
        for (let sibling of targetCheckbox.parentNode.parentNode.children) {
            if (sibling !== targetCheckbox.parentNode) {
                if (visible) {
                    updateCheckboxEnablement(sibling, true);
                    sibling.classList.remove('hidden');
                } else {
                    sibling.classList.add('hidden');
                    updateCheckboxEnablement(sibling, false);
                }
            }
        }
    }

    function updateCheckboxEnablement(targetDiv, enable) {
        // Enable checkboxes
        let checkbox = targetDiv.querySelector('input[type=checkbox]');
        checkbox.disabled = !enable;
    }
    /* Graphical Improvements */

    function enableGraphicalImprovements() {
        if (!cssGraphicalImprovementsElement) {
            const cssGraphicalImprovements =
                `/* Graphical Improvements Style */
    
                div[class^='HomePage__homePage--'] {
                    transition: all 0.3s ease;
                }
                
                div[class^='PageHeader__headerPlaceholder--'],
                div[class^='PageHeader__headerWrapper'] {
                    min-width: 348px;
                }
                
                @media (max-width: 620px) {
                    div[class^='ItemCardGrid__itemCardGrid--'] {
                        grid-template-columns: repeat(auto-fit,minmax(300px,1fr));
                    }
                }
    
                @media (min-width: 1025px) and (max-width: 1043px) {
                    div[class^='PageHeader__headerPlaceholder--'],
                    div[class^='PageHeader__headerWrapper--'] {
                        height: 85px;
                    }
                    
                    div[class^='PageHeader__headerPlaceholder--'][class*='PageHeader__siteNotification--'],
                    div[class^='PageHeader__headerWrapper--'][class*='PageHeader__siteNotification--'] {
                        height: 125px;
                    }
    
                    div[class^='PageHeader__header--'] {
                        -ms-flex-wrap:wrap;
                        flex-wrap: wrap;
                        gap: normal;
                        padding: 0 5px 5px;
                    }
                
                    div[class^='PageHeader__header--'] div[class^='PageHeader__navBar--'] {
                        -webkit-box-ordinal-group: 3;
                        -ms-flex-order: 2;
                        order: 2;
                    }
                
                    div[class^='PageHeader__header--'] div[class*='PageHeader__searchBar--'] {
                        -webkit-box-ordinal-group: 4;
                        -ms-flex-order: 3;
                        order: 3;
                    }
                    
                    div[class*='PageHeader__searchBar--'] {
                        max-width: none;
                    }
                }
                
                div[class^='SearchFilterBar__searchFilterBar--'] {
                    grid-template-columns: repeat(auto-fit,minmax(300px,1fr));
                    display: grid;
                    row-gap: 18px;
                    column-gap: 24px;
                }
                
                div[class^='SearchFilterBar__searchFilterBar--'] > * {
                    width: 100% !important;
                }
                
                div[class^='SearchFilterBar__searchFilterBar--'] > :last-child:nth-child(3n-1),
                div[class^='SearchFilterBar__searchFilterBar--'] > :nth-last-child(2):nth-child(3n+1) {
                    grid-column-end: auto;
                }
                
                @media (max-width: 720px) {
                    .SearchFilterBar__searchFilterBar--RIie5 {
                        column-gap: 24px;
                    }
                }`;

            cssGraphicalImprovementsElement = GM_addStyle(cssGraphicalImprovements);
        }
    }

    function disableGraphicalImprovements() {
        if (cssGraphicalImprovementsElement) {
            cssGraphicalImprovementsElement.remove();
            cssGraphicalImprovementsElement = undefined;
        }
    }

    function toggleDownloadAllFilesImages() {
        let cb = document.getElementById('plus-checkbox-' + elNameDownloadAllFilesImages);

        // update checkbox value
        GM_setValue('subsettings_' + elNameDownloadAllFilesImages, cb.checked);
    }

    function toggleElementsPerPagePosition() {
        // Remove old selector and CSS
        disableElementsPerPage();

        // Recall creation function
        enableElementsPerPage();
    }

    function disableElementsPerPage() {
        const select = document.querySelectorAll('.plus-elements-per-page');

        select.forEach((selectItem) => {
            selectItem.remove();
        });

        if (cssElementsPerPageElement) {
            cssElementsPerPageElement.remove();
            cssElementsPerPageElement = undefined;
        }
    }

    function enableElementsPerPage() {
        const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '/search') {
            const positionRightStatus = getConfigStatus(idElementsPerPage, idElementsPerPagePositionRight);

            enablePerPageSelect(positionRightStatus);
        }
    }


    /* Suggested Elements Number */

    function enableSuggestedElementsNumber() {
        const pathname = window.location.pathname;
        if (pathname.startsWith('/thing:')) {
            // Set 6 elements per page in 'More' section
            changeElementsPerPage(6);
        }
    }

    /* Hide Banners */

    function enableHideBanners() {
        if (!cssHideBannersElement) {
            const cssHideBanners =
                `div[class^='HomePageBanner__'] {
                    display: none !important;
                }

                div[class^='SiteWideNotification__'] {
                    display: none !important;
                }`;

            cssHideBannersElement = GM_addStyle(cssHideBanners);
        }
    }

    function disableHideBanners() {
        if (cssHideBannersElement) {
            cssHideBannersElement.remove();
            cssHideBannersElement = undefined;
        }
    }

    /* Hide Ads */

    function enableHideAds() {
        if (!cssHideAdsElement) {
            const cssHideAds =
                `div[class^='ItemCardContainer__']:has(> div[class^='ItemCardHeader__'][title='Advertisement']) {
                    display: none !important;
                }`;

            cssHideAdsElement = GM_addStyle(cssHideAds);
        }

        enableSuggestedElementsNumber(); //todo create custom settings
    }

    function disableHideAds() {
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
            `/* Elements Per Page Style */
    
            .plus-elements-per-page {
                position: relative;
                width: 100%;
            }

            .plus-elements-per-page > label {
                opacity: 1;
                -webkit-box-align: center;
                -ms-flex-align: center;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                align-items: center;
                background-color: #fff;
                border: 1px solid #d4d4d4;
                border-radius: 12px;
                color: #6c6c6c;
                cursor: pointer;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                font-family: Noto Sans Mono,Arial,Helvetica;
                font-size: 12px;
                font-weight: 400;
                gap: 12px;
                justify-content: space-between;
                line-height: 16px;
                min-height: 34px;
                outline: none;
                width: calc(100% - 2px);
            }

            .plus-elements-per-page > label > span {
                font-family: Noto Sans Mono,Arial,Helvetica;
                font-size: 12px;
                line-height: 16px;
                padding-left: 12px;
            }

            .plus-elements-per-page > label > select {
                min-width: 80px;
                height: 30px;
                cursor: pointer;
                border: 0;
                border-left: 1px solid #d4d4d4;
                color: #6c6c6c;
                font-family: Noto Sans Mono,Arial,Helvetica;
                font-size: 12px;
                font-weight: 400;
                padding-left: 12px;
                margin-right: 12px;
            }

            .plus-hidden-left,
            .plus-hidden-right {
                visibility: hidden;
            }

            @media (max-width: 1691px) {
            .plus-hidden-left {
                display: none;
                }
            }
            
            @media (max-width: 2015px) {
            .plus-hidden-right {
                display: none;
                }
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

        // Generate empty filters
        let emptyFilterLeft = document.createElement('div');
        emptyFilterLeft.classList.add('plus-elements-per-page', 'plus-hidden-left');

        let emptyFilterRight = document.createElement('div');
        emptyFilterRight.classList.add('plus-elements-per-page', 'plus-hidden-right');

        // Generate html
        let htmlElementsPerPage = document.createElement('div');
        htmlElementsPerPage.className = 'plus-elements-per-page';

        let span = document.createElement('span');
        span.innerHTML = "Elements per page";

        let select = document.createElement('select');
        select.id = 'plus-elements-per-page-select';
        availableOptions.forEach(option => {
            select.add(option);
        });
        select.onchange = function () {
            const newPerPageValue = parseInt(this.value);
            if (availablePerPageValues.includes(newPerPageValue)) {
                GM_setValue('elements_per_page', newPerPageValue);
            }
            window.location.reload();
        };

        let label = document.createElement('label');
        label.htmlFor = select.id;

        label.appendChild(span);
        label.appendChild(select);

        htmlElementsPerPage.appendChild(label);

        // Add CSS
        cssElementsPerPageElement = GM_addStyle(cssElementsPerPage);

        // Add html
        const searchFilterBar = 'div[class^="SearchFilterBar__"]';
        const elSearchFilterBar = document.querySelector(searchFilterBar);

        // Callback function to execute when mutations are observed
        const addBarOption = (loadedSearchFilterBar, positionRight) => {
            if (!positionRight) {
                // Add html
                loadedSearchFilterBar.prepend(emptyFilterLeft, htmlElementsPerPage);
                loadedSearchFilterBar.append(emptyFilterRight);
            } else {
                // Add html
                loadedSearchFilterBar.prepend(emptyFilterLeft);
                loadedSearchFilterBar.append(htmlElementsPerPage, emptyFilterRight);
            }
        };

        // if element already present, else wait for load
        if(elSearchFilterBar) {
            addBarOption(elSearchFilterBar, positionRight);
        }
        else {
            GM_wrench.waitForKeyElements(searchFilterBar, (loadedSearchFilterBar) => {
                addBarOption(loadedSearchFilterBar, positionRight);
            });
        }
    }


    /* Advanced Collections */

    function enableAdvancedCollections() {
        document.querySelectorAll('div[class^="CollectThingWindow__closeImageWrapper--"]').forEach(button => button.click());
        addCollectionWindowListener();
    }

    function disableAdvancedCollections() {
        document.querySelectorAll('div[class^="CollectThingWindow__closeImageWrapper--"]').forEach(button => button.click());
        removeCollectionWindowListener();
    }

    function createSpinnerLoadingCSS() {
        const cssToggleSwitch =
            `/* Spinner Loading */

            .plus-spinner-wrapper {
                display: flex;
                position: absolute;
                background: rgba(0,0,0,0.6);
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                align-items: center;
                justify-content: center;
                z-index: 1;
            }

            .plus-spinner-loading {
                background-image: url(https://cdn.thingiverse.com/site/assets/inline-icons/19420d877d0e95abb31b.svg);
                background-repeat: no-repeat;
                background-position: 50%;
                height: 117px;
                width: 117px;
                animation: plus-spin 7s linear infinite;
            }
            @keyframes plus-spin {
                100% {
                    transform:rotate(360deg);
                }
            }`;

        GM_addStyle(cssToggleSwitch);
    }

    function enableSpinnerLoading(target) {
        let spinnerWrapper = document.createElement('div');
        spinnerWrapper.className = 'plus-spinner-wrapper';

        let spinnerLoading = document.createElement('i');
        spinnerLoading.className = 'plus-spinner-loading';

        spinnerWrapper.appendChild(spinnerLoading);

        target.prepend(spinnerWrapper);
    }

    function disableSpinnerLoading(target) {
        let spinnerWrapper = target.querySelector('div.plus-spinner-wrapper');
        spinnerWrapper.remove();
    }

    function loadAdvancedCollections(target) {
        const plusButtonSize = '30px';

        enableSpinnerLoading(target);


        const bearer = extractBearer();

        if (bearer) {
            const username = extractUsername();

            //TODO wait

            getCollections(username, bearer)
                .then(collectionsList => {
                    //console.log('Successfully retrieved Collections.');

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

                    /** just a Workaround to select first option of connections. it automatically selects the last created.*/
                    /* instead use observer.observe to intercept when select changes (visible) and select the correct option  */
                    // Get 'Collect Thing' nodes
                    let collectThingListFirst = Array.from(document.querySelectorAll('a[class^="SideMenuItem__textWrapper"]'))
                        .filter(option => option.innerHTML === 'Collect Thing')
                        .map(option => option.parentNode);

                    let collectThingListBottom = Array.from(document.querySelectorAll('div[class^="CardActionItem__textWrapper--"]'))
                        .filter(option => option.innerHTML === 'Collect Thing')
                        .map(option => option.parentNode.parentNode.parentNode);

                    let collectThingList = collectThingListFirst.concat(collectThingListBottom);

                    collectThingList.forEach(collectButton => {
                        collectButton.onclick = async function () {
                            await sleep(0);
                            selectWrapper.selectedIndex = 0;
                        };
                    });

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    /*** end workaround */

                    let collectWindowBody = target.querySelector('div[class^="CollectThingWindow__collectWindowBody"]');
                    collectWindowBody.style.cssText = 'flex-flow: row wrap;';

                    let bodyTextWrapper = target.querySelector('span[class^="CollectThingWindow__bodyTextWrapper"]');
                    bodyTextWrapper.style.cssText = 'width: 100%;';

                    let selectWrapper = target.querySelector('select[class^="CollectThingWindow__selectWrapper"]');
                    selectWrapper.style.cssText = 'max-width: calc(100% - ' + plusButtonSize + ' - 10px );flex-grow: 1;';

                    // Replace existing option nodes with new ones in all select nodes
                    //selectList.forEach(selectEl => {
                    // Clone nodes
                    const newOptionList = optionList.map(option => option.cloneNode(true));

                    // Replace children
                    selectWrapper.replaceChildren(...newOptionList);
                    selectWrapper.selectedIndex = 0;
                    //TODO if account has no collections select 'create new collection' and trigger selectEl.dispatchEvent(changeEvent);

                    // Generate button that can be used to 'Create new Collection'
                    //TODO generate one button and function outside foreach. Inside just clone button and associate function with current select
                    let plusButton = document.createElement('button');
                    plusButton.style.cssText = 'width: ' + plusButtonSize + '; height: ' + plusButtonSize + ';';
                    plusButton.textContent = '+';
                    plusButton.onclick = function () {
                        selectWrapper.value = '-1';
                        const changeEvent = new Event('change', {
                            bubbles: true
                        });
                        selectWrapper.dispatchEvent(changeEvent);
                    };

                    // Generate span with button
                    let plusButtonSpan = generateSpan(plusButton);

                    // Append created span with button after current select
                    selectWrapper.after(plusButtonSpan);
                    //TODO wait end
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
                .finally(() => {
                    disableSpinnerLoading(target);
                });
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

    function generateSpan(childNode = null) {
        let spanEl = document.createElement('span');
        if (childNode) {
            spanEl.appendChild(childNode);
        }
        return spanEl;
    }

    function addCollectionWindowListener() {
        const config = {attributes: false, childList: true, subtree: true};

        const callback = (mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        node.classList.forEach(cls => {
                            if (cls.startsWith("CollectThingWindow__collectWindowContainer--")) {
                                loadAdvancedCollections(node);
                            }
                        });
                    });
                }
            }
        };

        advancedCollectionObserver = new MutationObserver(callback);
        advancedCollectionObserver.observe(document.body, config);
    }

    function removeCollectionWindowListener() {
        if (typeof advancedCollectionObserver !== 'undefined') {
            advancedCollectionObserver.disconnect();
            advancedCollectionObserver = undefined;
        }
    }


    /* Download All Files */

    function downloadAllFiles() {
        // set cursor to wait
        document.body.classList.add('wait');

        let zip = new JSZip();

        console.log(extractCurrentThing().stripSlashes());
        let thing = JSON.parse(extractCurrentThing().stripSlashes()).thing;

        // Zip thing files
        let files = thing.files;

        files.forEach(file => {
            let filePromise = downloadFile(file.public_url);
            zip.file(file.name, filePromise);
        });

        // Include images
        const includeImages = getConfigStatus(idDownloadAllFiles, idDownloadAllFilesImages);

        if (includeImages) {
            let imgFolder = zip.folder('images');

            let images = thing.images;

            images.forEach(image => {
                let largeImages = image.sizes.filter(el => {
                    return el.type === 'display' &&
                        el.size === 'large';
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
            GM_wrench.waitForKeyElements(sidebarMenuBtnSelector, (loadedDownloadButton) => {
                downloadAllFilesAttach(loadedDownloadButton);
            });
        }
    }

    function downloadAllFilesAttach(button) {
        button.onclick = async function () {
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
            GM_wrench.waitForKeyElements(sidebarMenuBtnSelector, (loadedDownloadButton) => {
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

    String.prototype.stripSlashes = function(){
        return this.replace(/\\(.)/mg, "$1");
    }

    async function downloadFile(url) {
        const response = await fetch(url, {
            method: 'GET'
        }).catch((error) => {
            console.error('Error:', error);
        });

        return response.arrayBuffer();
    }

    function filenameValidator(fname, {replacement = '�'} = {}) {
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
