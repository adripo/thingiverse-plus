// ==UserScript==
// @name         Thingiverse Plus
// @namespace    https://thingiverse.com/
// @version      0.1.5
// @description  Thingiverse with improved functionality
// @author       adripo
// @homepage     https://github.com/adripo/thingiverse-plus
// @icon         https://www.thingiverse.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.meta.js
// @downloadURL  https://raw.githubusercontent.com/adripo/thingiverse-plus/main/ThingiversePlus.user.js
// @supportURL   https://github.com/adripo/thingiverse-plus/issues
// @match        https://www.thingiverse.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function ($) {
    'use strict';




    // Hide ads
    let cssHideAds = `
  div[class^='SearchResult__searchResultItems--'] div[class^='AdCard__card--'] {
    display: none;
  }
  `;

    GM_addStyle(cssHideAds);






    // Elements per page

    let elementsPerPage = GM_getValue("per_page", 20);

    let cssElementsPerPage = `
.ElementsPerPage-plus {
    background-color: #fff;
    /*width: 300px;*/
    margin-bottom: 10px;
    position: relative;
    display: inline-block;
}

.ElementsPerPage-plus>label{
    display: inline-block;
    width: 190px;
    margin-left: 10px;
}

.ElementsPerPage-plus>select{
    width: 100px;
    height: 30px;
}

div[class^='FilterBySort__dropdown--'] {
    margin-right: 20px;
}
  `;

    let availablePerPageValues = [20, 30, 60, 100, 200];

    let availableOptions = '';
    $.each(availablePerPageValues, function (key, value) {
        availableOptions += '<option value="' + value + '"' + ((elementsPerPage == value) ? " selected" : "") + '>' + value + '</option>\n';
    });

    let htmlElementsPerPage =
`<div class="ElementsPerPage-plus">
    <label for="ElPerPage">Elements per page:</label><select id="ElPerPage">
    ` + availableOptions + `
    </select>
</div>`;

    GM_addStyle(cssElementsPerPage);

    $("div[class^='FilterBySort__dropdown--']").after(htmlElementsPerPage);

    $('#ElPerPage').change(elPerPageChangeAction);

    function elPerPageChangeAction(e) {
        //todo check value
        GM_setValue("per_page", $(this).val());
        window.location.reload(false);
        //todo save page number and append???
    }



    URLSearchParams.prototype._append = URLSearchParams.prototype.append;
    URLSearchParams.prototype.append = function append(k, v) {
        if (k === 'per_page') v = elementsPerPage;
        return this._append(k, v);
    }







    // Instant download

    /**
     * From https://github.com/CoeJoder/waitForKeyElements.js
     *
     * A utility function for userscripts that detects and handles AJAXed content.
     *
     * Usage example:
     *
     *     function callback(domElement) {
     *         domElement.innerHTML = "This text inserted by waitForKeyElements().";
     *     }
     * 
     *     waitForKeyElements("div.comments", callback);
     *     // or
     *     waitForKeyElements(selectorFunction, callback);
     *
     * @param {(string|function)} selectorOrFunction - The selector string or function.
     * @param {function} callback - The callback function; takes a single DOM element as parameter.
     *                              If returns true, element will be processed again on subsequent iterations.
     * @param {boolean} [waitOnce=true] - Whether to stop after the first elements are found.
     * @param {number} [interval=300] - The time (ms) to wait between iterations.
     * @param {number} [maxIntervals=-1] - The max number of intervals to run (negative number for unlimited).
     */
    function waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals) {
        if (typeof waitOnce === "undefined") {
            waitOnce = true;
        }
        if (typeof interval === "undefined") {
            interval = 300;
        }
        if (typeof maxIntervals === "undefined") {
            maxIntervals = -1;
        }
        var targetNodes = (typeof selectorOrFunction === "function") ?
            selectorOrFunction() :
            document.querySelectorAll(selectorOrFunction);

        var targetsFound = targetNodes && targetNodes.length > 0;
        if (targetsFound) {
            targetNodes.forEach(function (targetNode) {
                var attrAlreadyFound = "data-userscript-alreadyFound";
                var alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false;
                if (!alreadyFound) {
                    var cancelFound = callback(targetNode);
                    if (cancelFound) {
                        targetsFound = false;
                    } else {
                        targetNode.setAttribute(attrAlreadyFound, true);
                    }
                }
            });
        }

        if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
            maxIntervals -= 1;
            setTimeout(function () {
                waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    }


    if (window.location.pathname.startsWith("thing:")){
        const thingMatch = window.location.pathname.match(/thing:(\d+)/);
        const thingId = thingMatch[1];

        waitForKeyElements("a[class*='SidebarMenu__download']", (downloadLink) => {
            const downloadButton = downloadLink.querySelector("div")
            downloadLink.href = `https://www.thingiverse.com/thing:${thingId}/zip`
            downloadButton.parentNode.replaceChild(downloadButton.cloneNode(true), downloadButton);
        })
    }





    // advanced collections



})(jQuery);



/*

  // ==UserScript==
// @name         Thingiverse_Advanced_Collections
// @namespace    https://thingiverse.com/
// @version      0.2
// @description  try to take over the world!
// @author       adripo
// @icon         https://www.thingiverse.com/favicon.ico
// @match        https://www.thingiverse.com/thing:*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js
// @resource     select2CSS https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

// Get external CSS resources
var select2CSS = GM_getResourceText ("select2CSS");
GM_addStyle (select2CSS);

(function ($) {
    "use strict";

    const BEARER = extractBearer();

    if (BEARER) {
        const USERNAME = JSON.parse(window.localStorage["user-data"]).data.name;

        $.ajax({
            url:
                "https://api.thingiverse.com/users/" +
                USERNAME +
                "/collections/true",
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + BEARER);
            },
            data: {},
            success: function () {},
            error: function () {},
        });
        $.ajax({
            type: "GET",
            url:
                "https://api.thingiverse.com/users/" +
                USERNAME +
                "/collections/true",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + BEARER);
            },
            success: function (collectionsList, status) {
                console.log("Success");

                // Put most recent collection in the first place
                let indexMR = indexOfMostRecentCollection(collectionsList);
                if (indexMR != -1) {
                    collectionsList.unshift(
                        collectionsList.splice(indexMR, 1)[0]
                    );
                }

                // Get all selects that contains Collections
                let selectListEls = $(".react-app select>option")
                    .filter(function () {
                        return $(this).html() == "Create a new Collection";
                    })
                    .parent();

                // Remove existing options
                $(selectListEls).children().remove();
                // Add options in each Collection
                console.log(selectListEls);
                $.each(selectListEls, function (key, selectEl) {
                    $.each(collectionsList, function (key, collection) {
                        $(selectEl).append(
                            $("<option></option>")
                                .attr("value", collection.id)
                                .text(
                                    collection.name +
                                        " (" +
                                        collection.count +
                                        ")"
                                )
                        );
                    });
                    $(selectEl).append(
                        $("<option hidden style=\"display:none\"></option>")
                            .attr("value", "-1")
                            .text("Create a new Collection")
                    );

                    // Convert select to select2
                    //$(selectEl).select2();

                    // Default select first option
                    // $(selectHtml).parent().parent().removeClass("CollectThingWindow__hidden--OSA7G")
                    //console.log($(selectHtml).children().first().val());
                    //console.log($(selectHtml).val());
                    //$(selectHtml).children().first().attr("selected","selected");
                    //$(selectHtml).children().first().prop("selected","selected");
                    //$(selectHtml).val("-1");
                    //$(selectHtml).val($(selectHtml).children().first().val());
                    //$(selectHtml).trigger('chosen:updated')

                    // Add new Collection button
                    $(selectEl).css("width", "84%");
                    $(selectEl).after(
                        '<span><button type="button" style="width: 16%; height: 30px;">+</button></span>'
                    );
                    $(selectEl)
                        .siblings("span")
                        .children("button")
                        .on("click", function () {
                            $(selectEl).val("-1");

                            var changeEvent = new Event('change', { bubbles: true });
                            selectEl.dispatchEvent(changeEvent);
                        });
                });

                console.log(collectionsList);
            },
            error: function (xmlRequest) {
                console.log("Error:");
                console.log(xmlRequest);
            },
        });
    }

    function extractBearer() {
        try {
            return JSON.parse(window.localStorage["user-data"]).user;
        } catch (e) {
            return null;
        }
    }

    function indexOfMostRecentCollection(collections) {
        if (collections.length === 0) {
            return -1;
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
})(jQuery);
*/