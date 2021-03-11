define([
    './globeObject',
    './canvasPKobject',
    './imgPKobject',
    './jquery-csv-1.0.11'
    // ,'./initPL'
], function (newGlobe, canvasPKobject) {
    "use strict";

    let pLayer;

    function covidPK(date, type, flag, countries, continents) {

        // let csvdata = loadCSVData();

        // generatePlacemarkLayer(csvdata);

        if (countries === null && continents == null) {
        }

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/1dData',
            type: 'GET',
            // data: {date: date, countries: countries, continents: continents},
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {

                if (!resp.error) {
                    if (flag !== "init") {
                        // initiated by Home.js
                        // delete all other unnecessary placemarks
                        deletePK();
                    }
                    resp.data.forEach(function (el, i) {
                        if (i === 0) {
                            //create placemark layer
                            pLayer = new WorldWind.RenderableLayer(el.CountryName);
                            pLayer.enabled = true;
                            pLayer.layerType = 'H_PKLayer';
                            pLayer.continent = el.ContinentName;
                            console.log(el.CountryName)
                            console.log(el.ContinentName)
                        }

                        //define colors for the placemarks
                        let colorC = "1 0 0";
                        let colorD = "0 0 0";
                        let colorR = "0.4 1 0.2 ";
                        let colorA = "0.9 0.6 0";

                        //color arrays
                        let cConfirmed = colorC.split(' ');
                        let cDeath = colorD.split(' ');
                        let cRecovered = colorR.split(' ');
                        let cActive = colorA.split(' ');

                        let confirmedPK = new canvasPKobject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                        let deathPK = new canvasPKobject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                        let recoveredPK = new canvasPKobject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                        let activePK = new canvasPKobject(cActive, el.Latitude, el.Longitude, sizePK(el.CaseNum - el.DeathNum - el.RecovNum));

                        confirmedPK.pk.userProperties.Date = el.Date;
                        confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                        confirmedPK.pk.userProperties.dName = el.DisplayName;
                        confirmedPK.pk.userProperties.Number = el.CaseNum;

                        deathPK.pk.userProperties.Date = el.Date;
                        deathPK.pk.userProperties.Type = "Deaths";
                        deathPK.pk.userProperties.dName = el.DisplayName;
                        deathPK.pk.userProperties.Number = el.DeathNum;

                        recoveredPK.pk.userProperties.Date = el.Date;
                        recoveredPK.pk.userProperties.Type = "Recoveries";
                        recoveredPK.pk.userProperties.dName = el.DisplayName;
                        recoveredPK.pk.userProperties.Number = el.RecovNum;

                        activePK.pk.userProperties.Date = el.Date;
                        activePK.pk.userProperties.Type = "Active Cases";
                        activePK.pk.userProperties.dName = el.DisplayName;
                        activePK.pk.userProperties.Number = el.CaseNum - el.DeathNum - el.RecovNum;

                        // disable all the placemarks except requested date
                        if (el.Date === resp.data[resp.data.length - 1].Date) {
                            confirmedPK.pk.enabled = true;
                            deathPK.pk.enabled = false;
                            recoveredPK.pk.enabled = false;
                            activePK.pk.enabled = false;
                        } else {
                            confirmedPK.pk.enabled = false;
                            deathPK.pk.enabled = false;
                            recoveredPK.pk.enabled = false;
                            activePK.pk.enabled = false;
                        }

                        // add current placemark layer onto worldwind layer obj
                        newGlobe.redraw();

                        pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);

                        //add placemarks onto placemark layer
                        if (i !== resp.data.length - 1) {
                            if (el.CountryName !== resp.data[i + 1].CountryName) {
                                // add current placemark layer onto worldwind layer obj
                                newGlobe.addLayer(pLayer);
                                newGlobe.redraw();

                                //create new placemark layer for next country
                                pLayer = new WorldWind.RenderableLayer(resp.data[i + 1].CountryName);
                                pLayer.enabled = true;
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = resp.data[i + 1].ContinentName;
                            }
                        } else {
                            // add current placemark layer onto worldwind layer obj
                            newGlobe.addLayer(pLayer);
                            newGlobe.redraw();
                        }

                    })

                    // let csvdata = loadCSVData();
                    // console.log(csvdata);



                    // newGlobe.addLayer(aLayer);
                    // newGlobe.redraw();
                    // aLayer = new WorldWind.RenderableLayer(imagePK);
                    // aLayer.enabled = true;
                }
            }
        })

    }

    function sizePK(num) {
        let magnitude = 0;
        if (num > 0 && num <= 5) {
            magnitude = 0.05;
        } else if (num > 5 && num <= 25) {
            magnitude = 0.07;
        } else if (num > 25 && num <= 75) {
            magnitude = 0.13;
        } else if (num > 75 && num <= 150) {
            magnitude = 0.17;
        } else if (num > 150 && num <= 250) {
            magnitude = 0.22;
        } else if (num > 250 && num <= 350) {
            magnitude = 0.25;
        } else if (num > 350 && num <= 600) {
            magnitude = 0.28;
        } else if (num > 600 && num <= 1100) {
            magnitude = 0.3;
        } else if (num > 1100 && num <= 2500) {
            magnitude = 0.40;
        } else if (num > 2500 && num <= 7500) {
            magnitude = 0.45;
        } else if (num > 7500 && num <= 11000) {
            magnitude = 0.5;
        } else if (num > 11000) {
            magnitude = 0.6;
        }

        return magnitude
    }

    function deletePK() {
        for (let j = 6; j < newGlobe.layers.length - 1; j++) {
            if (newGlobe.layers[j].layerType === 'H_PKLayer') {
                newGlobe.removeLayer(newGlobe.layers[j]);
            }
        }
    }

    return covidPK;
});

