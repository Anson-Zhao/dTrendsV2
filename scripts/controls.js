define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    , './createPK',
    './createimgPK'
], function (newGlobe, dataAll,csvD, LayerManager, createPK,createimgPK) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);
    let categoryS = "Confirmed Cases";

    let firstLayers =[];
    let secondLayers =[];

    let fromDate = $('.fromdatepicker');
    let toDate = $('.todatepicker');
    let curDate = $("#currentdatepicker");

    let dataTypes = ['Country', 'Weather Station'];
    let countryL = []

    // document.addEventListener("DOMContentLoaded", function(event) {
        //Equivalent to document.ready, does not work on IE8 but is supported by over 98% of browsers
        let parentMenu = document.getElementById("accordion");
    // });

    for (let i = 0; i < dataTypes.length; i++) {
        for (let j = 0; j < csvD[i].length; j++) {
            if (dataTypes[i] === 'Country') {
                countryL.push(csvD[i][j].country)
            } else if (dataTypes[i] === 'Weather Station') {
            } else {
                console.log("Read layer type in error");
            }
        }
    }

    let menuStructure;
    let cropsL = [
        'Production',
        'Price',
        'Livestock',
        'Emissions',
        'Pesticides',
        'Fertilizer',
        'Yield'
    ];
    let weatherL = [
        'GraphsandWeather',
        'YearlyTemperature',
        'MonthlyTemperature',
        'YearlyPrecipitation',
        'MonthlyPrecipitation'
    ];

    let i = 0;
    let l;

    let play = false;

    let numC = 0;
    let numD = 0;
    let numR = 0;
    let numA = 0;

    let speed = false;

    //underinitial load for case numbers
    let initCaseNum = function () {
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == curDate.val()) {
                            if (d.userProperties.Type == "Confirmed Cases") {
                                numC += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Deaths") {
                                numD += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Recoveries") {
                                numR += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Active Cases") {
                                numA += d.userProperties.Number;
                            }
                        }
                    }
                });
            }
            if (index == newGlobe.layers.length - 1) {
                newGlobe.redraw()
            }
        });

        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    }

    //overlays sub dropdown menus over other items
    let subDropdown = function () {
        $(".dropdown").on("show.bs.dropdown", function () {
            let $btnDropDown = $(this).find(".dropdown-toggle");
            let $listHolder = $(this).find(".dropdown-menu");
            let subMenu = $(this).find(".dropdown-submenu");
            let subMenu2 = subMenu.find(".dropdown-menu");
            //reset position property for DD container
            $(this).css("position", "relative");
            $listHolder.css({
                // "top": ($btnDropDown.offset().top + $btnDropDown.outerHeight(true)) + "px",
                // "left": $btnDropDown.offset().left + "px"
            });
            subMenu2.css({
                "left": $listHolder.outerWidth(true) + "px"
            });

            $listHolder.data("open", true);
        });
        //add BT DD hide event
        $(".dropdown").on("hidden.bs.dropdown", function () {
            let $listHolder = $(this).find(".dropdown-menu");
            $listHolder.data("open", false);
        });

        $(".agrotoggle").click(function () {
            let visibility = $("#agrosphere-dropdowndiv").css("visibility");
            let display = $("#agrosphere-dropdowndiv").css("display");
            if (visibility === 'hidden' && display === "none") {
                $("#agrosphere-dropdowndiv").css("visibility", "visible");
                $("#agrosphere-dropdowndiv").css("display", "block");
            } else {
                $("#agrosphere-dropdowndiv").css("visibility", "hidden");
                $("#agrosphere-dropdowndiv").css("display", "none");
            }
        });

        $("#Crops-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#CropsDropdown").css("visibility", "visible");
                $("#CropsDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#CropsDropdown").css("visibility", "hidden");
                $("#CropsDropdown").css("display", "none");
            }
        });

        $("#Countries-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#CountriesDropdown").css("visibility", "visible");
                $("#CountriesDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#CountriesDropdown").css("visibility", "hidden");
                $("#CountriesDropdown").css("display", "none");
            }
        });

        $("#WeatherStations-switch").click(function () {
            if ($(this).is(":checked")) {
                $("#WeatherStationsDropdown").css("visibility", "visible");
                $("#WeatherStationsDropdown").css("display", "block");
            } else if ($(this).is(":not(:checked)")) {
                $("#WeatherStationsDropdown").css("visibility", "hidden");
                $("#WeatherStationsDropdown").css("display", "none");
            }
        });
    }

    //enables placemarks for current date; used when current date is changed based on date picker or date slider
    let updateCurr = function (currentD) {
        //reset case numbers
        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;

        curDate.val(currentD);

        //enables placemark based on the placemark properties current date and type; adds number of cases per category
        newGlobe.layers.forEach(function (elem) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == currentD) {
                            if (d.userProperties.Type === categoryS) {
                                d.enabled = true;
                            } else {
                                d.enabled = false;
                            }
                            if (d.userProperties.Type == "Confirmed Cases") {
                                numC += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Deaths") {
                                numD += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Recoveries") {
                                numR += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Active Cases") {
                                numA += d.userProperties.Number;
                            }
                        } else {
                            d.enabled = false;
                        }
                    }
                })
            }
            newGlobe.redraw()
        });

        //updates text under second right tab containing total case numbers up to current date shown
        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    };

    // //under first left tab; used to switch display between
    // let onDiseaseClick = function (event) {
    //
    //     //grab the selection value
    //     let projectionName = event.target.innerText || event.target.innerHTML;
    //     //refresh the option display
    //     $("#diseaseDropdown").find("button").html(projectionName + ' <span class="caret"></span>');
    //
    //     //insert foodSecurity menu corresponding to the selection
    //     if (projectionName === "COVID-19") {
    //         covid19();
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: ["COVID-19", "Influenza A", "Influenza B"],
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Influenza A') {
    //         influenza();
    //         $("#diseases").css('visibility', 'visible');
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: [
    //                 "H1N1", "H2N2", "H3N2", "H5N1", "H7N7",
    //                 "H1N2", "H9N2", "H7N2", "H7N3", "H10N7",
    //                 "H7N9","H6N1", "Not Determined"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Influenza B') {
    //         $("#diseases").css('visibility', 'visible');
    //         menuStructure = {
    //             accordianID: '#diseases',
    //             Level1: [
    //                 "Yamagata",
    //                 "Victoria",
    //                 "Not Determined"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     }
    // };

    // //under first left tab; used to switch display between
    // let onAgrosphereClick = function (event) {
    //
    //     //grab the selection value
    //     let projectionName = event.target.innerText || event.target.innerHTML;
    //     //refresh the option display
    //     $("#agrosphereDropdown").find("button").html(projectionName + ' <span class="caret"></span>');
    //
    //     //insert foodSecurity menu corresponding to the selection
    //     if (projectionName === "AgroSphere") {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: ["Country", "Crops", "Weather"],
    //             Level2: [countryL, cropsL, weatherL],
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'ECMWF Forecasts') {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: ["Temperature", "Precipitation", "Wind"]
    //         }
    //         accordionMenu(menuStructure);
    //     } else if (projectionName === 'Sentinel Satellite Data') {
    //         menuStructure = {
    //             accordianID: '#foodSecurity',
    //             Level1: [
    //                 "Agriculture",
    //                 "False Color (Urban)",
    //                 "False Color (Vegetation)",
    //                 "Geology",
    //                 "Moisture Index",
    //                 "Natural Color (True Color)",
    //                 "NDVI"
    //             ]
    //         }
    //         accordionMenu(menuStructure);
    //     }
    // };

    //under first left tab; activates COVID-19 display when selected for Disease Projection
    let covid19 = function () {
        // if(document.getElementById('diseases').css.visiblity === 'visible') {
        //     $("#diseases").css('visibility', 'hidden');
        // } else {
        //     $("#diseases").css('visibility', 'visible');
        // }
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            if (layer.layerType === "H_PKLayer") {
                $("#diseases").css('visibility', 'hidden');
                $("#diseases").css('display', 'none');
                layer.enabled = !layer.enabled;
                if (!layer.enabled) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                } else {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }
            }
            if (i === newGlobe.layers.length - 1) {
                layerManager.synchronizeLayerList();
            }
        }
    };

    //under first left tab; activates Influenza A display when selected for Disease Projection
    let influenza = function () {
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            // if (layer.layerType === "H_PKLayer" || layer.layerType === "INA_PKLayer") {
            if (layer.layerType === "INA_PKLayer") {
                layer.enabled = !layer.enabled;
                if (!layer.enabled) {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                } else {
                    layer.enabled = false;
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }

                layerButton.remove();
            }

            if (i === newGlobe.layers.length - 1) {
                layerManager.synchronizeLayerList();
            }
        }
    };

    function createFirstLayer(FirstL) {

        let firstL = FirstL.replace(/\s+/g, '');

        let panelDefault1 = document.createElement("div");
        panelDefault1.className = "Menu panel panel-info " + firstL;

        let panelHeading1 = document.createElement("div");
        panelHeading1.className = "panel-heading";

        let panelTitle1 = document.createElement("h4");
        panelTitle1.className = "panel-title";

        let collapsed1 = document.createElement("a");
        collapsed1.className = "collapsed";
        collapsed1.setAttribute("data-toggle", "collapse");
        collapsed1.setAttribute("data-parent", "#accordion");
        collapsed1.href = "#" + firstL;

        let firstLayerName = document.createTextNode(FirstL + "  ");
        firstLayerName.className = "menuwords";

        let collapseOne = document.createElement("div");
        collapseOne.className = "panel-collapse collapse";
        collapseOne.id = firstL;

        let panelBody1 = document.createElement("div");
        panelBody1.className = "panel-body";

        let panelGroup1 = document.createElement("div");
        panelGroup1.className = "panel-group " + firstL;
        panelGroup1.id = "nested-" + firstL;

        collapsed1.appendChild(firstLayerName);
        panelTitle1.appendChild(collapsed1);
        panelHeading1.appendChild(panelTitle1);
        panelDefault1.appendChild(panelHeading1);
        panelDefault1.appendChild(collapseOne);
        parentMenu.appendChild(panelDefault1);

        panelBody1.appendChild(panelGroup1);
        collapseOne.appendChild(panelBody1);

        // firstLayers.push(firstL);
    }

    function createSecondLayer(FirstL, SecondL) {

        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');

        let panelDefault2 = document.createElement("div");
        panelDefault2.id = secondL;
        panelDefault2.className = "Menu panel panel-info " + secondL + " " + firstL + "-" + secondL;

        let panelHeading2 = document.createElement("div");
        panelHeading2.className = "panel-heading " + firstL + "-" + secondL;

        let panelTitle2 = document.createElement("h4");
        panelTitle2.className = "panel-title " + firstL + "-" + secondL;

        let collapsed2 = document.createElement("a");
        collapsed2.className = "collapsed";
        collapsed2.setAttribute("data-toggle", "collapse");
        collapsed2.setAttribute("data-parent", "#nested");
        collapsed2.href = "#" + firstL + "-" + secondL;

        let secondLayerName = document.createTextNode(SecondL + "  ");
        secondLayerName.className = "menuwords";

        let nested1c1 = document.createElement("div");
        nested1c1.id = firstL + "-" + secondL;
        nested1c1.className = "panel-collapse collapse";

        let panelBody3 = document.createElement("div");
        panelBody3.className = "panel-body " + secondL;
        panelBody3.id = firstL + "--" + secondL;

        let panelGroup2 = document.createElement("div");
        panelGroup2.className = "panel-group " + secondL;
        panelGroup2.id = "nested-" + secondL;

        collapsed2.appendChild(secondLayerName);
        panelTitle2.appendChild(collapsed2);
        panelHeading2.appendChild(panelTitle2);
        panelDefault2.appendChild(panelHeading2);
        panelDefault2.appendChild(nested1c1);

        nested1c1.appendChild(panelBody3);

        // secondLayers.push(panelBody3.id);

        // document.getElementsByClassName("panel-group " + firstL)[0].appendChild(panelDefault2);
        document.getElementById("nested-" + firstL).appendChild(panelDefault2);
    }

    function createThirdLayers(FirstL, SecondL, ThirdL) {

        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');

        let panelDefault3 = document.createElement("div");
        panelDefault3.id = thirdL;
        panelDefault3.className = "Menu panel panel-info " + thirdL + " " + secondL + " " + firstL + "-" + secondL + " " + firstL + "-" + secondL + "-" + thirdL;

        let panelHeading3 = document.createElement("div");
        panelHeading3.className = "panel-heading " + firstL + "-" + secondL + "-" + thirdL;

        let panelTitle3 = document.createElement("h5");
        panelTitle3.className = "panel-title " + firstL + "-" + secondL + "-" + thirdL;

        let collapsed3 = document.createElement("a");
        collapsed3.className = "collapsed";
        collapsed3.setAttribute("data-toggle", "collapse");
        collapsed3.setAttribute("data-parent", "#nested");
        collapsed3.href = "#" + firstL + "-" + secondL + "-" + thirdL;

        let thirdLayerName = document.createTextNode(ThirdL + "  ");
        thirdLayerName.className = "menuwords";

        let nested1c1 = document.createElement("div");
        nested1c1.id = firstL + "-" + secondL + "-" + thirdL;
        nested1c1.className = "panel-collapse collapse";

        let panelBody4 = document.createElement("div");
        panelBody4.className = "panel-body " + thirdL;
        panelBody4.id = firstL + "--" + secondL + "--" + thirdL;

        collapsed3.appendChild(thirdLayerName);
        panelTitle3.appendChild(collapsed3);
        panelHeading3.appendChild(panelTitle3);
        panelDefault3.appendChild(panelHeading3);
        panelDefault3.appendChild(nested1c1);

        nested1c1.appendChild(panelBody4);

        // secondLayers.push(panelBody3.id);

        // document.getElementsByClassName("panel-group " + firstL)[0].appendChild(panelDefault2);
        document.getElementById(firstL + "--" + secondL).appendChild(panelDefault3);
    }

    // function createThirdLayerold(element) {
    //
    //     let thirdReplace = element.ThirdLayer.replace(/\s+/g, '');
    //     let countryNameStr = element.CountryName.replace(/\s+/g, '');
    //     let stateNameStr = element.StateName.replace(/\s+/g, '');
    //     let cityNameStr = element.CityName.replace(/\s+/g, '');
    //
    //     if (thirdReplace !== element.ThirdLayer) {
    //         console.log(thirdReplace);
    //         console.log(element.ThirdLayer);
    //     }
    //
    //     let checkboxDiv = document.createElement("div");
    //     checkboxDiv.className = "Menu " + thirdReplace + " " + countryNameStr + " " + stateNameStr + " " + cityNameStr;
    //     let checkboxH5 = document.createElement("h5");
    //
    //     let checkboxA = document.createElement("a");
    //     let checkAboxAt = document.createTextNode(element.ThirdLayer + "   ");
    //
    //     let checkboxLabel = document.createElement("label");
    //     checkboxLabel.className = "switch right";
    //
    //     let checkboxInput = document.createElement("input");
    //     checkboxInput.type = "checkbox";
    //     checkboxInput.className = element.LayerType + " input";
    //     checkboxInput.setAttribute("value", element.LayerName);
    //
    //     let checkboxSpan = document.createElement("span");
    //     checkboxSpan.className = "slider round";
    //
    //     checkboxA.appendChild(checkAboxAt);
    //     checkboxH5.appendChild(checkboxA);
    //     checkboxLabel.appendChild(checkboxInput);
    //     checkboxLabel.appendChild(checkboxSpan);
    //     checkboxH5.appendChild(checkboxLabel);
    //     checkboxDiv.appendChild(checkboxH5);
    //
    //     // document.getElementsByClassName("panel-body " + element.SecondLayer)[0].appendChild(checkboxDiv);
    //     document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
    // }

    function createThirdLayer(FirstL, SecondL, ThirdL) {
        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');

        let checkboxDiv = document.createElement("div");
        checkboxDiv.className = "Menu "
        let checkboxH4 = document.createElement("h5");
        let checkboxA = document.createElement("a");
        let idname;

        let checkboxLabel = document.createElement("label");
        checkboxLabel.className = "switch right";

        let checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.className = "input";

        let checkboxSpan = document.createElement("span");
        checkboxSpan.className = "slider round";

        // if (FourthL === 'none') {

            let checkboxAt = document.createTextNode(thirdL + "   ");
            checkboxA.className = "menuWords";
            idname = thirdL
            checkboxA.id = idname + '-atag';
            checkboxInput.value = ThirdL;
            checkboxInput.id = idname + '-checkbox';


            checkboxA.appendChild(checkboxAt);
            checkboxH4.appendChild(checkboxA);
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxH4.appendChild(checkboxLabel);
            checkboxDiv.appendChild(checkboxH4);

            // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
            // if (firstL === "No Level1") {
        document.getElementById(firstL + "--" + secondL).appendChild(checkboxDiv);
            // } else {
            //     document.getElementById("nested-" + firstL).appendChild(checkboxDiv);
            // }

        // } else {
        //
        //     let checkboxAt = document.createTextNode(fourthL + "   ");
        //     checkboxA.className = "menuWords";
        //     idname = fourthL;
        //     checkboxA.id = idname + '-atag';
        //
        //     checkboxInput.value = FourthL;
        //
        //     if (ThirdL === "Country") {
        //         checkboxInput.defaultChecked = true;
        //         checkboxInput.className = "input countries-check";
        //         checkboxA.className = "menuWords countries-atag";
        //     }
        //
        //     checkboxA.appendChild(checkboxAt);
        //     checkboxH4.appendChild(checkboxA);
        //     checkboxLabel.appendChild(checkboxInput);
        //     checkboxLabel.appendChild(checkboxSpan);
        //     checkboxH4.appendChild(checkboxLabel);
        //     checkboxDiv.appendChild(checkboxH4);
        //
        //     // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
        //     // if (firstL === "No Level1") {
        //     //     parentMenu.appendChild(checkboxDiv);
        //     // } else {
        //         document.getElementById(firstL + "--" + secondL).appendChild(checkboxDiv);
        //     // }
        // }

    }

    function createFourthLayer(FirstL, SecondL, ThirdL, FourthL = 'none') {
        let firstL = FirstL.replace(/\s+/g, '');
        let secondL = SecondL.replace(/\s+/g, '');
        let thirdL = ThirdL.replace(/\s+/g, '');
        let fourthL = FourthL.replace(/\s+/g, '');

        let checkboxDiv = document.createElement("div");
        checkboxDiv.className = "Menu "
        let checkboxH4 = document.createElement("h5");
        let checkboxA = document.createElement("a");
        let idname;

        let checkboxLabel = document.createElement("label");
        checkboxLabel.className = "switch right";

        let checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.className = "input";

        let checkboxSpan = document.createElement("span");
        checkboxSpan.className = "slider round";

        if (FourthL !== 'none') {
            let checkboxAt = document.createTextNode(fourthL + "   ");
            checkboxA.className = "menuWords";
            idname = fourthL;
            checkboxA.id = idname + '-atag';

            checkboxInput.value = FourthL;

            if (ThirdL === "Country") {
                checkboxInput.defaultChecked = true;
                checkboxInput.className = "input countries-check";
                checkboxA.className = "menuWords countries-atag";
            }

            checkboxA.appendChild(checkboxAt);
            checkboxH4.appendChild(checkboxA);
            checkboxLabel.appendChild(checkboxInput);
            checkboxLabel.appendChild(checkboxSpan);
            checkboxH4.appendChild(checkboxLabel);
            checkboxDiv.appendChild(checkboxH4);

            // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
            // if (firstL === "No Level1") {
            //     parentMenu.appendChild(checkboxDiv);
            // } else {
            document.getElementById(firstL + "--" + secondL + "--" + thirdL).appendChild(checkboxDiv);
            // }

        } else {
            throw error
        }

    }

    // let accordionMenu = function (menuObj) {
    //     let parentMenu = document.getElementById(menuObj.accordianID.replace('#', ''));
    //
    //     //clear previous submenu
    //     $(menuObj.accordianID).empty();
    //
    //     if (!menuObj.Level2) {
    //         //create level one menu
    //         menuObj.Level1.forEach(function (ele) {
    //             menuL2("No Level1", ele)
    //         });
    //     } else {
    //         //create level one menu
    //         menuObj.Level1.forEach(async function (e1, i) {
    //             await menuL1(menuObj.accordianID, e1);
    //             menuObj.Level2[i].forEach(function (e2){
    //                 menuL2(e1, e2);
    //             })
    //         });
    //     }
    //
    //     function menuL1(id, firstL) {
    //         let panelDefault1 = document.createElement("div");
    //         panelDefault1.className = "Menu panel panel-info " + firstL;
    //
    //         let panelHeading1 = document.createElement("div");
    //         panelHeading1.className = "panel-heading";
    //
    //         let panelTitle1 = document.createElement("h5");
    //         panelTitle1.className = "panel-title";
    //
    //         let collapsed1 = document.createElement("a");
    //         collapsed1.className = "collapsed";
    //         collapsed1.setAttribute("data-toggle", "collapse");
    //         collapsed1.setAttribute("data-parent", id);
    //         collapsed1.href = "#" + firstL;
    //
    //         let firstLayerName = document.createTextNode(firstL + "  ");
    //         firstLayerName.className = "menuwords";
    //         let idname = firstL.replace(/\s+/g, '');
    //         firstLayerName.id = idname;
    //
    //         let collapseOne = document.createElement("div");
    //         collapseOne.className = "panel-collapse collapse";
    //         collapseOne.id = firstL;
    //
    //         let panelBody1 = document.createElement("div");
    //         panelBody1.className = "panel-body";
    //
    //         let panelGroup1 = document.createElement("div");
    //         panelGroup1.className = "panel-group " + firstL;
    //         panelGroup1.id = "nested-" + firstL;
    //
    //         collapsed1.appendChild(firstLayerName);
    //         panelTitle1.appendChild(collapsed1);
    //         panelHeading1.appendChild(panelTitle1);
    //         panelDefault1.appendChild(panelHeading1);
    //
    //         panelBody1.appendChild(panelGroup1);
    //         collapseOne.appendChild(panelBody1);
    //         panelDefault1.appendChild(collapseOne);
    //
    //         parentMenu.appendChild(panelDefault1);
    //     }
    //
    //     function menuL2(firstL, secondL) {
    //         let checkboxDiv = document.createElement("div");
    //         checkboxDiv.className = "Menu "
    //
    //         let checkboxH4 = document.createElement("h5");
    //         let checkboxA = document.createElement("a");
    //         let checkboxAt = document.createTextNode(secondL + "   ");
    //         checkboxA.className = "menuWords";
    //         let idname = secondL.replace(/\s+/g, '');
    //         checkboxA.id = idname + '-atag';
    //
    //         let checkboxLabel = document.createElement("label");
    //         checkboxLabel.className = "switch right";
    //
    //         let checkboxInput = document.createElement("input");
    //         checkboxInput.type = "checkbox";
    //         checkboxInput.className = "input";
    //         checkboxInput.value = secondL;
    //
    //         if (firstL === "Country") {
    //             checkboxInput.defaultChecked = true;
    //             checkboxInput.className = "input countries-check";
    //             checkboxA.className = "menuWords countries-atag";
    //         }
    //
    //         let checkboxSpan = document.createElement("span");
    //         checkboxSpan.className = "slider round";
    //
    //         checkboxA.appendChild(checkboxAt);
    //         checkboxH4.appendChild(checkboxA);
    //         checkboxLabel.appendChild(checkboxInput);
    //         checkboxLabel.appendChild(checkboxSpan);
    //         checkboxH4.appendChild(checkboxLabel);
    //         checkboxDiv.appendChild(checkboxH4);
    //
    //         // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
    //         if (firstL === "No Level1") {
    //             parentMenu.appendChild(checkboxDiv);
    //         } else {
    //             document.getElementById("nested-" + firstL).appendChild(checkboxDiv);
    //         }
    //     }
    // };

    //under second left tab, second dropdown menu; used to display layers filtered by cases, deaths, and recoveries
    let onCategory = function (event) {
        //grab the selection value
        categoryS = event.target.innerText || event.target.innerHTML;
        //refresh the option display
        $("#categoryList").find("button").html(categoryS + ' <span class="caret"></span>');

        //reset the button background color according to selection
        if (categoryS === "Confirmed Cases") {
            $("#categoryList").find("button").css("background-color", "red");
            $("#titleCategory").text("Highest Infections (lowest to highest)");
        } else if (categoryS === "Deaths") {
            $("#categoryList").find("button").css("background-color", "black");
            $("#titleCategory").text("Highest Deaths (lowest to highest)");
        } else if (categoryS === "Recoveries") {
            $("#categoryList").find("button").css("background-color", "#7cfc00");
            $("#titleCategory").text("Highest Recoveries (lowest to highest)");
        } else if (categoryS === "Active Cases") {
            $("#categoryList").find("button").css("background-color", "#F9910A");
            $("#titleCategory").text("Highest Active Cases (lowest to highest)");
        }

        //turn off all the placemarks, and then turn on selected placemarks
        //locate placemarks by accessing renderables member in placemark layers
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer && elem.layerType !== "Country_Placemarks" && elem.layerType !== 'Weather_Station_Placemarks') {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Type == categoryS) {
                            d.enabled = true;
                            // console.log(d)
                        } else {
                            d.enabled = false;
                        }
                    }
                });
            }
            if (index == newGlobe.layers.length - 1) {
                newGlobe.redraw()
            }
        });
    };

    //under second left tab, third dropdown menu; used to display all countries/layers in that continent
    let onContinent = function (event) {
        //grab the continent value when selected by user.
        let continentS = event.target.innerText || event.target.innerHTML;

        //refresh the option display
        $("#continentList").find("button").html(continentS + ' <span class="caret"></span>');

        let letLong = [
            {cont: 'North America', lat: 40.7306, long: -73.9352},
            {cont: 'South America', lat: -14.235, long: -51.9253},
            {cont: 'Asia', lat: 30.9756, long: 112.2707},
            {cont: 'Europe', lat: 51, long: 9},
            {cont: 'Africa', lat: 9.082, long: 8.6753},
            {cont: 'Oceania', lat: -37.8136, long: 144.9631},
            {cont: 'All Continents', lat: 30.9756, long: 112.2707}
        ];

        //turn off all the placemark layers, and then turn on the layers with continent name selected.
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.continent !== continentS) {
                    if (continentS == 'All Continents') {
                        elem.hide = false;
                        elem.enabled = true;
                    } else {
                        elem.hide = true;
                        elem.enabled = false;
                    }
                } else {
                    elem.hide = false;
                    elem.enabled = true;
                }
            }

            // refreshed the menu buttoms
            if (index == newGlobe.layers.length - 1) {
                //navigate the globe to the continent
                letLong.some(function (c) {
                    if (c.cont == continentS) {
                        newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                        return true
                    }
                })

                layerManager.synchronizeLayerList();
            }
        })
    };

    //under second left tab; controls display of navigation tools
    let onNav = function () {
        if (newGlobe.layers[2].enabled === true && newGlobe.layers[4].enabled === true) {
            $('#navControls').css("background-color", "transparent");
            newGlobe.layers[2].enabled = false;
            newGlobe.layers[4].enabled = false;
        } else if (newGlobe.layers[2].enabled === false && newGlobe.layers[4].enabled === false) {
            $('#navControls').css("background-color", "#0db9f0");
            newGlobe.layers[2].enabled = true;
            newGlobe.layers[4].enabled = true;
        }
    }

    //under third left tab; plays a timelapse of the placemarks over the course of a set date range
    let timelapse = function () {
        l = setInterval(function () {
            if (!play) {
                //updates current date picker and date slider
                curDate.val(dataAll.arrDate[i].Date);
                let val = new Date(dataAll.arrDate[i].Date).getTime() / 1000;
                $("#slider-range").slider("value", val);
                $("#amount").val(dataAll.arrDate[i].Date);

                //enables placemark based on the user properties date and type
                newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer) {
                        elem.renderables.forEach(function (d) {
                            if (d instanceof WorldWind.Placemark) {
                                if (d.userProperties.Date === dataAll.arrDate[i].Date) {
                                    if (d.userProperties.Type === categoryS) {
                                        d.enabled = true;
                                    } else {
                                        d.enabled = false;
                                    }
                                } else {
                                    d.enabled = false;
                                }
                            }
                        })
                    }
                    newGlobe.redraw()
                });

                i++;

                //when date reaches 'To' date aka end of date range, stop animation
                if (toDate.val() === dataAll.arrDate[i].Date) {
                    curDate.val(dataAll.arrDate[i].Date);

                    $('#pauseTL').hide();
                    $('#toggleTL').show();

                    clearI();
                }
            }


        }, 1000)
    };

    //used for timelapse function; pauses/plays animation without restarting from the beginning of timelapse
    let pause = function () {
        play = !play;
    };

    //clears timelapse interval
    let clearI = function () {
        clearInterval(l);
    }

    //under third left tab; used to update placemarks shown based on filter boundaries
    let updateHIS = function (v1, v2) {
        let sortLayers = [];

        //enables placemark based on the placemark properties current date and type
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == curDate.val()) {
                            if (d.userProperties.Type === categoryS) {
                                sortLayers.push(d);
                                d.enabled = true;
                            } else {
                                d.enabled = false;
                            }
                        } else {
                            d.enabled = false;
                        }
                    }
                })
            }
            newGlobe.redraw()
        });

        //sorts all enabled placemarks based on case number from least to greatest
        sortLayers.sort(function (a, b) {
            if (a.userProperties.Number === b.userProperties.Number) {
                return 0;
            }
            if (a.userProperties.Number > b.userProperties.Number) {
                return 1;
            } else {
                return -1;
            }
        })

        //based on boundaries set using the filter slider, the placemarks are enabled or disabled
        for (let k = 0; k < sortLayers.length; k++) {
            if (k >= v1 && k <= v2) {
                sortLayers[k].enabled = true;
            } else {
                sortLayers[k].enabled = false;
            }
        }
    }

    //under third left tab; changes starting date for timelapse when 'From' date is changed
    let onFrom = function () {
        for (let j = 0; j < dataAll.arrDate.length - 1; j++) {
            if (dataAll.arrDate[j].Date === fromDate.val()) {
                i = j;
            }
        }
    };

    //under third left tab; filter slider for lowest to highest infections
    let infectionSlider = function () {
        $("#hInfectionSlider").slider({
            min: 0,
            max: 320,
            values: [0, 320],
            slide: function (event, ui) {
                //updates text
                $("#hInfectionsValue").text(ui.values[0] + " to " + ui.values[1] + " Locations");

                //updates placemarks displayed based on infection slider range
                updateHIS(ui.values[0], ui.values[1]);
            }
        });
        //display current numbers for locations shown
        $("#hInfectionsValue").text($("#hInfectionSlider").slider("values", 0) + " to " + $("#hInfectionsSlider").slider("values", 1) + " Locations");
    }

    //under third left tab; surface opacity slider
    let opacitySlider = function () {
        $("#opacitySlider").slider({
            value: 100,
            animate: true,
            slide: function (event, ui) {
                //updates text
                $("#opacitySliderValue").text(ui.value + "% opacity");
            },
            stop: function (event, ui) {
                //when user releases mouse, sets opacity to that percentage
                setOpacity(ui.value / 100);
            }
        });
    }

    //sets surface opacity
    let setOpacity = function (value) {
        newGlobe.Opacity = value;
        newGlobe.surfaceOpacity = newGlobe.Opacity;
    };

    //date slider
    let dateSlider = function () {
        $("#slider-range").slider({
            min: new Date(fromDate.val()).getTime() / 1000,
            max: new Date(toDate.val()).getTime() / 1000,
            step: 86400,
            value: new Date(toDate.val()).getTime() / 1000,
            slide: function (event, ui) {
                //updates text

                $("#amount").val($.format.date(ui.value * 1000, "yyyy-MM-dd"));

                //update current placemark display based on slider/current date
                updateCurr($("#amount").val());

                //update filter boundaries with changes in date
                updateHIS($('#hInfectionSlider').slider('values', 0), $('#hInfectionSlider').slider('values', 1));
            }
        });
        //display current date
        curDate.val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));
        $('#amount').val($.format.date(new Date($("#slider-range").slider("value") * 1000), "yyyy-MM-dd"));
    };

    //range slider; sets date range for date slider
    let rangeSlider = function () {
        $("#doubleSlider-range").slider({
            min: new Date(fromDate.val()).getTime() / 1000,
            max: new Date(toDate.val()).getTime() / 1000,
            step: 86400,
            values: [new Date(fromDate.val()).getTime() / 1000, new Date(toDate.val()).getTime() / 1000],
            slide: function (event, ui) {
                //updates text
                $("#amount2").val($.format.date(ui.values[0] * 1000, "yyyy-MM-dd") + " to " + $.format.date(ui.values[1] * 1000, "yyyy-MM-dd"));

                //updates date slider; date range, value, text
                $('#slider-range').slider("option", "min", $("#doubleSlider-range").slider("values", 0));
                $('#slider-range').slider("option", "max", $("#doubleSlider-range").slider("values", 1));
                $('#slider-range').slider("option", "value", $("#doubleSlider-range").slider("values", 1));
                $('#amount').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));

                //updates date range pickers
                $('.filterFrom').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd"));
                $('.filterTo').val($.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
            }
        });
        //display current date range
        $('#amount2').val($.format.date(new Date($("#doubleSlider-range").slider("values", 0) * 1000), "yyyy-MM-dd") + " to " + $.format.date(new Date($("#doubleSlider-range").slider("values", 1) * 1000), "yyyy-MM-dd"));
    };

    //edit function to prompt date range adjustments
    let edit = function () {
        if ($('#edit').hasClass('edit-mode')) {
            $("#dialogDateRange").dialog("open");
            $('#edit').removeClass('edit-mode');
            $('#edit').css('background-color', 'transparent');
            $('#labelRangeSlider').css('display', 'none');
            $('#labelSlider').css('display', 'inline-block');
            $('#doubleSlider-range').css('display', 'none');
            $('#amount2').css('display', 'none');
            $('#slider-range').css('display', 'block');
            $('#amount').css('display', 'inline-block');
        } else {
            $('#edit').addClass('edit-mode');
            $('#edit').css('background-color', '#55d2d5');
            $('#labelRangeSlider').css('display', 'inline-block');
            $('#labelSlider').css('display', 'none');
            $('#doubleSlider-range').css('display', 'block');
            $('#amount2').css('display', 'inline-block');
            $('#slider-range').css('display', 'none');
            $('#amount').css('display', 'none');
        }
    }

    //overrides user changes in filter option dialog box; sets date range to max range, continents to all
    let fullLoad = function () {
        if ($('input#fullLoad').is(':checked')) {
            $('.filterFrom').val(dataAll.arrDate[0].Date);
            $('.filterTo').val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
            $('.filterFrom, .filterTo').css('background-color', 'lightgray');
            $('.filterFrom, .filterTo').prop('disabled', true);
            $('#filterContinents').val('all_continents');
            $('#filterContinents').prop('disabled', true);
        } else {
            $('.filterFrom, .filterTo').css('background-color', 'white');
            $('.filterFrom, .filterTo').prop('disabled', false);
            $('#filterContinents').prop('disabled', false);
        }
    }

    //dialog box for filter options for date slider; contains date range picker, continent selector, and full load option
    let filterOptionDialog = function () {
        $("#dialog").dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Apply": function () {
                    speed = true;

                    //changes dates across all date range pickers
                    $('#drFrom').val($("#foFrom").val());
                    $('#drTo').val($("#foTo").val());

                    //changes date slider value range
                    $('#slider-range').slider("values", 0) === new Date($('#foFrom').val()).getTime() / 1000;
                    $('#slider-range').slider("values", 1) === new Date($('#foTo').val()).getTime() / 1000;
                    $("#amount2").val($('#foFrom').val() + " to " + $('#foTo').val());

                    //changes date slider min and max valuesm current value, and text display
                    $('#slider-range').slider("option", "min", new Date($('#foFrom').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "max", new Date($('#foTo').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "value", new Date($('#foTo').val()).getTime() / 1000);
                    $('#amount').val($('#foTo').val());

                    //creates placemarks based on range selected
                    if (speed) {
                        console.log("fast");
                        createPK([$('#foFrom').val(), $('#foTo').val()], categoryS, "not init", $('#filterContinents').val());
                    }

                    //ensures date slider is shown and range slider is hidden; edit mode is closed
                    $('#edit').removeClass('edit-mode');
                    $('#edit').css('background-color', 'transparent');
                    $('#labelRangeSlider').css('display', 'none');
                    $('#labelSlider').css('display', 'inline-block');
                    $('#doubleSlider-range').css('display', 'none');
                    $('#amount2').css('display', 'none');
                    $('#slider-range').css('display', 'block');
                    $('#amount').css('display', 'inline-block');

                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    }

    //dialog box for edit mode for date slider; contains date range picker
    let editDialog = function () {
        $("#dialogDateRange").dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Confirm": function () {
                    speed = true;
                    //changes dates across all date range pickers
                    $('#foFrom').val($("#drFrom").val());
                    $('#foTo').val($("#drTo").val());

                    //changes date slider value range
                    $('#slider-range').slider("values", 0) === new Date($('#drFrom').val()).getTime() / 1000;
                    $('#slider-range').slider("values", 1) === new Date($('#drTo').val()).getTime() / 1000;
                    $("#amount2").val($('#drFrom').val() + " to " + $('#drTo').val());

                    //changes date slider min and max valuesm current value, and text display
                    $('#slider-range').slider("option", "min", new Date($('#drFrom').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "max", new Date($('#drTo').val()).getTime() / 1000);
                    $('#slider-range').slider("option", "value", new Date($('#drTo').val()).getTime() / 1000);
                    $('#amount').val($('#drTo').val());

                    //creates placemarks based on range selected
                    if (speed) {
                        console.log("fast");
                        createPK([$('#foFrom').val(), $('#foTo').val()], categoryS, "not init", $('#filterContinents').val());
                    }

                    $(this).dialog("close");
                },
                Cancel: function () {
                    //edit mode remains active
                    $('#edit').addClass('edit-mode');
                    $('#edit').css('background-color', '#55d2d5');
                    $('#labelRangeSlider').css('display', 'inline-block');
                    $('#labelSlider').css('display', 'none');
                    $('#doubleSlider-range').css('display', 'block');
                    $('#amount2').css('display', 'inline-block');
                    $('#slider-range').css('display', 'none');
                    $('#amount').css('display', 'none');
                    $(this).dialog("close");
                }
            }
        });
    }

    //on clicking placemark
    let handleMouseCLK = function (e) {
        let x = e.clientX,
            y = e.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickListCLK.objects.forEach(function (value) {
            let pickedPM = value.userObject;
            if (pickedPM instanceof WorldWind.Placemark && pickedPM.layer.displayName !== 'Country_Placemarks' && pickedPM.layer.displayName !== 'Weather_Station_Placemarks') {
                sitePopUp(pickedPM);
                console.log(pickedPM)
            }
        })
    }

    //pop-up content
    let sitePopUp = function (PM) {
        let popupBodyItem = $("#popupBody");
        //clears pop-up contents
        popupBodyItem.children().remove();

        //inserts title and discription for placemark
        let popupBodyName = $('<p class="site-name"><h4>' + PM.userProperties.dName + '</h4></p>');
        let popupBodyDesc = $('<p class="site-description">' + "Total Cases = Active + Deceased + Recoveries" + '</p><br>');
        let br = $('<br><br>');

        //tab buttons for different date ranges for chart data shown
        let button0 = document.createElement("button");
        button0.id = button0.value = "1";
        button0.textContent = "Current";
        button0.className = "chartsB";
        button0.onclick = function () {
            chartDFun(button0, PM)
        };
        let button1 = document.createElement("button");
        button1.id = button1.value = "7";
        button1.textContent = "Past 7 Days";
        button1.className = "chartsB";
        button1.onclick = function () {
            chartDFun(button1, PM)
        };
        let button2 = document.createElement("button");
        button2.id = button2.value = "14";
        button2.textContent = "Past 2 Weeks";
        button2.className = "chartsB";
        button2.onclick = function () {
            chartDFun(button2, PM)
        };
        let button3 = document.createElement("button");
        button3.id = button3.value = "30";
        button3.textContent = "Past 1 Month";
        button3.className = "chartsB";
        button3.onclick = function () {
            chartDFun(button3, PM)
        };
        let button4 = document.createElement("button");
        button4.id = button4.value = "63";
        button4.textContent = "Past 2 Months";
        button4.className = "chartsB";
        button4.onclick = function () {
            chartDFun(button4, PM)
        };

        popupBodyItem.append(popupBodyName);
        popupBodyItem.append(popupBodyDesc);
        popupBodyItem.append(button0);
        popupBodyItem.append(button1);
        popupBodyItem.append(button2);
        popupBodyItem.append(button3);
        popupBodyItem.append(button4);
        popupBodyItem.append(br);

        let modal = document.getElementById('popupBox');
        let span = document.getElementById('closeIt');

        if (PM.userProperties.dName !== 'undefined') {
            modal.style.display = "block";

            span.onclick = function () {
                modal.style.display = "none";
            };

            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            }

        }


        //load chart data
        button0.click();
    }

    let chartDFun = function (objButton, PM) {
        // get button value to reset chart duration time
        let pDate = dataAll.arrDate[dataAll.arrDate.length - 1].Date;
        let d0 = new Date("" + pDate + "")
        let dFrom = $.format.date(d0.setDate(d0.getDate() - objButton.id + 1), "yyyy-MM-dd");
        let dTo = dataAll.arrDate[dataAll.arrDate.length - 1].Date;

        // disable this button and enable previous button disabled
        $(".chartsB").prop('disabled', false);
        $("#" + objButton.value).prop('disabled', true);
        $("#chartText").html(objButton.textContent);

        // set label date value
        let lArr = [];
        let d1 = new Date("" + pDate + "");

        //label creation
        if (objButton.value === "1") {
            lArr.push(pDate);
        } else if (objButton.value === "7") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 5), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "14") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 12), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "30") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 26), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        } else if (objButton.value === "63") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 61), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                , $.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        }

        // refresh the chart canvas and data
        let cCanvas = document.getElementById("stackedChart");
        if (!!cCanvas) {
            cCanvas.remove();
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        } else {
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        }

        let ctx = cCanvas.getContext('2d');
        let popupBody = $("#popupBody");
        popupBody.append(cCanvas);

        //retrieves data for chart
        $.ajax({
            url: '/chartData',
            type: 'GET',
            data: {dateFrom: dFrom, dateTo: dTo, dName: PM.userProperties.dName,},
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    let dArr = [];
                    let rArr = [];
                    let aArr = [];

                    for (i = 0; i < resp.data.length - 1; i++) {
                        dArr.push(resp.data[i].DeathNum);
                        rArr.push(resp.data[i].RecovNum);
                        aArr.push(resp.data[i].CaseNum - resp.data[i].DeathNum - resp.data[i].RecovNum);
                    }

                    let myChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: lArr,
                            datasets: [
                                {
                                    label: 'Active Cases',
                                    backgroundColor: "#45c498",
                                    data: aArr,
                                }, {
                                    label: 'Deceased',
                                    backgroundColor: "#ead04b",
                                    data: dArr,
                                }, {
                                    label: 'Recoveries',
                                    backgroundColor: "#035992",
                                    data: rArr,
                                }],
                        },
                        options: {
                            tooltips: {
                                displayColors: true,
                                callbacks: {
                                    mode: 'x',
                                },
                            },
                            scales: {
                                xAxes: [{
                                    stacked: true,
                                    gridLines: {
                                        display: false,
                                    }
                                }],
                                yAxes: [{
                                    stacked: true,
                                    ticks: {
                                        beginAtZero: true,
                                    },
                                    type: 'linear',
                                }]
                            },
                            responsive: true,
                            maintainAspectRatio: true,
                            legend: {position: 'bottom'},
                        }
                    })
                }
            }
        });
    }

    //enables all layers; if layer is disabled, force enable it
    function enableAllToggle() {
        for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            console.log(layer)
            // layer.enabled = true;
            let layerButton = $('#' + layer.displayName + '');
            if (layer.displayName !== "TL") {
                layer.enabled = true;
                if (!layerButton.hasClass("active")) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                }
            }


        }

    }

    //disables all layers; if layer is enabled, force disable it
    function closeAllToggle() {
        for (let i = 8, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            layer.enabled = false;
            let layerButton = $('#' + layer.displayName + '');
            if (layer.displayName !== "TL") {
                if (layerButton.hasClass("active")) {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }
            }
        }

    }

    return {
        initCaseNum,
        subDropdown,
        updateCurr,
        // onDiseaseClick,
        // onAgrosphereClick,
        onCategory,
        onContinent,
        onNav,
        timelapse,
        pause,
        clearI,
        updateHIS,
        onFrom,
        infectionSlider,
        opacitySlider,
        dateSlider,
        rangeSlider,
        edit,
        fullLoad,
        filterOptionDialog,
        editDialog,
        handleMouseCLK,
        enableAllToggle,
        closeAllToggle,
        createFirstLayer,
        createSecondLayer,
        createThirdLayer,
        createThirdLayers,
        createFourthLayer,
        covid19,
        influenza
    }
})