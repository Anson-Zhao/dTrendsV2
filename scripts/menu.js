requirejs([
    'controls'
], function (controls) {
    "use strict";

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
    const NDMI = ['Covid19_SH:ET_NDMI_Sent2_L1C']
    const NDVI = ["Covid19_SH:ET_NDVI2",'Covid19_SH:ET_NDVI_Sent2_L1C']
    const NDWI = ["Covid19_SH:ET_NDWI_Sent3_OLCI"]
    const MI = ["Covid19_SH:ET_M1"]
    const SWIR = ["Covid19_SH:ET_SWIR_Sent2_L1C"]

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

        // Initially load accordion menu
        for (let i = 0; i < firstL.length; i++) {
            controls.createFirstLayer(firstL[i]);
            if (firstL[i] === 'Disease Projection') {
                for (let j = 0; j < diseasesecondL.length; j++) {
                    controls.createSecondLayer(firstL[i], diseasesecondL[j]);
                    if (diseasesecondL[j] === "Influenza A") {
                        for (let h = 0; h < influenzaA.length; h++) {
                            controls.createThirdLayer(firstL[i], diseasesecondL[j], influenzaA[h]);
                            // controls.influenza();
                        }
                    } else if (diseasesecondL[j] === "Influenza B") {
                        for (let h = 0; h < influenzaB.length; h++) {
                            controls.createThirdLayer(firstL[i], diseasesecondL[j], influenzaB[h]);
                        }
                    } else if (diseasesecondL[j] === "COVID-19" || coviderror !== true) {
                        for (let h = 0; h < covid19M.length; h++) {
                            controls.createThirdLayer(firstL[i], diseasesecondL[j], covid19M[h]);
                        }
                        // controls.createThirdLayer(firstL[i], diseasesecondL[j], "COVID-19");
                        // controls.covid19();
                    } else {
                        alert('Error! Some disease trends layers might not have been created properly. ');
                        // throw error
                    }
                }
            } else if (firstL[i] === 'Food Security') {
                for (let j = 0; j < foodsecondL.length; j++) {
                    controls.createSecondLayer(firstL[i], foodsecondL[j]);
                    if (foodsecondL[j] === 'Agrosphere') {
                        for (let h = 0; h < thirdL.length; h++) {

                            controls.createThirdLayers(firstL[i], foodsecondL[j], thirdL[h]);
                            if (thirdL[h] === "Country") {
                                // for (let k = 0; k <countryL.length; k++) {
                                //     controls.createFourthLayer(firstL[i],foodsecondL[j], thirdL[h],countryL[k]);
                                // }
                            } else if (thirdL[h] === "Crops") {
                                for (let k = 0; k < cropsL.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], thirdL[h], cropsL[k]);
                                }
                            } else if (thirdL[h] === "Weather") {
                                for (let k = 0; k < weatherL.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], thirdL[h], weatherL[k]);
                                }
                            } else {
                                alert('Error! Some Agrosphere layers might not have been created properly. ');
                                // throw error
                            }
                        }
                    } else if (foodsecondL[j] === 'ECMWF Forecasts') {
                        for (let h = 0; h < ecmwf_forecasts.length; h++) {
                            controls.createThirdLayer(firstL[i], foodsecondL[j], ecmwf_forecasts[h]);
                        }
                    } else if (foodsecondL[j] === 'Sentinel Satellite Data') {
                        for (let h = 0; h < satellite_data.length; h++) {
                            // controls.createThirdLayer(firstL[i], foodsecondL[j], satellite_data[h]);

                            controls.createThirdLayers(firstL[i], foodsecondL[j], satellite_data[h]);
                            if (satellite_data[h] === "Moisture Index") {
                                for (let k = 0; k <MI.length; k++) {
                                    controls.createFourthLayer(firstL[i],foodsecondL[j], satellite_data[h],MI[k]);
                                }
                            } else if (satellite_data[h] === "SWIR") {
                                for (let k = 0; k < SWIR.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], SWIR[k]);
                                }
                            } else if (satellite_data[h] === "NDWI") {
                                for (let k = 0; k < NDWI.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDWI[k]);
                                }
                            } else if (satellite_data[h] === "NDMI") {
                                for (let k = 0; k < NDMI.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDMI[k]);
                                }
                            } else if (satellite_data[h] === "NDVI") {
                                for (let k = 0; k < NDVI.length; k++) {
                                    controls.createFourthLayer(firstL[i], foodsecondL[j], satellite_data[h], NDVI[k]);
                                }
                            } else {

                            }
                        }
                    } else {
                        // throw error
                        console.log('Error! Some layers might not have been created properly. ');
                    }
                }
            } else {
                // throw error
                console.log('Error! Some layers might not have been created properly. ');
            }
        }


});