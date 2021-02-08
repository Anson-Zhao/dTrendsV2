requirejs.config({
    waitSeconds: 0,
    baseUrl: "scripts"
});

requirejs([
    'globeObject'
    , 'dataAll'
    , 'LayerManager'
    , '3rdPartyLibs/Chart-2.9.3.min.js'
    , 'covidPK'
    , 'controls'
    , 'csvData'
    , 'cAgrosPK'
    , 'graphsData'
    , 'Wmslayer'
], function (newGlobe, dataAll, LayerManager, Chart, covidPK, controls, csvD) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));

    let date1 = dataAll.arrDate[0];
    let date2 = dataAll.arrDate[dataAll.arrDate.length - 1];

    if (date1 !== undefined && date2 !== undefined) {
        covidPK([date1.Date, date2.Date], "Confirmed", "init");
        // covidPK([date1.Date, date2.Date], "Deaths", "init");
        // covidPK([date1.Date, date2.Date], "Recoveries", "init");
        // covidPK([date1.Date, date2.Date], "Active Cases", "init");

    }

    let fromDateH = $('#fromdatepicker');
    let toDateH = $('#todatepicker');
    let curDateH = $("#currentdatepicker");

    const firstL = ['Disease Projection', 'Food Security']
    const diseasesecondL = ["COVID-19", "Influenza A", "Influenza B"];
    const foodsecondL = ["Agrosphere", "ECMWF Forecasts", "Sentinel Satellite Data"]
    const thirdL = ["Country", "Crops", "Weather"]

    const influenzaA = [
        "H1N1", "H2N2", "H3N2", "H5N1", "H7N7",
        "H1N2", "H9N2", "H7N2", "H7N3", "H10N7",
        "H7N9", "H6N1", "Not Determined"
    ];
    const influenzaB = [
        "Yamagata",
        "Victoria",
        "Not Determined"
    ];
    const covid19M = [
        "COVID-19",
        "Global Vaccinations"
    ];
    const ecmwf_forecasts = ["Temperature", "Precipitation", "Wind"]
    const dataTypes = ['Country', 'Weather Station'];
    let countryL = [];
    let coviderror;
    let layerSelected, Altitude;
    let j = 0;

    const satellite_data = [
        "Agriculture",
        "False Color (Urban)",
        "False Color (Vegetation)",
        "Geology",
        "Moisture Index",
        "Natural Color (True Color)",
        "NDVI",
        "NDMI",
        "NDWI",
        "SWIR"
    ]
    const NDMI = ['ET_NDMI_Sent2_L1C']
    const NDVI = ["ET_NDVI2",'ET_NDVI_Sent2_L1C']
    const NDWI = ["ET_NDWI_Sent3_OLCI"]
    const MI = ["ET_M1"]
    const SWIR = ["ET_SWIR_Sent2_L1C"]

    const cropsL = [
        'Production',
        'Price',
        'Livestock',
        'Emissions',
        'Pesticides',
        'Fertilizer',
        'Yield'
    ];

    const weatherL = [
        'GraphsandWeather',
        'YearlyTemperature',
        'MonthlyTemperature',
        'YearlyPrecipitation',
        'MonthlyPrecipitation'
    ]



    // for (let i = 0; i < dataTypes.length; i++) {
    //     for (let j = 0; j < csvD[i].length; j++) {
    //         if (dataTypes[i] === 'Country') {
    //             countryL.push(csvD[i][j].country)
    //         } else if (dataTypes[i] === 'Weather Station') {
    //         } else {
    //             console.log("Read layer type in error");
    //         }
    //     }
    // }

    //All the event listeners
    $(document).ready(function () {

        console.log(newGlobe.layers);

        let ls = localStorage.getItem('namespace.visited');
        if (ls == null) {
            alert('Welcome to the A World Bridge COVID Toolkit! ' + "\r\n" +
                'For a better experience, please use Google Chrome as a browser and allow all cookies. ' +
                'If you are experiencing any problems, ' +
                'please try switching a browser or watching the tutorial.');
            localStorage.setItem('namespace.visited', 1)
        }

        if (date1 === undefined || date2 === undefined) {
            alert("Error! Some COVID data wasn't loaded! Functionality may be unavailable.");
            coviderror = true;
            // document.getElementById("dialog").hidden = true;
            // document.getElementById("dialog").style.display = "none";
            // document.getElementById("dialogDateRange").hidden = true;
            // document.getElementById("dialogDateRange").style.display = "none";
        }

        // if (newGlobe.layers.displayName.includes("Weather Station PK") === false && newGlobe.layers.displayName.includes("Country PK") === false){
        //     alert("Error! Agrosphere placemarks and layers couldn't be loaded!")
        // } else if (newGlobe.layers.displayName.includes("Weather Station PK") === false){
        //         //     alert("Error! Agrosphere weather station placemarks couldn't be loaded!")
        // } else if (newGlobe.layers.displayName.includes("Country PK") === false) {
        //     alert("Error! Agrosphere country placemarks couldn't be loaded!")
        // }

        // Initially load accordion menu
        // for (let i = 0; i < firstL.length; i++) {
        //     controls.createFirstLayer(firstL[i]);
        //     if (firstL[i] === 'Disease Projection') {
        //         for (let j = 0; j < diseasesecondL.length; j++) {
        //             controls.createSecondLayer(firstL[i], diseasesecondL[j]);
        //             if (diseasesecondL[j] === "Influenza A") {
        //                 for (let h = 0; h < influenzaA.length; h++) {
        //                     controls.createThirdLayer(firstL[i], diseasesecondL[j], influenzaA[h]);
        //                     // controls.influenza();
        //                 }
        //             } else if (diseasesecondL[j] === "Influenza B") {
        //                 for (let h = 0; h < influenzaB.length; h++) {
        //                     controls.createThirdLayer(firstL[i], diseasesecondL[j], influenzaB[h]);
        //                 }
        //             } else if (diseasesecondL[j] === "COVID-19" || coviderror !== true) {
        //                 for (let h = 0; h < covid19M.length; h++) {
        //                     controls.createThirdLayer(firstL[i], diseasesecondL[j], covid19M[h]);
        //                 }
        //                 // controls.createThirdLayer(firstL[i], diseasesecondL[j], "COVID-19");
        //                 // controls.covid19();
        //             } else {
        //                 alert('Error! Some disease trends layers might not have been created properly. ');
        //                 // throw error
        //             }
        //         }
        //     } else if (firstL[i] === 'Food Security') {
        //         for (let j = 0; j < foodsecondL.length; j++) {
        //             controls.createSecondLayer(firstL[i], foodsecondL[j]);
        //             if (foodsecondL[j] === 'Agrosphere') {
        //                 for (let h = 0; h < thirdL.length; h++) {
        //
        //                     controls.createThirdLayers(firstL[i], foodsecondL[j], thirdL[h]);
        //                     if (thirdL[h] === "Country") {
        //                         // for (let k = 0; k <countryL.length; k++) {
        //                         //     controls.createFourthLayer(firstL[i],foodsecondL[j], thirdL[h],countryL[k]);
        //                         // }
        //                     } else if (thirdL[h] === "Crops") {
        //                         for (let k = 0; k < cropsL.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], thirdL[h], cropsL[k]);
        //                         }
        //                     } else if (thirdL[h] === "Weather") {
        //                         for (let k = 0; k < weatherL.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], thirdL[h], weatherL[k]);
        //                         }
        //                     } else {
        //                         alert('Error! Some Agrosphere layers might not have been created properly. ');
        //                         // throw error
        //                     }
        //                 }
        //             } else if (foodsecondL[j] === 'ECMWF Forecasts') {
        //                 for (let h = 0; h < ecmwf_forecasts.length; h++) {
        //                     controls.createThirdLayer(firstL[i], foodsecondL[j], ecmwf_forecasts[h]);
        //                 }
        //             } else if (foodsecondL[j] === 'Sentinel Satellite Data') {
        //                 for (let h = 0; h < satellite_data.length; h++) {
        //                     // controls.createThirdLayer(firstL[i], foodsecondL[j], satellite_data[h]);
        //
        //                     controls.createThirdLayers(firstL[i], foodsecondL[j], satellite_data[h]);
        //                     if (satellite_data[h] === "Moisture Index") {
        //                         for (let k = 0; k <MI.length; k++) {
        //                             controls.createFourthLayer(firstL[i],foodsecondL[j], satellite_data[h],MI[k]);
        //                         }
        //                     } else if (satellite_data[h] === "SWIR") {
        //                         for (let k = 0; k < SWIR.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], SWIR[k]);
        //                         }
        //                     } else if (satellite_data[h] === "NDWI") {
        //                         for (let k = 0; k < NDWI.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDWI[k]);
        //                         }
        //                     } else if (satellite_data[h] === "NDMI") {
        //                         for (let k = 0; k < NDMI.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDMI[k]);
        //                         }
        //                     } else if (satellite_data[h] === "NDVI") {
        //                         for (let k = 0; k < NDVI.length; k++) {
        //                             controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDVI[k]);
        //                         }
        //                     } else {
        //
        //                     }
        //                 }
        //             } else {
        //                 // throw error
        //                 alert('Error! Some layers might not have been created properly. ');
        //             }
        //         }
        //     } else {
        //         // throw error
        //         alert('Error! Some layers might not have been created properly. ');
        //     }
        // }

        $("#FoodSecurity-Agrosphere").find("input").on("click", function (e) {
            $("#Country-alltoggle").change(function () {
                //Shows/hides menu below, sets country placemarks' layer to .enabled and toggles all the toggles beneath it
                let toggle = this;
                // let countries = document.getElementsByClassName('countries-check');
                let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
                console.log(findLayerIndex)
                // let findPKIndex = newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.enabled === false);
                // console.log(this.value);
                // console.log(toggle.checked);
                if (newGlobe.layers[findLayerIndex] !== undefined) {
                    if (toggle.checked === true) {
                        if (ls=== null) {
                            alert("Agrosphere country placemarks are loading... please be patient")
                        }

                        // console.log('checked');
                        // $(".countries-check").prop("checked", true);
                        // console.log(countries.value);
                        // console.log(countries.checked);
                        // console.log(countries.length)
                        // togglePK(countries.value,true);
                        // console.log(newGlobe.layers)
                        // console.log(findPKIndex);
                        newGlobe.layers[findLayerIndex].enabled = true;
                        // for (let i =0; i <countries.length; i++) {
                        //     let findPKIndex = newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.enabled === false);
                        //     if (findPKIndex !== undefined && findLayerIndex !== undefined) {
                        //         newGlobe.layers[findLayerIndex].renderables[findPKIndex].enabled = true;
                        //     }
                        // }//enables individual placemarks


                        // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","in");
                        // document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'visible';
                        // $("#FoodSecurity-Agrosphere-Country").css("height", "");
                        // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","true");
                        // document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
                    } else if (toggle.checked === false) {
                        // $(".countries-check").prop("checked", false);
                        // console.log(countries.value);
                        // console.log(countries.checked);
                        // togglePK(countries.value,false);
                        // console.log('unchecked');
                        // console.log(newGlobe.layers)
                        // console.log(findLayerIndex);
                        newGlobe.layers[findLayerIndex].enabled = false;

                        // document.getElementById("FoodSecurity-Agrosphere-Country").style.height = '0px';
                        // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","collapsing");
                        // document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'hidden';
                        // document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","collapsing");
                        // document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","in");
                        // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","false");
                        // document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
                    }
                } else {
                    alert("Error! Agrosphere country placemarks are currently unavailable");
                    document.getElementById("Country-alltoggle").disabled = true;
                }

            });
            $("#Weather-alltoggle ").change(function () {
                //Shows/hides menu below, sets weather placemarks' layer to .enabled
                let toggle = this;
                // let countries = document.getElementsByClassName('countries-check');
                let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Weather_Station_PK');
                // console.log(this.value);
                // console.log(toggle.checked);
                if (newGlobe.layers[findLayerIndex] !== undefined) {
                    if (toggle.checked === true) {
                        if (ls=== null) {
                            alert("Agrosphere weather placemarks are loading... please be patient")
                        }

                        // console.log('checked');
                        // $(".countries-check").prop("checked", true);
                        // console.log(countries.value);
                        // console.log(countries.checked);
                        // togglePK(countries.value,true);
                        // console.log(newGlobe.layers)
                        // console.log(findLayerIndex);
                        newGlobe.layers[findLayerIndex].enabled = true;
                        document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class", "in");
                        document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'visible';
                        $("#FoodSecurity-Agrosphere-Weather").css("height", "");
                        document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded", "true");
                    } else if (toggle.checked === false) {
                        // $(".countries-check").prop("checked", false);
                        // console.log(countries.value);
                        // console.log(countries.checked);
                        // togglePK(countries.value,false);
                        // console.log('unchecked');
                        // console.log(newGlobe.layers)
                        // console.log(findLayerIndex);
                        newGlobe.layers[findLayerIndex].enabled = false;
                        document.getElementById("FoodSecurity-Agrosphere-Weather").style.height = '0px';
                        document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'hidden';
                        document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class", "in");
                        document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded", "false");
                    }
                } else {
                    alert("Error! Weather station placemarks are currently unavailable");
                    document.getElementById("Weather-alltoggle").disabled = true;
                }

            });

            $("#Crops-alltoggle ").change(function () {
                //Shows/hides menu below
                let toggle = this;
                let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
                if (newGlobe.layers[findLayerIndex] !== undefined) {
                    if (toggle.checked === true) {

                        document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class", "in");
                        document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'visible';
                        $("#FoodSecurity-Agrosphere-Crops").css("height", "");
                        document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded", "true");
                    } else if (toggle.checked === false) {
                        document.getElementById("FoodSecurity-Agrosphere-Crops").style.height = '0px';
                        document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'hidden';
                        document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class", "in");
                        document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded", "false");
                    }
                } else {
                    alert("Error! Agrosphere country placemarks are currently unavailable");
                    document.getElementById("Crops-alltoggle").disabled = true;
                    document.getElementById("Country-alltoggle").disabled = true;
                }
            });
            // $(".countries-check").change(function(){
            //     let toggle = this;
            //     console.log(this.value);
            //     console.log(this.checked)
            //     togglePK(toggle.value, toggle.checked);
            //     if (toggle.checked === true) {
            //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country " + this.value;
            //     } else {document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "}
            // });
            // console.log('clicked')
        });

        //SentinelSatelliteData

        $("#SentinelSatelliteData").find("input").on("click", function (e) {

            $("#NDVI-alltoggle ").change(function () {
                //Shows/hides menu below
                let toggle = this;
                // let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
                // if (newGlobe.layers[findLayerIndex] !== undefined) {
                    if (toggle.checked === true) {
                        //FoodSecurity-SentinelSatelliteData-NDMI
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").setAttribute("class", "in");
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").style.visibility = 'visible';
                        $("#FoodSecurity-SentinelSatelliteData-NDVI").css("height", "");
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").setAttribute("aria-expanded", "true");
                    } else if (toggle.checked === false) {
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").style.height = '0px';
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").setAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").style.visibility = 'hidden';
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").removeAttribute("class", "collapsing");
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").removeAttribute("class", "in");
                        document.getElementById("FoodSecurity-SentinelSatelliteData-NDVI").setAttribute("aria-expanded", "false");
                    }
                // } else {
                //     alert("Error! Agrosphere country placemarks are currently unavailable");
                //     document.getElementById("Crops-alltoggle").disabled = true;
                //     document.getElementById("Country-alltoggle").disabled = true;
                // }
            });
            $("#NDMI-alltoggle ").change(function () {
                //Shows/hides menu below
                let toggle = this;
                if (toggle.checked === true) {
                    //FoodSecurity-SentinelSatelliteData-NDMI
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").setAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").style.visibility = 'visible';
                    $("#FoodSecurity-SentinelSatelliteData-NDMI").css("height", "");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").setAttribute("aria-expanded", "true");
                } else if (toggle.checked === false) {
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").style.height = '0px';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").setAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").removeAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").removeAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDMI").setAttribute("aria-expanded", "false");
                }
            });
            $("#NDWI-alltoggle ").change(function () {
                //Shows/hides menu below
                let toggle = this;
                if (toggle.checked === true) {
                    //FoodSecurity-SentinelSatelliteData-NDMI
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").setAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").style.visibility = 'visible';
                    $("#FoodSecurity-SentinelSatelliteData-NDWI").css("height", "");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").setAttribute("aria-expanded", "true");
                } else if (toggle.checked === false) {
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").style.height = '0px';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").setAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").removeAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").removeAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-NDWI").setAttribute("aria-expanded", "false");
                }
            });

            $("#SWIR-alltoggle").change(function () {
                //Shows/hides menu below
                let toggle = this;
                if (toggle.checked === true) {
                    //FoodSecurity-SentinelSatelliteData-NDMI
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").setAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").style.visibility = 'visible';
                    $("#FoodSecurity-SentinelSatelliteData-SWIR").css("height", "");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").setAttribute("aria-expanded", "true");
                } else if (toggle.checked === false) {
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").style.height = '0px';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").setAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").removeAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").removeAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-SWIR").setAttribute("aria-expanded", "false");
                }
            });
            $("#MoistureIndex-alltoggle ").change(function () {
                //Shows/hides menu below
                let toggle = this;
                if (toggle.checked === true) {
                    //FoodSecurity-SentinelSatelliteData-NDMI
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").setAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").style.visibility = 'visible';
                    $("#FoodSecurity-SentinelSatelliteData-MoistureIndex").css("height", "");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").setAttribute("aria-expanded", "true");
                } else if (toggle.checked === false) {
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").style.height = '0px';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").setAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").removeAttribute("class", "collapsing");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").removeAttribute("class", "in");
                    document.getElementById("FoodSecurity-SentinelSatelliteData-MoistureIndex").setAttribute("aria-expanded", "false");
                }
            });

            $(".input-NDWI, .input-NDMI, .input-SWIR, .input-NDVI, .input-MoistureIndex").change(function(){
                let toggle = this;
                console.log(this.value);
                console.log(this.checked)
                togglePK(toggle.value, toggle.checked);
                // if (toggle.checked === true) {
                //     document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country " + this.value;
                // } else {document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country"}
            });

            // $("#Country-alltoggle").change(function () {
            //     //Shows/hides menu below, sets country placemarks' layer to .enabled and toggles all the toggles beneath it
            //     let toggle = this;
            //     // let countries = document.getElementsByClassName('countries-check');
            //     let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
            //     console.log(findLayerIndex)
            //     // let findPKIndex = newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.enabled === false);
            //     // console.log(this.value);
            //     // console.log(toggle.checked);
            //     if (newGlobe.layers[findLayerIndex] !== undefined) {
            //         if (toggle.checked === true) {
            //             if (ls=== null) {
            //                 alert("Agrosphere country placemarks are loading... please be patient")
            //             }
            //
            //             // console.log('checked');
            //             // $(".countries-check").prop("checked", true);
            //             // console.log(countries.value);
            //             // console.log(countries.checked);
            //             // console.log(countries.length)
            //             // togglePK(countries.value,true);
            //             // console.log(newGlobe.layers)
            //             // console.log(findPKIndex);
            //             newGlobe.layers[findLayerIndex].enabled = true;
            //             // for (let i =0; i <countries.length; i++) {
            //             //     let findPKIndex = newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.enabled === false);
            //             //     if (findPKIndex !== undefined && findLayerIndex !== undefined) {
            //             //         newGlobe.layers[findLayerIndex].renderables[findPKIndex].enabled = true;
            //             //     }
            //             // }//enables individual placemarks
            //
            //
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","in");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'visible';
            //             // $("#FoodSecurity-Agrosphere-Country").css("height", "");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","true");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
            //         } else if (toggle.checked === false) {
            //             // $(".countries-check").prop("checked", false);
            //             // console.log(countries.value);
            //             // console.log(countries.checked);
            //             // togglePK(countries.value,false);
            //             // console.log('unchecked');
            //             // console.log(newGlobe.layers)
            //             // console.log(findLayerIndex);
            //             newGlobe.layers[findLayerIndex].enabled = false;
            //
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").style.height = '0px';
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","collapsing");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'hidden';
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","collapsing");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","in");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","false");
            //             // document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
            //         }
            //     } else {
            //         alert("Error! Agrosphere country placemarks are currently unavailable");
            //         document.getElementById("Country-alltoggle").disabled = true;
            //     }
            //
            // });
            // $("#Weather-alltoggle ").change(function () {
            //     //Shows/hides menu below, sets weather placemarks' layer to .enabled
            //     let toggle = this;
            //     // let countries = document.getElementsByClassName('countries-check');
            //     let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Weather_Station_PK');
            //     // console.log(this.value);
            //     // console.log(toggle.checked);
            //     if (newGlobe.layers[findLayerIndex] !== undefined) {
            //         if (toggle.checked === true) {
            //             if (ls=== null) {
            //                 alert("Agrosphere weather placemarks are loading... please be patient")
            //             }
            //
            //             // console.log('checked');
            //             // $(".countries-check").prop("checked", true);
            //             // console.log(countries.value);
            //             // console.log(countries.checked);
            //             // togglePK(countries.value,true);
            //             // console.log(newGlobe.layers)
            //             // console.log(findLayerIndex);
            //             newGlobe.layers[findLayerIndex].enabled = true;
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class", "in");
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'visible';
            //             $("#FoodSecurity-Agrosphere-Weather").css("height", "");
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded", "true");
            //         } else if (toggle.checked === false) {
            //             // $(".countries-check").prop("checked", false);
            //             // console.log(countries.value);
            //             // console.log(countries.checked);
            //             // togglePK(countries.value,false);
            //             // console.log('unchecked');
            //             // console.log(newGlobe.layers)
            //             // console.log(findLayerIndex);
            //             newGlobe.layers[findLayerIndex].enabled = false;
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").style.height = '0px';
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class", "collapsing");
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'hidden';
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class", "collapsing");
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class", "in");
            //             document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded", "false");
            //         }
            //     } else {
            //         alert("Error! Weather station placemarks are currently unavailable");
            //         document.getElementById("Weather-alltoggle").disabled = true;
            //     }
            //
            // });
            //
            // $("#Crops-alltoggle ").change(function () {
            //     //Shows/hides menu below
            //     let toggle = this;
            //     let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
            //     if (newGlobe.layers[findLayerIndex] !== undefined) {
            //         if (toggle.checked === true) {
            //
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class", "in");
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'visible';
            //             $("#FoodSecurity-Agrosphere-Crops").css("height", "");
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded", "true");
            //         } else if (toggle.checked === false) {
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").style.height = '0px';
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class", "collapsing");
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'hidden';
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class", "collapsing");
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class", "in");
            //             document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded", "false");
            //         }
            //     } else {
            //         alert("Error! Agrosphere country placemarks are currently unavailable");
            //         document.getElementById("Crops-alltoggle").disabled = true;
            //         document.getElementById("Country-alltoggle").disabled = true;
            //     }
            // });
            // // $(".countries-check").change(function(){
            // //     let toggle = this;
            // //     console.log(this.value);
            // //     console.log(this.checked)
            // //     togglePK(toggle.value, toggle.checked);
            // //     if (toggle.checked === true) {
            // //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country " + this.value;
            // //     } else {document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "}
            // // });
            // // console.log('clicked')
        });

        $("#FoodSecurity--Agrosphere--Country").find("input").on("click", function (e) {
            $(".countries-check").change(function () {
                let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
                let unchecked_num = document.getElementsByClassName('countries-check').checked = false;
                let checked_num = document.getElementsByClassName('countries-check').checked = true;
                let toggle = this;
                // console.log(this.value);
                // console.log(this.checked)
                // console.log(checked_num.length)
                // console.log(unchecked_num.length)


                if (toggle.checked === true) {
                    document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country " + toggle.value;
                    document.getElementById("Country-alltoggle").checked = true;
                    newGlobe.layers[findLayerIndex].enabled = true;

                    let othertoggles = $('#FoodSecurity--Agrosphere--Country').find("input")
                        .not(toggle); //Selects all other toggles besides the one just checked
                    // console.log(othertoggles)//this selects all of the other toggles

                    $('.countries-check').each(function () {
                        let eachothertoggle = this;
                        // //For each other check box under countries in Agrosphere
                        // let other_val = othertoggles.val() //Gets the value of the other toggles
                        // //if the other toggles are not checked, enable the country layer and turn all of the other placemarks on the globe off
                        // if (othertoggles.checked === false) {
                        //     console.log('false');
                        //     if (toggle.checked === true) {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country: " + toggle.value;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         newGlobe.layers[findLayerIndex].enabled = true;
                        //         togglePK(other_val, false); // turns off the other placemarks
                        //     } else {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "
                        //         newGlobe.layers[findLayerIndex].enabled = false;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         // togglePK(other_val, false); // turns off the other placemarks
                        //
                        //     }
                        // } else {
                        //     if (toggle.checked === true) {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country: " + toggle.value;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         // newGlobe.layers[findLayerIndex].enabled = true;
                        //     } else {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "
                        //         document.getElementById("Country-alltoggle").checked= false;
                        //     }
                        // }

                        if (eachothertoggle !== toggle) {
                            eachothertoggle.checked = false;
                            // togglePK(eachothertoggle.value, false);
                        }
                        // console.log(this);//this selects individual checkboxes one by one

                        // if(checked_num.length >= 2) {
                        //     document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
                        //     document.getElementById("Country-alltoggle").checked= false;
                        //     newGlobe.layers[findLayerIndex].enabled = false;
                        // } else {
                        //     eachothertoggle.checked = false;
                        //     togglePK(eachothertoggle.value, false)
                        // }
                    });
                } else {

                    $('.countries-check').each(function () {
                        let eachothertoggle = this;
                        // //For each other check box under countries in Agrosphere
                        // let other_val = othertoggles.val() //Gets the value of the other toggles
                        // //if the other toggles are not checked, enable the country layer and turn all of the other placemarks on the globe off
                        // if (othertoggles.checked === false) {
                        //     console.log('false');
                        //     if (toggle.checked === true) {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country: " + toggle.value;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         newGlobe.layers[findLayerIndex].enabled = true;
                        //         togglePK(other_val, false); // turns off the other placemarks
                        //     } else {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "
                        //         newGlobe.layers[findLayerIndex].enabled = false;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         // togglePK(other_val, false); // turns off the other placemarks
                        //
                        //     }
                        // } else {
                        //     if (toggle.checked === true) {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country: " + toggle.value;
                        //         document.getElementById("Country-alltoggle").checked= true;
                        //         // newGlobe.layers[findLayerIndex].enabled = true;
                        //     } else {
                        //         document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country "
                        //         document.getElementById("Country-alltoggle").checked= false;
                        //     }
                        // }

                        // if (eachothertoggle !== toggle && eachothertoggle.value === false) {
                        //     eachothertoggle.checked = false;
                        //     togglePK(eachothertoggle.value, false);
                        // }
                        if (eachothertoggle !== toggle && eachothertoggle.checked === false) {
                            document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
                            document.getElementById("Country-alltoggle").checked = false;
                            newGlobe.layers[findLayerIndex].enabled = false;
                        }
                        // console.log(this);//this selects individual checkboxes one by one
                    });

                    // if(unchecked_num.length = 0) {
                    //     document.getElementById("FoodSecurity-Agrosphere-Country-a").innerHTML = "Country ";
                    //     document.getElementById("Country-alltoggle").checked= false;
                    //     newGlobe.layers[findLayerIndex].enabled = false;
                    // }
                }

                // togglePK(toggle.value, toggle.checked);
            });
            // console.log('clicked')
        });

        $("#COVID-19-checkbox").on("click", function (e) {
            // controls.covid19();
            // console.log(fromDateH.val())
            fromDateH.val(dataAll.arrDate[0].Date);
            // console.log(fromDateH.val());
            // let toggle = this;
            if (this.checked && coviderror !== true) {
                document.getElementById("COVID-category").disabled = false;
                document.getElementById("datesliderdiv").hidden = false;

                document.getElementById("drawingtools-tab").style.pointerEvents = 'auto';
                document.getElementById("diseasetrends-tab").style.pointerEvents = 'auto';
                document.getElementById("drawingtools-span").classList.remove("disabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("disabled-icon");
                document.getElementById("drawingtools-span").classList.add("enabled-icon");
                document.getElementById("diseasetrends-span").classList.add("enabled-icon");
                openTabLeft(event, 'options_div');
                // alert("Please wait a while for the placemarks to load...")
                // controls.onCategory("Confirmed Cases","Confirmed Cases");
                $( "#slider-range" ).slider( "enable" );
                controls.enableAllCovid();
                controls.updateCurr($("#amount").val());
                // document.getElementById("options_div").visibility = "visible";
                // document.getElementById("continentList").visibility = "visible";
            } else if (this.checked && coviderror === true) {
                alert("COVID placemarks & layers are currently unavailable. ")
                document.getElementById("COVID-19-checkbox").disabled = true;
                this.checked = false;
            } else {
                document.getElementById("COVID-category").disabled = true;
                document.getElementById("datesliderdiv").hidden = true;
                document.getElementById("drawingtools-tab").style.pointerEvents = 'none';
                document.getElementById("diseasetrends-tab").style.pointerEvents = 'none';
                document.getElementById("drawingtools-span").classList.remove("enabled-icon");
                document.getElementById("diseasetrends-span").classList.remove("enabled-icon");
                document.getElementById("drawingtools-span").classList.add("disabled-icon");
                document.getElementById("diseasetrends-span").classList.add("disabled-icon");
                $( "#slider-range" ).slider( "disable" );
                // document.getElementById("drawingtools-tab").style.visibility = 'hidden';
                // document.getElementById("diseasetrends-tab").style.visibility = 'hidden';
                controls.closeAllCovid();
                // document.getElementById("options_div").visibility = "hidden";
                // document.getElementById("continentList").visibility = "hidden";
            }
        });

        $("#FoodSecurity-Agrosphere-Country-a").click(function () {
            let toggle = document.getElementById("Country-alltoggle");
            let findLayerIndex = newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
            if (newGlobe.layers[findLayerIndex] !== undefined) {
                if (toggle.checked === false) {
                    // console.log('checked');
                    newGlobe.layers[findLayerIndex].enabled = true;
                    toggle.checked = true;
                } else if (toggle.checked === true) {
                    toggle.checked = false;
                    // console.log('unchecked');
                    newGlobe.layers[findLayerIndex].enabled = false;
                }
            }
        });

        $('#accordion').find("a").on('click', function (e) {
            let divid = e.target.hash + '';
            let atag = this;
            // let dataParent = atag.getAttribute('data-parent');
            if (atag.id !== 'FoodSecurity-Agrosphere-Country-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-Agriculture-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-FalseColor(Urban)-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-FalseColor(Vegetation)-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-Geology-a' && atag.id !== 'FoodSecurity-SentinelSatelliteData-NaturalColor(TrueColor)-a') {

                document.getElementById(divid.substring(1)).style.visibility = 'visible';

                $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Agriculture-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Urban)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Vegetation)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Geology-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-NaturalColor(TrueColor)-a"))
                    .addClass('collapsed');

                let hrefvalue = $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Agriculture-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Urban)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Vegetation)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Geology-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-NaturalColor(TrueColor)-a"))
                    .attr("href");

                if (hrefvalue !== undefined && hrefvalue !== '#FoodSecurity-Agrosphere' && hrefvalue !== '#FoodSecurity-SentinelSatelliteData') {
                    document.getElementById(hrefvalue.substring(1)).setAttribute("class", "collapsing");
                    document.getElementById(hrefvalue.substring(1)).removeAttribute("class", "collapsing");
                    document.getElementById(hrefvalue.substring(1)).style.visibility = 'hidden';
                    document.getElementById(hrefvalue.substring(1)).removeAttribute("class", "in");
                    document.getElementById(hrefvalue.substring(1)).setAttribute("aria-expanded", "false");
                    document.getElementById(hrefvalue.substring(1)).style.height = '0px';

                }

                $('#accordion').find("a[aria-expanded='true']")
                    .not("a[data-parent='#accordion']")
                    .not(this)
                    .not(document.getElementById(divid.substring(1) + "-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                    .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Agriculture-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Urban)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-FalseColor(Vegetation)-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-Geology-a"))
                    .not(document.getElementById("FoodSecurity-SentinelSatelliteData-NaturalColor(TrueColor)-a"))
                    .attr('aria-expanded', 'false');

            }
        });

        // function buttonControl(toggleOn) {
        //
        //     if (toggleOn) {
        //         // insert the current third layer onto button
        //         currentSelectedLayer.prop('value', layerSelected.ThirdLayer);
        //
        //         //insert current ThirdLayer value to arrMenu
        //         arrMenu.push(layerSelected.ThirdLayer);
        //
        //         j = arrMenu.length - 1; //count
        //
        //         // reset next/previous status with disable/enable
        //         if (arrMenu.length === 1) { //if the length of arrMenu is equal to 1 /if user only checks one switch.
        //             nextL.prop('disabled', true);
        //             previousL.prop('disabled', true);
        //             currentSelectedLayer.prop('disabled', false);
        //         } else {//if user checks more than one switch
        //             previousL.prop('disabled', false);
        //             nextL.prop('disabled', true);
        //         }
        //
        //     } else {
        //
        //         // remove current display ThirdLayer from arrMenu
        //         arrMenu.splice(arrMenu.findIndex(elem => elem === layerSelected.ThirdLayer), 1);
        //
        //         j = arrMenu.length - 1;
        //
        //         // reset next/previous status with disable/enable
        //         if (arrMenu.length === 0) {
        //             currentSelectedLayer.prop('value', 'No Layer Selected');
        //             currentSelectedLayer.prop('disabled', true);
        //             previousL.prop('disabled', true);
        //             nextL.prop('disabled', true);
        //             newGlobe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
        //         } else {
        //             currentSelectedLayer.prop('value', arrMenu[arrMenu.length - 1]);
        //             if (arrMenu.length === 1) {
        //                 nextL.prop('disabled', true);
        //                 previousL.prop('disabled', true)
        //             } else {
        //                 previousL.prop('disabled', false);
        //                 nextL.prop('disabled', true);
        //             }
        //         }
        //     }
        // }

        //Initialize projection menu
        layerManager.createProjectionList();
        $("#projectionDropdown").find(" li").on("click", function (e) {
            layerManager.onProjectionClick(e);
        });

        layerManager.diseaseList();
        layerManager.agrosList();
        layerManager.synchronizeLayerList();
        layerManager.continentList();
        layerManager.categoryList();

        //sets date picker values. when user changes the date, globe will redraw to show the placemarks of current day
        fromDateH.val(dataAll.arrDate[0].Date);
        toDateH.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        curDateH.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        // console.log(dataAll.arrDate[0].Date);
        // console.log(fromDateH.val());

        // //when user changes the date, globe will redraw to show the placemarks of current day
        // curDate.change(function () {
        //     controls.updateCurr(curDate.val());
        // });
        //
        // //when user changes the 'From' date, updates starting date for timelapse
        // fromDate.change(function () {
        //     controls.updateFrom(fromDate.val());
        // });
        // toDate.change(function () {
        //     controls.updateTo(toDate.val());
        // });
        // if (dataAll.arrDate[0] !== undefined) {
        //     fromDate.val(dataAll.arrDate[0].Date);
        // }
        // if (dataAll.arrDate[dataAll.arrDate.length - 1] !== undefined) {
        //     toDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        //     curDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        // }

        //loads initial case numbers
        curDateH.change(function () {
            controls.updateCurr(curDateH.val());
            console.log(curDateH.val());
        });

        // when user changes the 'From' date, updates starting date for timelapse
        fromDateH.change(function () {
            controls.updateFrom(fromDateH.val());
        });
        toDateH.change(function () {
            controls.updateTo(toDateH.val());
        });
        controls.initCaseNum();
        //load slider functionalities
        controls.dateSlider(fromDateH.val());
        // console.log("asdf: ")

        // console.log($.format.date(new Date(toDateH.val()).getTime(), "yyyy-MM-dd"))
        controls.rangeSlider();
        controls.infectionSlider();
        controls.opacitySlider();

        //load dialog boxes for filter options and edit mode
        controls.filterOptionDialog();
        controls.editDialog();

        //overlays sub dropdown menus
        $('.dropdown-submenu a.test').on("click", function (e) {
            $(this).next('ul').toggle();

            e.stopPropagation();
            e.preventDefault();
        })

        controls.subDropdown();

        //sets date picker format; disables all dates without data available
        if (coviderror !== true) {
            flatpickr(".date", {
                defaultDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
                minDate: dataAll.arrDate[0].Date,
                maxDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
                inline: false,
                dateFormat: "Y-m-d",
                time_24hr: true
            });
        }

        $("#popover").popover({html: true, placement: "top", trigger: "hover"});

        //resets the globe to original position and placemarks
        $('#globeOrigin').click(function () {
            controls.enableAllCovid();
            newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));
        });

        //enables all covid placemarks
        $('#refresh').click(function () {
            controls.enableAllCovid();
        });

        //disables all covid placemarks
        $('#clear').click(function () {
            controls.closeAllCovid();
        });

        //enables and disables the navigation controls
        $('#navControls').click(function () {
            controls.onNav();
        })

        // //dropdown menu for diseases and influenzas
        // $("#diseaseDropdown").find("li").on("click", function (e) {
        //     controls.onDiseaseClick(e);
        // });
        //
        // $("#agrosphereDropdown").find("li").on("click", async function (e) {
        //     await controls.onAgrosphereClick(e);
        //     $(".countries-check").click(function(){
        //         let toggle = this;
        //         togglePK(toggle.value, toggle.checked)
        //     });
        // });

        //dropdown menu for placemark category
        $("#categoryList").find("li").on("click", function (e) {
            alert("Please wait a few seconds for the placemarks and layers to load...");
            controls.onCategory(e);
            $( "#slider-range" ).slider( "enable" );
            document.getElementById("COVID-19-checkbox").checked = true;
        });

        //dropdown menu for continent selection
        $("#continentList").find("li").on("click", function (e) {
            controls.onContinent(e);
        });

        //timelapse: start button
        $('#toggleTL').click(function () {
            $('#pauseTL').show();
            $('#toggleTL').hide();
            controls.timelapse(fromDateH.val(),toDateH.val());
        });

        //timelapse: stop button
        $('#stopTL').click(function () {
            controls.clearI();
            $('#playTL').hide();
            $('#pauseTL').hide();
            $('#toggleTL').show();
            curDateH.val(fromDateH.val());
            $("#amount").val(fromDateH.val());
            controls.dateSlider(fromDateH.val());
        });

        //timelapse: pause button
        $('#pauseTL').click(function () {
            $('#pauseTL').hide();
            $('#playTL').show();
            controls.clearI();
        });

        //timelapse: play button
        $('#playTL').click(function () {
            $('#pauseTL').show();
            $('#playTL').hide();
            let a = dataAll.arrDate.findIndex(dat => dat.Date === curDateH.val());
            // console.log(dataAll.arrDate[a + 1].Date);
            controls.timelapse(dataAll.arrDate[a + 1].Date, toDateH.val());
            // controls.pause();
        });


        //first click on date slider prompts filter option popup
        // $("#slider-range").one("click", function () {
        //     $("#filter").click();
        // })

        //far right of date slider overlay; opens dialog when filter is selected
        $('#filter').click(function () {
            $("#dialog").dialog("open");
        });

        //prompts date range adjustments
        $('#edit').click(function () {
            controls.edit();
        })

        $('#fullLoad').click(function () {
            controls.fullLoad();
        })

        //selecting placemark creates pop-up
        newGlobe.addEventListener("click", controls.handleMouseCLK);
        //selecting popover creates pop-up
        document.getElementById("popover").addEventListener("click", controls.handleMouseCLK);
        //hovering over placemark creates pop-up
        newGlobe.addEventListener("mousemove", controls.handleMouseMove);

    });


    function globePosition(request) {
        $.ajax({
            url: '/position',
            type: 'GET',
            dataType: 'json',
            data: request, //send the most current value of the selected switch to server-side
            async: false,
            success: function (results) {
                console.log(results)
                layerSelected = results[0];
                Altitude = layerSelected.Altitude * 1000;
                newGlobe.goTo(new WorldWind.Position(layerSelected.Latitude, layerSelected.Longitude, Altitude));

                // console.log('globePosition');
            }
        })
    }
    async function togglePK(countryN, status) {
        // use countryN to look pk
        // if (countryN !== undefined || status !== undefined) {
        //     let findLayerIndex = await newGlobe.layers.findIndex(ele => ele.displayName === 'Country_PK');
        //     let findPKIndex = await newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.country === countryN);
        //
        //     //turn on/off the pk
        //     if (findPKIndex >= 0) {
        //         newGlobe.layers[findLayerIndex].renderables[findPKIndex].enabled = status;
        //         newGlobe.redraw();
        //
        //         newGlobe.goTo(new WorldWind.Position(
        //             newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.latitude,
        //             newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.longitude,
        //             newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.altitude
        //         ));
        //     }
        // } else {
        //     alert('Error!');
        // }

        if (countryN !== undefined || status !== undefined) {
            let findLayerIndex = await newGlobe.layers.findIndex(ele => ele.displayName === countryN);

            //turn on/off the pk
            if (findLayerIndex >= 0) {
                newGlobe.layers[findLayerIndex].enabled = status;
                newGlobe.redraw();

                let layerRequest =  countryN;
                globePosition(layerRequest);
            }
        } else {
            alert('Error!');
        }

    }
});