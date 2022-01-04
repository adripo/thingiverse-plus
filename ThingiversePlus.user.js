// ==UserScript==
// @name         Thingiverse Plus
// @namespace    https://thingiverse.com/
// @version      0.5.0
// @description  Thingiverse with improved functionality
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
(function () {
    'use strict';

    // Global variables
    let cssHideAdsElement;

    // Add Settings Button
    addSettingsButton();

    // Hide ads
    checkAndHideAds();

    // Enable Advanced collections
    checkAndEnableAdvancedCollections();

    const pathname = window.location.pathname;
    if (pathname.startsWith('/thing:')) {
        // Set 6 elements per page in 'More' section
        changeElementsPerPage(6);

        // Enable 'Download All Files' button
        downloadAllFilesButton();
    } else if (pathname == '/' || pathname == '/search') {
        // Append elements per page selector
        appendPerPageSelect();
    }


    /*** FUNCTIONS ***/

    /* Settings Button */

    function addSettingsButton() {
        const buttonImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABCCAYAAAAMlmvWAAAACXBIWXMAAC4jAAAuIwF4pT92AAAG2GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZWRhMmIzZiwgMjAyMS8xMS8xNC0xMjozMDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMi0wMS0wM1QwMzoxMzoyNCswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2YzMWI3NWQtMDZiYy1jMzRhLWIyOGYtZTdlODA2NDc4YjRlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MmE0NjVlNzAtZDg4Ni04MTQzLThmYjItNTcyMWYxZjcyOTM0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWNmYjU5ODctOTJjMi0xODQ4LWI4MzktNGU2YTEzMDA0M2I3Ij4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSIrIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSIrIi8+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6VGV4dExheWVycz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1Y2ZiNTk4Ny05MmMyLTE4NDgtYjgzOS00ZTZhMTMwMDQzYjciIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MTM6MjQrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3ZjMxYjc1ZC0wNmJjLWMzNGEtYjI4Zi1lN2U4MDY0NzhiNGUiIHN0RXZ0OndoZW49IjIwMjItMDEtMDNUMDM6MjM6MDErMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBh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';

        const cssPlusSettings =
            `.plus-settings-button {
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
                background-color: #248bfb;
                overflow: hidden;
                padding: 5px;
                border-radius: 3px;
                box-sizing: content-box;
            }
            
            .plus-settings-hidden {
                max-height: 0;
                max-width: 0;
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
            }`;

        // ThingiversePlus-logo div
        let settingsButton = document.createElement('div');
        settingsButton.className = 'plus-settings-button';

        // ThingiversePlus-logo image
        let img = document.createElement('img');
        img.src = buttonImage;
        img.alt = 'ThingiversePlus-logo';

        img.onclick = function(){
            let settingsContainer = document.querySelector('.plus-settings-container');
            settingsContainer.classList.toggle('plus-settings-hidden');
        };

        settingsButton.appendChild(img);


        // ThingiversePlus settings div
        let settingsContainer = document.createElement('div');
        settingsContainer.classList.add('plus-settings-container')
        settingsContainer.classList.add('plus-hidden');


        // Settings for 'Hide Ads'
        let settingsHideAds = document.createElement('div');
        let checkboxHideAds = document.createElement('input');
        checkboxHideAds.type = 'checkbox';
        checkboxHideAds.id = 'plus-hide-ads';
        //checkboxHideAds.checked = true; //TODO save and get value from local storage
        checkboxHideAds.className = 'plus-settings-checkbox';
        checkboxHideAds.onchange = function(){
            checkAndHideAds();
        };

        let labelHideAds = document.createElement('label');
        labelHideAds.htmlFor = 'plus-hide-ads';
        labelHideAds.innerHTML = 'Hide Ads';

        settingsHideAds.appendChild(checkboxHideAds);
        settingsHideAds.appendChild(labelHideAds);

        settingsContainer.appendChild(settingsHideAds);


        // Settings for 'Advanced Collections'
        let settingsAdvancedCollections = document.createElement('div');
        let checkboxAdvancedCollections = document.createElement('input');
        checkboxAdvancedCollections.type = 'checkbox';
        checkboxAdvancedCollections.id = 'plus-advanced-collections';
        //checkboxAdvancedCollections.checked = true; //TODO save and get value from local storage
        checkboxAdvancedCollections.className = 'plus-settings-checkbox';
        checkboxAdvancedCollections.onchange = function(){
            checkAndEnableAdvancedCollections();
        };

        let labelAdvancedCollections = document.createElement('label');
        labelAdvancedCollections.htmlFor = 'plus-advanced-collections';
        labelAdvancedCollections.innerHTML = 'Advanced Collections';

        settingsAdvancedCollections.appendChild(checkboxAdvancedCollections);
        settingsAdvancedCollections.appendChild(labelAdvancedCollections);

        settingsContainer.appendChild(settingsAdvancedCollections);


        // Append to body
        let body = document.body;

        GM_addStyle(cssPlusSettings);
        body.appendChild(settingsButton);
        body.appendChild(settingsContainer);

    }

    function checkAndHideAds() {
        let checkboxHideAds = document.getElementById('plus-hide-ads');
        if (checkboxHideAds.checked === true) {
            hideAds();
        }
        else {
            unhideAds();
        }
    }

    function checkAndEnableAdvancedCollections() {
        let checkboxAdvancedCollections = document.getElementById('plus-advanced-collections');
        if (checkboxAdvancedCollections.checked === true) {
            enableAdvancedCollections();
        }
        else {
            location.reload();
        }
    }


    /* Hide Ads */

    function hideAds() {
        const cssHideAds =
            `div[class^='AdCard__'] {
                display: none !important;
            }`;

        cssHideAdsElement = GM_addStyle(cssHideAds);
    }

    function unhideAds() {
        if (cssHideAdsElement) {
            cssHideAdsElement.remove();
        }
    }


    /* Instant Download */

    function instantDownload() {
        const thingMatch = window.location.pathname.match(/thing:(\d+)/);
        const thingId = thingMatch[1];

        const sidebarMenuBtnSelector = 'a[class^="SidebarMenu__download--"]';
        const thingPageBtnSelector = 'a[class^="ThingFilesListHeader__download--"]';

        // Sidebar menu download button
        downloadLinkAppend(sidebarMenuBtnSelector, thingId);

        // ThingPage download button
        const thingPageSelector = 'div[class^="ThingPage__tabContent--"]';
        waitForKeyElements(thingPageSelector, (thingPageDiv) => {
            const observer = new MutationObserver(function (mutations) {
                downloadLinkAppend(thingPageBtnSelector, thingId);
            });

            const config = {
                subtree: false,
                childList: true,
                attributes: false,
                characterData: false
            };
            observer.observe(thingPageDiv, config);
        });
    }

    function downloadLinkAppend(selector, thingId) {
        waitForKeyElements(selector, (downloadLink) => {
            const downloadButton = downloadLink.querySelector('div');
            downloadLink.href = `https://www.thingiverse.com/thing:${thingId}/zip`;
            downloadButton.parentNode.replaceChild(downloadButton.cloneNode(true), downloadButton);
        });
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

    function appendPerPageSelect() {
        const availablePerPageValues = [20, 30, 60, 100, 200];

        // Get previously saved value for per_page
        const elementsPerPage = GM_getValue('per_page', 20);
        // Change value of elements per page to load
        changeElementsPerPage(elementsPerPage);

        // Generate CSS
        const cssElementsPerPage =
            `.ElementsPerPage-plus {
                display: inline-block;
                position: relative;
                background-color: #fff;
                width: 300px;
                margin-bottom: 10px;
            }

            .ElementsPerPage-plus > label {
                display: inline-block;
                width: 190px;
                margin-left: 10px;
            }

            .ElementsPerPage-plus > select {
                width: 100px;
                height: 30px;
            }

            div[class^='FilterBySort__dropdown--'] {
                margin-right: 20px;
            }`;

        // Generate options from given values
        let availableOptions = '';
        availablePerPageValues.forEach(value => { //TODO create elements instead of direct text
            availableOptions += '<option value="' + value + '"' + ((elementsPerPage == value) && " selected") + '>' + value + '</option>\n';
        });

        // Generate html
        let htmlElementsPerPage = document.createElement('div');
        htmlElementsPerPage.className = 'ElementsPerPage-plus';
        const perPageSelectId = 'elPerPage';
        htmlElementsPerPage.innerHTML =
            `<label for="` + perPageSelectId + `">Elements per page:</label><select id="` + perPageSelectId + `">
                ` + availableOptions + `
            </select>`;

        // Add CSS
        GM_addStyle(cssElementsPerPage);

        // Add html
        const filterBySortSelector = 'div[class^="FilterBySort__dropdown--"]';
        waitForKeyElements(filterBySortSelector, (filterBySortDiv) => {
            filterBySortDiv.parentNode.insertBefore(htmlElementsPerPage, filterBySortDiv.nextSibling);
        });

        // Create event onChange
        const perPageSelectEl = document.getElementById(perPageSelectId);
        perPageSelectEl.addEventListener('change', (event) => {
            const newPerPageValue = parseInt(event.target.value);
            if (availablePerPageValues.includes(newPerPageValue)) {
                GM_setValue('per_page', newPerPageValue);
            }
            window.location.reload(false);
        });
    }


    /* Advanced Collections */

    function enableAdvancedCollections() {

        const bearer = extractBearer();

        if (bearer) {
            const username = extractUsername();

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
                    let first = true;
                    let optionList = new Array();
                    collectionsList.forEach(collection => {
                        var option = document.createElement('option');
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
                    createNewOption.style = 'display: none;';
                    createNewOption.value = '-1';
                    createNewOption.text = 'Create a new Collection';
                    optionList.push(createNewOption);

                    // Get all select nodes that contains Collections
                    let selectList = Array.from(document.querySelectorAll('.react-app select>option'))
                        .filter(option => option.innerHTML == 'Create a new Collection')
                        .map(option => option.parentNode);



                    /** just a Workaround to select first option of connections. it automatically selects the last created.*/
                    /* instead use observer.observe to intercept when select changes (visible) and select the correct option  */
                    // Get 'Collect Thing' nodes
                    let collectThingListFirst = Array.from(document.querySelectorAll('a[class^="SideMenuItem__textWrapper--"]'))
                        .filter(option => option.innerHTML == 'Collect Thing')
                        .map(option => option.parentNode);

                    let collectThingListBottom = Array.from(document.querySelectorAll('div[class^="CardActionItem__textWrapper--"]'))
                        .filter(option => option.innerHTML == 'Collect Thing')
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
                        var newOptionList = optionList.map(option => option.cloneNode(true));

                        // Replace children
                        selectEl.replaceChildren(...newOptionList);
                        selectEl.selectedIndex = 0;
                        //TODO if account has no collections select 'create new collection' and trigger selectEl.dispatchEvent(changeEvent);

                        // Generate button that can be used to 'Create new Collection'
                        //TODO generate one button and function outside foreach. Inside just clone button and associate function with current select
                        let plusButton = document.createElement('button');
                        plusButton.style = 'width: 16%; height: 30px;';
                        plusButton.textContent = '+';
                        plusButton.onclick = function(){
                            selectEl.value = '-1';
                            var changeEvent = new Event('change', {
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
                })
                .catch((error) => {
                    console.error('Error:', error);
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

        var mostRecent = new Date(collections[0].modified);
        var mostRecentIndex = 0;

        for (var i = 1; i < collections.length; i++) {
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
        let imgFolder = zip.folder('images');

        let thing = JSON.parse(stripDoubleBackslashes(extractCurrentThing())).thing;
        let files = thing.files;

        files.forEach(file => {
            let filePromise = downloadFile(file.direct_url);
            zip.file(file.name, filePromise);
        });

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

        let zipName = thing.id + ' - ' + thing.name;
        zipName = filenameValidator(zipName).fname;

        zip.generateAsync({type: 'blob'})
            .then(function (content) {
                saveAs(content, zipName);

                // set cursor back to normal (remove wait)
                document.body.classList.remove('wait');
            });
    }

    function downloadAllFilesButton() {

        const cssDownloadAllFiles =
            `.wait {
                cursor: wait;
            }`;
        GM_addStyle(cssDownloadAllFiles);



        const sidebarMenuBtnSelector = 'a[class^="SidebarMenu__download--"]';

        // Sidebar menu download button
        waitForKeyElements(sidebarMenuBtnSelector, (downloadLink) => {
            let collectButton = document.querySelector(sidebarMenuBtnSelector);
            collectButton.onclick = async function(){
                downloadAllFiles();
            };
        });
    }

    function extractCurrentThing() {
        try {
            return JSON.parse(window.localStorage['persist:root']).currentThing;
        } catch (e) {
            return null;
        }
    }

    function stripDoubleBackslashes (str) {
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

    function convertToValidFilename(str){
        return (str + '')
            .replace(/\n/g,' ')
            .replace(/[<>:"/\\|?*\x00-\x1F]| +$/g,'')
            .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/,x=>x+'_');
    }

    function filenameValidator(fname, { replacement = '�' } = {}) {
        // https://stackoverflow.com/a/31976060
        // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3

        const fname_original = fname;

        // resolve multi-line, whitespace trimming
        fname = fname.split(/[\r\n]/).map(s => s.trim()).filter(s => s.length).join('  ');

        // forbidden characters
        // (after multi-line, because new-line-chars are themselves forbidden characters)
        fname = fname.replaceAll(/[<>:"\/\\\|?*\x00-\x1F]/g, replacement);

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