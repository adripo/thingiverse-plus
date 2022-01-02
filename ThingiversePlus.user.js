// ==UserScript==
// @name         Thingiverse Plus
// @namespace    https://thingiverse.com/
// @version      0.4.0
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

    // Hide ads
    hideAds();

    // Advanced collections
    advancedCollections();

    const pathname = window.location.pathname;
    if (pathname.startsWith('/thing:')) {
        // Set 6 elements per page in 'More'
        changeElementsPerPage(6);
        // Enable instant download button
        //instantDownload();
        downloadAllFiles();
    } else if (pathname == '/' || pathname == '/search') {
        // Append elements per page selector
        appendPerPageSelect();
    }


    /*** FUNCTIONS ***/

    /* Hide Ads */

    function hideAds() {
        const cssHideAds =
            `div[class^='AdCard__'] {
                display: none !important; 
            }`;

        GM_addStyle(cssHideAds);
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

    function advancedCollections() {

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

        let zip = new JSZip();
        let imgFolder = zip.folder("images");

        let thing = JSON.parse(stripDoubleBackslashes(extractCurrentThing())).thing;
        let files = thing.files;

        files.forEach(file => {
            let filePromise = downloadFile(file.direct_url);
            zip.file(file.name, filePromise);
        });

        let images = thing.images;

        images.forEach(image => {
            let largeImages = image.sizes.filter( el => {
                return el.type=="display" &&
                    el.size=="large";
            });
            let imageUrl = largeImages[0].url;

            let filePromise = downloadFile(imageUrl);
            imgFolder.file(image.name, filePromise);
        });

        let zipName = thing.id + ' ' + thing.name;
        zipName = filenameValidator(zipName).fname;

        zip.generateAsync({type: "blob"})
            .then(function (content) {
                saveAs(content, zipName);
            });
    }

    function extractCurrentThing() {
        try {
            return JSON.parse(window.localStorage['persist:root']).currentThing;
        } catch (e) {
            return null;
        }
    }

    // String.prototype.stripSlashes = function(){
    //     return this.replace(/\\(.)/mg, "$1");
    // }
    function stripDoubleBackslashes (str) {
        return (str + '').replace("\\", "");
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
            .replace(/\n/g," ")
            .replace(/[<>:"/\\|?*\x00-\x1F]| +$/g,"")
            .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/,x=>x+"_");
    }

    function filenameValidator(fname, { replacement = "�" } = {}) {
        // https://stackoverflow.com/a/31976060
        // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3

        const fname_original = fname;

        // resolve multi-line, whitespace trimming
        fname = fname.split(/[\r\n]/).map(s => s.trim()).filter(s => s.length).join("  ");

        // forbidden characters
        // (after multi-line, because new-line-chars are themselves forbidden characters)
        fname = fname.replaceAll(/[<>:"\/\\\|?*\x00-\x1F]/g, replacement);

        // advanced trim
        fname = fname.replace(/\.$/, "");

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

    var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2=/^\./; // cannot start with dot (.)
    var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    return function isValid(fname){
        return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
    }

    /*** ***/

})();