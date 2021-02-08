define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    , './covidPK'
    ,'./ResizeSensor'
], function (newGlobe, dataAll,csvD, LayerManager, covidPK, ResizeSensor) {
    "use strict";

    let agriData = convertArrayToDataSet(csvD.csv2[0]);
    let atmoData = convertArrayToDataSet(csvD.csv2[1]);
    let priceData = convertArrayToDataSet(csvD.csv2[2]);
    let liveData = convertArrayToDataSet(csvD.csv2[3]);
    let emissionAgriData = convertArrayToDataSet(csvD.csv2[4]);
    let atmoDataMonthly = convertArrayToDataSet(csvD.csv2[5]);
    let pestiData = convertArrayToDataSet(csvD.csv2[6]);
    let fertiData = convertArrayToDataSet(csvD.csv2[7]);
    let yieldData = convertArrayToDataSet(csvD.csv2[8]);
    let refugeeData = convertArrayToDataSet(csvD.csv2[9]);
    let agriDef = csvD.csv1[2];

    /**
     * Given a csv data array, convert the segment into objects
     *
     * @param csvData - in the format of id, paramatertype, year1 value,
     * year2 value...
     * @returns {Array of objects containing the ids and an array of year-
     *          value pairs}
     */
    function convertArrayToDataSet (csvData) {
        //Create the temporary object
        let objectList = [];
        let i = 0;
        for (i = 1; i < csvData.length; i++) {
            //Create the object
            let tempObject = {};
            let needPushToObj;
            //First instance or can't find it
            if ((objectList.length === 0) ||
                (findDataBaseName(objectList, csvData[i][0]) === 0)) {

                //Give it a name assuming it is the first things
                tempObject.code3 = csvData[i][0]

                //Give it a start time
                tempObject.startTime = csvData[0][2];
                tempObject.endTime = csvData[0][csvData[i].length - 1];

                //Give it a data array
                tempObject.dataValues = [];

                needPushToObj = true;
            } else {
                //We found it
                tempObject = findDataBaseName(objectList, csvData[i][0]);
                needPushToObj = false;
            }
            let j = 0;
            //Data values contain a type and its year
            let dataValueObject = {};
            dataValueObject.timeValues = [];
            for (j = 1; j < csvData[i].length; j++) {
                //Attach things to the tempObject dataValues
                if (j === 1) {
                    //Its the type name
                    dataValueObject.typeName = csvData[i][1];
                } else {
                    //Append the item to the value
                    let timeValue = {};
                    timeValue.year = csvData[0][j];

                    //Check if the data exist
                    let value = csvData[i][j];
                    if (value !== "") {
                        //Parse it
                        timeValue.value = parseFloat(value);
                    } else {
                        timeValue.value = "";
                    }
                    dataValueObject.timeValues.push(timeValue);
                }
            }
            tempObject.dataValues.push(dataValueObject);
            //Check to push to obj list
            if (needPushToObj) {
                objectList.push(tempObject);
            }
        }
        return objectList;
    }

    function findDataBaseName (inputArray, name) {
        let i = 0;
        for (i = 0; i < inputArray.length; i++) {
            //Find if the name exists
            if (inputArray[i].country === name) {
                return inputArray[i];
            } else if (inputArray[i].stationName === name) {
                return inputArray[i];
            }
        }
        return 0;
    }

    let findDataPoint = function (dataSet, lat, lon) {
        for (let i = 0; i < dataSet.length; i++) {
            if ((dataSet[i].lon === lon) && (dataSet[i].lat === lat)) {
                return dataSet[i];
            }
        }
    }

    /**
     * Find data given name of station
     *
     * @param dataSet - type of data to get for
     * @param stationName - name of station to get data for
     * @returns {data for specified station}
     */
    let findDataPointStation = function (dataSet, stationName) {
        for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].stationName === stationName) {
                return dataSet[i];
            }
        }
        return 0;
    }

    /**
     * Get definition of crop given name
     * @param dataSet - data from which to search
     * @param cropName - name of crop to get definition for
     * @returns {definition and statement of crop from FAO}
     */
    let findCropDefinition = function(dataSet, cropName) {
        for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].Item === cropName) {
                return dataSet[i].Description;
            }
        }
        return 0;
    }

    let findDataPointCountry = function (dataSet, countryCode, codeNumber) {
        let i = 0;
        if (codeNumber === 2) {
            for (i = 0; i < dataSet.length; i++) {
                // let stationCode = dataSet[i].stationName.charAt(0) + dataSet[i].stationName.charAt(1)
                let stationCode = dataSet[i].country
                if ((stationCode === countryCode)) {
                    return stationCode;
                }
            }
        } else if (codeNumber === 3) {
            for (i = 0; i < dataSet.length; i++) {
                if (dataSet[i].country === countryCode) {
                    return dataSet[i];
                }
                // if (dataSet[i].stationName === countryCode) {
                //     return dataSet[i];
                // }
            }
        }
        return 0;
    }

    /**
     * filters out nonexistent values in an array
     *
     * @param inputData - array to be filtered
     * @param mode - 1 mode means set value to 0 in case of blank
     * @returns {filtered array}
     */
    let filterOutBlanks = function (inputData, mode) {
        let i = 0;
        let tempArray = [];
        for (i = 0; i < inputData.length; i++) {
            //Check for empty string
            if ((inputData[i].value !== "") && (mode === 0)) {
                tempArray.push(inputData[i]);
            } else if (mode === 1) {
                if (inputData[i].value === "") {
                    inputData[i].value = 0;
                    tempArray.push(inputData[i]);
                } else {
                    tempArray.push(inputData[i]);
                }
            }
        }
        return tempArray;
    }

    /**
     * Gives the button functionality for weather station
     *
     * @param inputData - first data type
     * @param inputData2 - second data type
     * @param stationName - name of station
     * @param agriDataPoint - agriculture data to check
     */
    let giveAtmoButtonsFunctionality = function(inputData, inputData2, refugeeData, stationName, ccode3,
                                          agriDataPoint) {
        let dataPoint = findDataPointStation(inputData, stationName);
        let dataPoint2 = findDataPointStation(inputData2, stationName);
        let offSetLength = dataPoint.dataValues.length;
        if (dataPoint !== 0) {
            let i = 0;
            for (i = 0; i < (dataPoint.dataValues.length +
                dataPoint2.dataValues.length); i++) {
                let buttonHTML = $('#plotWeatherButton' + i).button();
                buttonHTML.click(function(event) {
                    //Generate the plot based on things
                    let buttonID = this.id;
                    let buttonNumber = buttonID.slice(
                        'plotWeatherButton'.length);
                    let selfHTML = $('#' + buttonID);
                    let plotID = 'graphWeatherPoint' + buttonNumber;

                    //Do we already have a plot?
                    let plotHTML = $('#' + plotID);
                    if (plotHTML.html() === '') {

                        if (buttonNumber < offSetLength) {
                            plotScatter(dataPoint.dataValues[buttonNumber].typeName, '',
                                dataPoint.dataValues[buttonNumber].timeValues,
                                plotID, 0);
                        } else {
                            plotScatter(dataPoint2.dataValues[buttonNumber -
                                offSetLength].typeName, '',
                                dataPoint2.dataValues[buttonNumber -
                                offSetLength].timeValues, plotID, 0);
                        }
                        selfHTML.button("option", "label", "Hide Graph");
                    } else {
                        plotHTML.html('');
                        selfHTML.button("option", "label", "Plot Graph");
                    }
                    $('#messagePoint' + buttonNumber).html('' +
                        'Plotted graph!');
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                });
                let combineButtonHTML = $('#combineButtonStation' + i).button();
                combineButtonHTML.click(function(event) {
                    let buttonID = this.id;
                    let buttonNumber = buttonID.slice(
                        'combineButtonStation'.length);
                    //Add to the graph
                    if (buttonNumber < offSetLength) {
                        plotScatter(dataPoint.dataValues[buttonNumber].typeName, dataPoint.code3,
                            dataPoint.dataValues[buttonNumber].timeValues,
                            'multiGraph', 1);
                    } else {
                        plotScatter(dataPoint2.dataValues[buttonNumber -
                            offSetLength].typeName, dataPoint.code3,
                            dataPoint2.dataValues[buttonNumber -
                            offSetLength].timeValues,
                            'multiGraph', 1);
                    }
                    $('#messagePoint' + buttonNumber).html('Combined ' +
                        'graph! Please go to Data Graphs Tab');
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                });

                let addButtonHTML = $('#addButtonStation' + i).button();
                addButtonHTML.click(function(event) {
                    //Grab id
                    let buttonID = this.id;
                    let buttonNumber = buttonID.slice('addButtonStation'.length);

                    //Check how many divs there are
                    var manyGraphDivChildren = $('#manyGraph > div');

                    var graphNumber = manyGraphDivChildren.length;

                    //Generate the html
                    var graphDiv = '<div id="subGraph' + graphNumber +
                        '"></div>';

                    $('#manyGraph').append(graphDiv);

                    //Graph it
                    if (buttonNumber < offSetLength) {
                        plotScatter(dataPoint.dataValues[buttonNumber].typeName,
                            dataPoint.code3,
                            dataPoint.dataValues[buttonNumber].timeValues,
                            'subGraph' + graphNumber, 0);
                    } else {
                        plotScatter(dataPoint.dataValues[buttonNumber -
                            offSetLength].typeName, dataPoint.code3,
                            dataPoint.dataValues[buttonNumber -
                            offSetLength].timeValues,
                            'subGraph' + graphNumber, 0);
                    }
                    $('#messagePoint' + buttonNumber).html('Added graph!' +
                        ' Please go to Data Graphs Tab');
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                });
            }

            //Assign functionality to the allButton
            var allButtonHTML = $('#allButtonStation').button();
            allButtonHTML.on('click', function() {
                //Plots a stacked bar
                var topX = $('#amount').val();
                var amount = 5;
                if (!Number.isNaN(parseInt(topX))) {
                    amount = parseInt(topX);
                }
                if ($('#allGraphStation').html() === '') {
                    plotStack(agriDataPoint, 'allGraphStation', amount);
                    createSubPlot(dataPoint.dataValues, 'allGraphStation');
                } else {
                    $('#allGraphStation').html('');
                }
                $('#toggleLegendStation').toggle();
            });
            var legendButtonHTML = $('#toggleLegendStation').button();
            legendButtonHTML.off();
            legendButtonHTML.on('click', function() {
                //Check if the plot exist
                if ($('#allGraphStation').html() !== '') {
                    var layout = {};
                    if ($(this).hasClass('legendoff')) {

                        layout.showlegend = true;
                        $(this).removeClass('legendoff');
                    } else {
                        layout.showlegend = false;
                        $(this).addClass('legendoff');
                    }
                    Plotly.relayout($('#allGraphStation').children()[0],
                        layout);
                }
            });
        }
    }


    /**
     * Gives the data buttons functionality
     *
     * @param detailsHTML - details for agriculture
     * @param inputData - data inputted to use
     * @param agriDef - definitions of agriculture
     * @param codeName - country code name
     * @param mode - type of data like agriculture/livestock/fert...
     */
    let giveDataButtonsFunctionality = function (detailsHTML, inputData,
                                          refugeeData,
                                          agriDef, codeName, mode) {
        //Do a search for all the buttons based on the data
        var dataPoint = findDataPointCountry(inputData, codeName, 3);
        //Check for existing data point
        if (dataPoint !== 0) {
            var i = 0;
            for (i = 0; i < dataPoint.dataValues.length; i++) {
                var buttonHTML = $('#plotButton' + i).button();
                buttonHTML.click(function(event) {
                    //Generate the plot based on things
                    var buttonID = this.id;
                    var buttonNumber = buttonID.slice('plotButton'.length);
                    var selfHTML = $('#' + buttonID);
                    var plotID = 'graphPoint' + buttonNumber;

                    //Do we already have a plot?
                    var plotHTML = $('#' + plotID);
                    if (plotHTML.html() === '') {
                        plotScatter(dataPoint.dataValues[buttonNumber].typeName, dataPoint.code3,
                            dataPoint.dataValues[buttonNumber].timeValues,
                            plotID, 0);
                        selfHTML.button("option", "label", "Hide Graph");
                    } else {
                        plotHTML.html('');
                        selfHTML.button("option", "label", "Plot Graph");
                    }
                    $('#messagePoint' + buttonNumber).html('' +
                        'Plotted graph!');
                    //Create a temporary message indicating success
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                })
                var combineButtonHTML = $('#combineButton' + i).button();
                combineButtonHTML.click(function(event) {
                    var buttonID = this.id;
                    var buttonNumber = buttonID.slice(
                        'combineButton'.length);
                    //Add to the graph
                    plotScatter(dataPoint.dataValues[buttonNumber].typeName, dataPoint.code3,
                        dataPoint.dataValues[buttonNumber].timeValues,
                        'multiGraph', 1);
                    $('#messagePoint' + buttonNumber).html('Combined' +
                        ' graph! Please go to Data Graphs Tab');
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                });

                var addButtonHTML = $('#addButton' + i).button();
                addButtonHTML.click(function(event) {
                    //Grab id
                    var buttonID = this.id;
                    var buttonNumber = buttonID.slice('addButton'.length);

                    //Check how many divs there are
                    var manyGraphDivChildren = $('#manyGraph > div');

                    var graphNumber = manyGraphDivChildren.length;

                    //Generate the html
                    var graphDiv = '<div id="subGraph' + graphNumber +
                        '"></div>';

                    $('#manyGraph').append(graphDiv);

                    //Graph it
                    plotScatter(dataPoint.dataValues[buttonNumber].typeName, dataPoint.code3,
                        dataPoint.dataValues[buttonNumber].timeValues,
                        'subGraph' + graphNumber, 0);
                    $('#messagePoint' + buttonNumber).html('Added graph!' +
                        ' Please go to Data Graphs Tab');
                    setTimeout(function() {
                        $('#messagePoint' +
                            buttonNumber).html('')
                    }, 5000);
                });

                if (mode === 0) {
                    var definitionHTML = $('#definitionNumber' +
                        i).button();
                    definitionHTML.click(function(event) {
                        //Grab id
                        var buttonID = this.id;
                        var buttonNumber = buttonID.slice('' +
                            'definitionNumber'.length);

                        //Grab titleName

                        var cropName = $(this).text().slice(('Get' +
                            ' Definition for ').length);
                        console.log(cropName);
                        //Do a CSV search
                        var description = findCropDefinition(agriDef,
                            cropName);

                        $('#messagePoint' + buttonNumber).html(description);
                        setTimeout(function() {
                            $('#messagePoint' +
                                buttonNumber).html('')
                        }, 10000);

                    });
                }
            }
            $('#sortByName').off();
            $('#sortByName').click(function() {
                //Go through the entire button list and sort them
                var divList = $('.layerTitle');
                var newList = [];
                divList.sort(function(a, b) {
                    //Compare with the list element
                    if (a.firstChild.innerText < b.firstChild.innerText) {
                        return -1;
                    } else if (a.firstChild.innerText >
                        b.firstChild.innerText) {
                        return 1;
                    }
                    return 0;
                });

                //Now that things are sorted, make a duplicate
                var i = 0;
                for (i = 0; i < divList.length; i++) {
                    //$('#myUL').append($(divList[i]).html());
                    newList.push($(divList[i]).clone());
                }
                $('#myUL > .layerTitle').remove();
                for (i = 0; i < newList.length; i++) {
                    $('#myUL').append('<div class="layerTitle" id="' +
                        $(newList[i]).attr('id') + '">' +
                        $(newList[i]).html() + '</div>');
                }
                giveDataButtonsFunctionality(detailsHTML, inputData,
                    refugeeData,
                    agriDef, codeName, mode);
            });
            $('#sortByAverage').off();
            $('#sortByAverage').click(function() {
                var divList = $('.layerTitle');
                var newList = [];
                divList.sort(function(a, b) {
                    //Get the buttons
                    var buttonNumber1 = $(a).attr('id').slice(
                        'layerTitle'.length);
                    var buttonNumber2 = $(b).attr('id').slice(
                        'layerTitle'.length);
                    var data1 =
                        dataPoint.dataValues[buttonNumber1].timeValues;
                    data1 = filterOutBlanks(data1, 0);
                    var data2 =
                        dataPoint.dataValues[buttonNumber2].timeValues;
                    data2 = filterOutBlanks(data2, 0);
                    //Got the number
                    var sum1 = 0;
                    var i = 0;
                    for (i = 0; i < data1.length; i++) {
                        sum1 += data1[i].value;
                    }
                    var mean1 = sum1 / i;
                    var sum2 = 0;
                    for (i = 0; i < data2.length; i++) {
                        sum2 += data2[i].value;
                    }
                    var mean2 = sum2 / i;

                    if (mean1 < mean2) {
                        return 1;
                    } else if (mean1 > mean2) {
                        return -1;
                    }
                    return 0;
                });

                //Now that things are sorted, make a duplicate
                var newList = [];
                for (i = 0; i < divList.length; i++) {
                    newList.push($(divList[i]).clone());
                }
                $('#myUL > .layerTitle').remove();
                for (i = 0; i < newList.length; i++) {
                    $('#myUL').append('<div class="layerTitle"' +
                        ' id="' + $(newList[i]).attr('id') + '">' +
                        $(newList[i]).html() + '</div>');
                }
                giveDataButtonsFunctionality(detailsHTML, inputData,
                    refugeeData,
                    agriDef, codeName, mode);
            });

            //Assign functionality to the search bar
            $('#searchinput').off();
            $('#searchinput').keyup(function(event) {
                //if (event.which == 13) {
                var input = $('#searchinput');
                var textValue = input.val().toUpperCase();
                //Iterate through the entire list and hide if
                //value is not contained
                var i = 0;
                var layerTitles = $('div .layerTitle');
                var layerTitleList = $('div .layerTitle > li');
                for (i = 0; i < layerTitleList.length; i++) {
                    if (!$(layerTitleList[i]).html().toUpperCase().includes(textValue)) {
                        $(layerTitles[i]).hide();
                    } else if (textValue === '') {
                        $(layerTitles[i]).show();
                    } else if ($(layerTitleList[i]).html().toUpperCase().includes(textValue)) {
                        $(layerTitles[i]).show();
                    }
                }
            });

            //Assign functionality to the allButton
            var allButtonHTML = $('#allButton').button();
            //Remember in the case of regiving functionality, gotta remove
            //the listener
            allButtonHTML.off();
            allButtonHTML.on('click', function() {
                //Plots a stacked bar
                var topX = $('#amount').val();
                var amount = 5;
                if (!Number.isNaN(parseInt(topX))) {
                    amount = parseInt(topX);
                }
                if ($(this).hasClass('plotted')) {
                    $(this).removeClass('plotted');
                    $('#allGraph').html('');
                } else {
                    $(this).addClass('plotted');
                    plotStack(dataPoint, 'allGraph', amount);
                    if ((mode === 0) || (mode === 6)) {
                        var refugeePoint = findDataPointCountry(refugeeData,
                            codeName, 3);
                        createSubPlot(refugeePoint.dataValues, 'allGraph');
                    }
                }
                $('#toggleLegend').toggle();
            });
            var legendButtonHTML = $('#toggleLegend').button();
            legendButtonHTML.off();
            legendButtonHTML.on('click', function() {
                //Check if the plot exist
                if ($('#allGraph').html() !== '') {
                    var layout = {};
                    if ($(this).hasClass('legendoff')) {

                        layout.showlegend = true;
                        $(this).removeClass('legendoff');
                    } else {
                        layout.showlegend = false;
                        $(this).addClass('legendoff');
                    }
                    Plotly.relayout($('#allGraph').children()[0], layout);
                }
            });
        }
    }

    /**
     * Generates the html for the weather search
     * @param countryData - country name for search
     */
    let generateWeatherHTML = function (countryData) {
        var weatherHTML = '<h5class="smallerfontsize">Weather Search</h5>';
        weatherHTML += '<p><input type="text" class="form-control" ' +
            'id="cityInput" placeholder="Search for city" title=' +
            '"Type in a layer"></p>';
        weatherHTML += '<select id="countryNames" class="form-control">'
        var i = 0;

        for (i = 0; i < countryData.length; i++) {
            weatherHTML += '<option>' + countryData[i].code2 + ' - ' +
                countryData[i].country + '</option>';
        }
        weatherHTML += '</select><br>';
        weatherHTML += '<p><button class="btn-info" id="searchWeather">' +
            'Search Weather</button></p>';
        weatherHTML += '<div id="searchDetails"></div>'
        $('#weather').append(weatherHTML);
    }


    //Provides functionality for the weather button search
    /**
     * Weather search functionality
     */
    let giveWeatherButtonFunctionality= function() {
        var weatherButton = $('#searchWeather').button();
        weatherButton.on('click', function() {
            //Extract the two inputs
            var cityInput = $('#cityInput').val();
            var country = $('#countryNames :selected').val();
            var countryInput = country.slice(0, 2);

            //Make an api request
            var apiURL = 'https://api.openweathermap.org/' +
                'data/2.5/weather?q=' + cityInput + ',' +
                countryInput + '&appid=' + APIKEY;

            //Make an ajax request
            //Note that api attempst to return the closet result possible
            $.ajax({
                url: encodeURI(apiURL),
                method: 'get',
                dataType: 'json',
                success: function(data) {
                    //Create some html
                    let dropArea = $('#searchDetails');
                    dropArea.html('');
                    let tempHTML = '<h5 class="fontsize"><b>Weather' +
                        ' Details for ' + data.name + '</b></h5>';
                    tempHTML += '<p><b>Country:</b> ' + data.sys.country +
                        '</p><br>';
                    tempHTML += '<p><b>Current Outlook:</b> ' +
                        data.weather[0].main + '</p><br>';
                    tempHTML += '<p><b>Current Outlook Description:</b> ' +
                        data.weather[0].description + '</p><br>';
                    tempHTML += '<p><b>Current Temperature (Celsius):</b> ' +
                        Math.round((data.main.temp - 272), 2) + '</p><br>';
                    tempHTML += '<p><b>Sunrise:</b> ' + timeConverter(
                        data.sys.sunrise) + '</p><br>';
                    tempHTML += '<p><b>Sunset:</b> ' + timeConverter(
                        data.sys.sunset) + '</p><br>';
                    tempHTML += '<p><b>Max Temperature Today (Celsius)' +
                        ':</b> ' + Math.round((data.main.temp_max - 272), 2) +
                        '</p><br>';
                    tempHTML += '<p><b>Min Temperature Today (Celsius):' +
                        '</b> ' + Math.round(data.main.temp_min - 272, 2) +
                        '</p><br>';
                    tempHTML += '<p><b>Pressure (HPa):</b> ' +
                        data.main.pressure + '</p><br>';
                    tempHTML += '<p><b>Humidity (%):</b> ' +
                        data.main.humidity + '</p><br>';
                    tempHTML += '<p><b>Wind speed (m/s):</b>' +
                        data.wind.speed + '</p><br><br>';
                    dropArea.append(tempHTML);
                },
                fail: function() {}
            })
        });
    }


    /**
     * Generates the atmospheric button html
     *
     * @param inputData - first data
     * @param inputData2 - second point
     * @param stationName - name of station
     * @returns {html string of atmo buttons}
     */
    let generateAtmoButtons = function(inputData, inputData2, stationName) {
        var atmoHTML = '<h4>Atmosphere Data</h4>';
        var dataPoint = findDataPointStation(inputData, stationName);
        var dataPoint2 = findDataPointStation(inputData2, stationName);
        atmoHTML += '<button class="btn-info" style="display:none" id="toggleLegendStation"' +
            '>Toggle Graph Legend</button>';
        atmoHTML += '<button class="btn-info" id="allButtonStation">' +
            'Graph Crops and Weather</button>';
        atmoHTML += '<div id="allGraphStation"></div>';
        if (dataPoint !== 0) {
            var i = 0;
            //Yearly data
            for (i = 0; i < dataPoint.dataValues.length; i++) {
                //Generate the remaining HTML
                atmoHTML += '<div class="layerTitle" id="layerTitle' +
                    i + '">';
                atmoHTML += '<p>' + dataPoint.dataValues[i].typeName +
                    '</p>';
                atmoHTML += '<div class="resizeGraph" ' +
                    'id="graphWeatherPoint' + i + '"></div>';
                atmoHTML += '<div id="messagePoint' + i + '"></div>';
                atmoHTML += '<button' +
                    ' class="btn-info"' + ' id="plotWeatherButton' +
                    i + '">Plot Graph</button>';
                atmoHTML += '<button class="btn-info" id="combineButtonStation' +
                    i + '">Combine Graph </button>';
                atmoHTML += '<button class="btn-info" id="addButtonStation' +
                    i + '">Add Graph</button>';
                atmoHTML += '<br></div>';
            }
            //Monthly data
            for (i = 0; i < dataPoint2.dataValues.length; i++) {
                var offSetLength = dataPoint.dataValues.length + i;
                atmoHTML += '<div class="layerTitle" id="layerTitle' +
                    offSetLength + '">';
                atmoHTML += '<p>' + dataPoint2.dataValues[i].typeName +
                    '</p>';
                atmoHTML += '<div class="resizeGraph" ' +
                    'id="graphWeatherPoint' + offSetLength + '"></div>';
                atmoHTML += '<div id="messagePoint' + offSetLength +
                    '"></div>';
                atmoHTML += '<button' +
                    ' class="btn-info"' + ' id="plotWeatherButton' +
                    offSetLength + '">Plot Graph</button>';
                atmoHTML += '<button class="btn-info" id="addButton' +
                    offSetLength + '">Add Graph</button>';
                atmoHTML += '<br></div>';
            }
        }
        return atmoHTML;
    }

    /**
     * Generates the FAO statistics buttons used by the country
     * Each button should spawn its own data set
     *
     * @returns {html string of buttons}
     */
    let generateCountryButtons = function() {
        var countryHTML = '<h5><b>Available Datasets</b></h5>';

        countryHTML += '<button class="btn-info" id="spawnAgri">' +
            'Show Ag. Production Data List</button>';
        countryHTML += '<button class="btn-info" id="spawnPrice">' +
            'Show Price Data List</button>';
        countryHTML += '<button class="btn-info" id="spawnLive">' +
            'Show Livestock Data List</button>';
        countryHTML += '<button class="btn-info" id="spawnEmissionAgri">' +
            'Show Ag. Emission Data List</button>';
        countryHTML += '<button class="btn-info" id="spawnPest">' +
            'Show Pesticide Data List</button>';
        countryHTML += '<button class="btn-info" id="spawnFerti">' +
            'Show Fertilizer Data List</button>';
        countryHTML += '<button class="btn-info" id ="spawnYield">' +
            'Show Ag. Yield Data List</button>';
        return countryHTML;
    }

    /**
     * Gives buttons for country data functionality
     *
     * @param agriData - agriculture
     * @param priceData - price
     * @param liveData - livestock
     * @param emissionAgriData - emissions
     * @param pestiData - pesticides
     * @param fertiData - fertilizer
     * @param yieldData - yield
     * @param agriDef - agriculture definitions
     * @param codeName - country 3 letter code
     */
    let giveCountryButtonsFunctionality = function(agriData, priceData, liveData,
                                             emissionAgriData, pestiData, fertiData,
                                             yieldData, refugeeData, agriDef, codeName) {
        var buttonAreaHTML = $('#buttonArea');
        var agriButtons = $('#spawnAgri').button();
        var priceButtons = $('#spawnPrice').button();
        var liveButtons = $('#spawnLive').button();
        var emissionAgriButtons = $('#spawnEmissionAgri').button();
        var pestiButtons = $('#spawnPest').button();
        var fertiButtons = $('#spawnFerti').button();
        var yieldButtons = $('#spawnYield').button();

        //Just generate the buttons for each type
        agriButtons.on('click', function() {
            //Generate agri culture buttons
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(agriData, codeName, 0));
            giveDataButtonsFunctionality(buttonAreaHTML, agriData,
                refugeeData, agriDef,
                codeName, 0);
        });
        priceButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(priceData, codeName, 1));
            giveDataButtonsFunctionality(buttonAreaHTML, priceData, agriDef,
                refugeeData,
                codeName, 1);
        });
        liveButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(liveData, codeName, 2));
            giveDataButtonsFunctionality(buttonAreaHTML, liveData, agriDef,
                refugeeData,
                codeName, 2);
        });
        emissionAgriButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(emissionAgriData,
                codeName, 3));
            giveDataButtonsFunctionality(buttonAreaHTML, emissionAgriData,
                refugeeData,
                agriDef, codeName, 3);
        });
        pestiButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(pestiData, codeName, 4));
            giveDataButtonsFunctionality(buttonAreaHTML, pestiData, agriDef,
                refugeeData,
                codeName, 4);
        });
        fertiButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(fertiData, codeName, 5));
            giveDataButtonsFunctionality(buttonAreaHTML, fertiData,
                refugeeData,
                agriDef, codeName, 5);
        });
        yieldButtons.on('click', function() {
            buttonAreaHTML.html('');
            buttonAreaHTML.html(generateDataButtons(yieldData, codeName, 6));
            giveDataButtonsFunctionality(buttonAreaHTML, yieldData,
                refugeeData,
                agriDef, codeName, 6);
        });
    }

    /**
     * Creates data buttons
     *
     * @param inputData - data
     * @param codeName - 3 letter code
     * @param mode - which type of data
     * @returns {string containing buttons in HTML}
     */
    let generateDataButtons = function (inputData, codeName, mode) {
        //Based on the input data, generate the buttons/html
        //Mode dictates what to call the title or search bar
        switch (mode) {
            case 0:
                var dataHTML = '<h4>Ag. Production Data</h4>' +
                    '<input type="text" class="form-control" id="' +
                    'searchinput" placeholder="Search for datasets.."' +
                    ' title="Search for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many of the biggest ' +
                    'crops?" title="Search for datasets..">';
                break;
            case 1:
                var dataHTML = '<h4>Price Data</h4>' + '<input type="text"' +
                    ' class="form-control" id="searchinput" placeholder="' +
                    'Search for datasets.."title="Search for datasets..">';
                dataHTML += '<input type="text" class="form-control"id="' +
                    'amount"placeholder="How many of top prices?"title="' +
                    'Search for datasets..">';
                break;
            case 2:
                var dataHTML = '<h4>Livestock Data</h4>' + '<input type=' +
                    '"text" class="form-control" id="searchinput" ' +
                    'placeholder="Search for datasets.." title="Search' +
                    ' for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many livestocks?"' +
                    ' title="Search for datasets..">';
                break;
            case 3:
                var dataHTML = '<h4>Ag. Emission Data</h4>' + '<input' +
                    ' type="text" class="form-control" id="searchinput"' +
                    ' placeholder="Search for datasets.." title="Search' +
                    ' for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many crops?" ' +
                    'title="Search for datasets..">';
                break;
            case 4:
                var dataHTML = '<h4>Pesticide Data</h4>' +
                    '<input type="text" class="form-control" ' +
                    'id="searchinput"placeholder="Search for datasets.."' +
                    ' title="Search for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many pesticides?"' +
                    ' title="Search for datasets..">';
                break;
            case 5:
                var dataHTML = '<h4>Fertiliser Data</h4>' + '<input ' +
                    'type="text" class="form-control" id="searchinput"' +
                    ' placeholder="Search for datasets.." title="' +
                    'Search for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many fertilisers?"' +
                    ' title="Search for datasets..">';
                break;
            case 6:
                var dataHTML = '<h4>Ag. Yield Data</h4>' + '<input' +
                    ' type="text" class="form-control" id="searchinput"' +
                    ' placeholder="Search for datasets.." title="Search' +
                    ' for datasets..">';
                dataHTML += '<input type="text" class="form-control"' +
                    ' id="amount" placeholder="How many crop yields?"' +
                    ' title="Search for datasets..">';
                break;
        }

        //Find the appropiate data point to use for the buttons
        var dataPoint = findDataPointCountry(inputData, codeName, 3);
        if (dataPoint !== 0) {
            var i = 0;
            dataHTML += '<ul id="myUL">';
            switch (mode) {
                case 0:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Crop Production Datasets' +
                        '</button>';
                    break;
                case 1:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Price Datasets</button>';
                    break;
                case 2:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Livestock Datasets</button>';
                    break;
                case 3:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Ag Emission Datasets' +
                        '</button>';
                    break;
                case 4:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Pesticide Datasets</button>';
                    break;
                case 5:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Fertilizer Datasets' +
                        '</button>';
                    break;
                case 6:
                    dataHTML += '<button class="btn-info"id="allButton">' +
                        'Graph Specified # of Yield Datasets</button>';
                    break;
            }
            dataHTML += '<br><button class="btn-info" style="display:none" id="toggleLegend"' +
                '>Toggle Graph Legend</button><br>';
            dataHTML += '<div id="allGraph"></div>';
            dataHTML += '<br><button class="btn-info" id="sortByName">' +
                'Sort by Name</button>';
            dataHTML += '<br><button class="btn-info" id="sortByAverage">' +
                'Sort by Amount</button>';

            for (i = 0; i < dataPoint.dataValues.length; i++) {
                //Generate the HTML to show for plots
                dataHTML += '<div class="layerTitle" id="layerTitle' +
                    i + '"><li>' + dataPoint.dataValues[i].typeName +
                    '</li>';
                if (mode === 0) {
                    var tempTitleName =
                        dataPoint.dataValues[i].typeName.slice(0,
                            dataPoint.dataValues[i].typeName.length -
                            ' Production in tonnes'.length);
                    dataHTML += '<button class="btn-info" ' +
                        'id="definitionNumber' + i + '">Get Definition for' +
                        ' ' + tempTitleName + '</button>';
                }

                dataHTML += '<div class="resizeGraph" id="graphPoint' +
                    i + '"></div>';
                dataHTML += '<button' +
                    ' class="btn-info"' + ' id="plotButton' + i +
                    '">Plot Graph</button>';
                dataHTML += '<div id="messagePoint' + i + '"></div>';
                dataHTML += '<button class="btn-info" id="combineButton' +
                    i + '">Combine Graph </button>';
                dataHTML += '<button class="btn-info" id="addButton' +
                    i + '">Add Graph</button>';
                dataHTML += '<br></div>';
            }
            dataHTML += '</ul>';
        } else {
            dataHTML += '<p>No data avaliable!</p>';
        }
        return dataHTML;
    }

    /**
     * Helps plot stack - plots crop, percentage, and atmosphere together
     *
     * @param inputData - data to input
     * @param htmlID - id in html code
     */
    let createSubPlot = function(inputData, htmlID) {
        //Create subplots
        var i = 0;
        var traces = [];
        var newLayout = {};
        var incAmounts = (0.5 / (inputData.length)).toFixed(2);
        newLayout['yaxis'] = {
            domain: [0, 0.5],
            title: 'See side for units'
        };
        newLayout['yaxis2'] = {
            domain: [0, 0.5],
            side: 'right',
            title: 'Percent'
        };
        for (i = 0; i < inputData.length; i++) {
            var dataPoint = filterOutBlanks(inputData[i].timeValues, 0);
            var j = 0;
            var xValues = [];
            var yValues = [];
            for (j = 0; j < dataPoint.length; j++) {
                xValues.push(parseInt(dataPoint[j].year));
                yValues.push(parseFloat(dataPoint[j].value));
            }

            var tempTrace = {
                x: xValues,
                y: yValues,
                name: inputData[i].typeName,
                xaxis: 'x',
                yaxis: 'y' + (i + 3),
                graph: 'scatter'
            }
            traces.push(tempTrace);
            var lowDomain = (0.5 + (i * incAmounts)).toFixed(2);
            var highDomain = (0.5 + ((i + 1) * incAmounts)).toFixed(2);
            if (highDomain > 1) {
                highDomain = 1;
            }
            var yTitle;
            var plotSide;
            switch (i) {
                case 0:
                    yTitle = 'Celsius';
                    plotSide = 'right';
                    break;
                case 1:
                    yTitle = 'mm';
                    plotSide = 'left';
                    break;
            }
            newLayout['yaxis' + (i + 3)] = {
                domain: [lowDomain, highDomain -
                0.01
                ],
                title: yTitle,
                side: plotSide
            };
        }
        var d3 = Plotly.d3;
        var gd3 = d3.select('#' + htmlID + '> div');
        var gd = gd3.node();
        Plotly.addTraces(gd, traces);
        Plotly.relayout(gd, newLayout);
        Plotly.relayout(gd, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        });

        new ResizeSensor($('#' + htmlID), function() {
            var d3 = Plotly.d3;
            var gd3 = d3.select('#' + htmlID + '> div');
            var gd = gd3.node();
            Plotly.Plots.resize(gd);
        });
    }

    /**
     * Plots a stacked bar given all the set of data
     *
     * @param inputData - data to be used
     * @param htmlID - id in html code
     * @param amount - how many of top types are wanted
     */
    let plotStack = function(inputData, htmlID, amount) {
        var i = 0;
        var filteredDataSet = [];
        for (i = 0; i < inputData.dataValues.length; i++) {
            filteredDataSet.push(filterOutBlanks(inputData.dataValues[i].timeValues, 1));
        }
        var xValuesSet = [];
        var yValuesSet = [];
        var j = 0;
        for (i = 0; i < filteredDataSet.length; i++) {
            var xValues = [];
            var yValues = [];
            for (j = 0; j < filteredDataSet[i].length; j++) {
                xValues.push(parseFloat(filteredDataSet[i][j].year));
                yValues.push(parseFloat(filteredDataSet[i][j].value));
            }
            xValuesSet.push(xValues);
            yValuesSet.push(yValues);
        }

        //We need to check by years
        var yearAmount = (2014 - 1961);

        //Find the top so and so yValues
        var totalAmounts = [];
        var topPercentages = [];
        var numRanks = 5;
        var k = 0;
        //Array of top values
        var showDataValues = [];
        for (i = 0; i < inputData.dataValues[0].timeValues.length; i++) {
            //OK for each year, get all the yValues
            var tempAmounts = [];
            var tempValue = 0;
            for (j = 0; j < filteredDataSet.length; j++) {
                tempAmounts.push(parseFloat(filteredDataSet[j][i].value));
                tempValue += parseFloat(filteredDataSet[j][i].value);
            }
            totalAmounts.push(tempValue);

            //We got all the values
            //Filter by a raw amount
            tempAmounts.sort(function(a, b) {
                return a - b
            });

            //Grab the 5th highest value
            var threshold = tempAmounts[tempAmounts.length - amount - 1];
            var top5 = 0;
            //Now find every data set that has a value that is the 5th or
            // higher (not 0)
            for (j = 0; j < filteredDataSet.length; j++) {
                var value = parseFloat(filteredDataSet[j][i].value);
                if ((value > threshold) && (value !== 0)) {
                    //Check if item is already in the array
                    var isIn = false;
                    for (k = 0; k < showDataValues.length; k++) {
                        if (showDataValues[k].typeName ===
                            inputData.dataValues[j].typeName) {
                            isIn = true;
                            break;
                        }
                    }

                    if (isIn === false) {
                        //Not in, create a new object
                        var tempObj = {};
                        tempObj.typeName = inputData.dataValues[j].typeName;
                        tempObj.xValues = [];
                        tempObj.yValues = [];
                        tempObj.yValues.push(value);
                        tempObj.xValues.push(parseFloat(filteredDataSet[j][i].year));
                        showDataValues.push(tempObj);
                    } else {
                        showDataValues[k].yValues.push(value);
                        showDataValues[k].xValues.push(parseFloat(filteredDataSet[j][i].year));
                    }
                    //Find the percentage
                    top5 += value;
                }
            }
            //Find the percentage
            topPercentages.push((top5 / tempValue) * 100);
        }

        //Create the traces
        var traces = [];
        for (i = 0; i < showDataValues.length; i++) {
            var trace = {
                x: showDataValues[i].xValues,
                y: showDataValues[i].yValues,
                name: showDataValues[i].typeName,
                type: 'bar'
            }
            traces.push(trace);
        }

        //Final percentages push
        var tempTrace = {
            x: xValuesSet[0],
            y: topPercentages,
            type: 'scatter',
            yaxis: 'y2',
            name: 'Top ' + amount
        }
        traces.push(tempTrace);
        //Create the graph
        var xAxis = {
            title: 'Year'
        };

        var yAxis = {
            title: 'Amount (see legend)'
        }

        var yAxis2 = {
            title: 'Percentage of top ' + amount,
            overlaying: 'y',
            side: 'right',
            anchor: 'y',
            //position: 0.85
        }

        var layout = {
            title: 'Top ' + amount + ' amounts for ' +
                inputData.code3 + ' vs Year',
            barmode: 'stack',
            xaxis: xAxis,
            yaxis: yAxis,
            yaxis2: yAxis2,
            legend: {
                x: 1.15
            },
            autosize: true
        }
        var d3 = Plotly.d3;
        var size = 100;
        var ysize = 70;
        var gd3 = d3.select('#' + htmlID).append('div').style({
            width: size + '%',
            'margin-left': ((100 - size) / 2) + '%',
            height: ysize + 'vh',
            'margin-top': ((100 - size) / 2) + 'vh'
        });
        var gd = gd3.node();
        Plotly.plot(gd, traces, layout);
        new ResizeSensor($('#' + htmlID), function() {
            Plotly.Plots.resize(gd);
        });
    }

    /**
     * Creates a scatter plot based on the input data
     * It is assumed that the input data is an array of timeValue pair
     *
     * @param titleName - title of plot
     * @param secondName - other name
     * @param inputData - data to be used
     * @param htmlID - id in html file
     * @param mode - 0 = individual plot, otherwise it is a type
     */
    let plotScatter = function(titleName, secondName, inputData, htmlID, mode) {
        //Filter the input data, we may get some blanks
        let filteredData = filterOutBlanks(inputData, 0);
        //Blank years gone, create the x-y axis
        let xValues = [];
        let yValues = [];
        let i = 0;
        for (i = 0; i < filteredData.length; i++) {
            if (!isNaN(parseFloat(filteredData[i].year))) {
                xValues.push(parseFloat(filteredData[i].year));
            } else {
                xValues.push(filteredData[i].year);
            }
            yValues.push(parseFloat(filteredData[i].value));
        }
        //Create the plotly graph
        let graph = {
            name: titleName + ' ' + secondName,
            x: xValues,
            y: yValues,
            mode: 'markers',
            type: 'scatter'
        };
        let xAxis = {
            title: 'Year'
        }
        if (mode === 0) {
            let yAxis = {
                title: titleName
            };
        } else {
            let yAxis = {
                title: 'Unitless'
            };
        }
        let titleString = '';
        if (mode === 0) {
            titleString = titleName + ' vs Year';
        } else {
            titleString = 'Legend vs Year';
        }
        let layout = {
            xaxis: xAxis,
            yaxis: yAxis,
            title: titleString,
            showlegend: true
        };
        //Check if the htmlID is empty
        let plotHTML = $('#' + htmlID);
        var d3 = Plotly.d3;
        let size = 100;
        let plotID = '#' + htmlID;
        if ((mode === 0) || ((mode === 1) && plotHTML.html() === '')) {
            //Indicates new plot
            let gd3 = d3.select(plotID).append('div').style({
                width: size + '%',
                'margin-left': ((100 - size) / 2) + '%',
                height: size + '%',
                'margin-top': ((100 - size) / 2) + '%'
            });
            let gd = gd3.node();
            $(gd).css('min-width', '300px');
            $(gd).css('min-height', '300px');
            Plotly.plot(gd, [graph], layout);
        } else if (mode === 1) {
            let gd3 = d3.select(plotID + '> div');
            let gd = gd3[0][0];
            Plotly.addTraces(gd, [graph]);
            let dimensions = {
                width: '100%'
            }
            let multiGraphUpdate = {
                title: 'Multiple Graphs'
            }
            Plotly.update(gd, multiGraphUpdate);
            Plotly.relayout(gd, dimensions);
        }

        if (!(htmlID.includes('sub') || htmlID.includes('multi'))) {
            new ResizeSensor(plotHTML, function() {
                Plotly.Plots.resize(gd);
            });
        }
    }


    return {agriData: agriData, atmoData: atmoData,
        atmoDataMonthly: atmoDataMonthly, emissionAgriData: emissionAgriData,
        fertiData: fertiData, liveData: liveData, pestiData: pestiData,
        priceData: priceData, refugeeData: refugeeData, yieldData: yieldData, agriDef: agriDef, findDataPoint, findDataPointCountry, findDataBaseName, generateAtmoButtons, generateCountryButtons, generateDataButtons, giveCountryButtonsFunctionality, giveAtmoButtonsFunctionality, giveDataButtonsFunctionality, giveWeatherButtonFunctionality, filterOutBlanks}

})