// routes/routes.js
const mysql = require('mysql');
const path    = require('path');
const fs = require("fs");
const fsextra = require('fs-extra');
const request = require("request");

const serverConfig = require('../config/serverConfig');
const download_interval = serverConfig.download_interval;

const geoServer = serverConfig.geoServer;
const Download_From = serverConfig.Download_From;

const copySource = path.resolve(__dirname, serverConfig.Download_To); //the path of the source file
const copyDestDir = path.resolve(__dirname, serverConfig.Backup_Dir);

let downloadFalse = null ;

const con_DT = mysql.createConnection(serverConfig.commondb_connection);

module.exports = function (app) {

    removeFile();
    setInterval(copyXML, download_interval);

    app.get('/', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // res.render('homepage.ejs');
        res.render('homepage.ejs', {
        })
    });

    // let firstDate, lastSecondDate;
    app.get('/validateDate', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let validDateQuery = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19 GROUP BY SUBSTRING(RID,1,10);";
        let validDateQuery = "SELECT Date From dtrends.covid_19 GROUP BY Date order by Date;";
        con_DT.query(validDateQuery, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // firstDate = results[0].Date;
                // lastSecondDate = results[results.length - 1].Date;

                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/rr', function (req, res) {
        console.log("function")
        res.setHeader("Access-Control-Allow-Origin", "*");

        let countryQ = "select * from dtrends.continent where CountryName= ?";
        con_DT.query(countryQ, [req.query.country], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false,  "data": results});
            }
        });
    });

    app.get('/1dData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let oneDaysQ = "select * from dtrends.covid_19 where Date >= ? AND Date <= ? order by CountryName, Date;";
        con_DT.query(oneDaysQ, [req.query.date[0], req.query.date[1]], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/majorData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let majorQ = "select * from dtrends.covid_19 where Date < ? order by CountryName, Date";
        con_DT.query(majorQ, req.query.Date, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/lastData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let lastQ = "select * from dtrends.covid_19 where Date = ? order by CountryName, Date";
        con_DT.query(lastQ, req.query.Date, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let allQ = "select * from dtrends.covid_19 order by CountryName, Date";
        con_DT.query(allQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/timelapseAll', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        con_DT.query("SELECT Date From dtrends.covid_19 GROUP BY Date;", function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results[results.length-1].newRID);
                res.json({"error": false, "data": results});
            }
        });

    });

    app.get('/allCountry', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let countryQ = "select CountryName, ContinentName from dtrends.covid_19 group by CountryName;";
        con_DT.query(countryQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.post('/byCountry', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // console.log(req.body);

        let pkQ = "select * from dtrends.covid_19 where CountryName = ?;";
        con_DT.query(pkQ, req.body.country, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allLayers', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let statAll = "SELECT LayerType, DisplayName, Color_Confirmed, Date From dtrends.covid_19;";

        con_DT.query(statAll, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/chartData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        let dName = req.query.dName;
        let dTo = req.query.dateTo;
        let dFrom = req.query.dateFrom;

        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let statAll = "SELECT * From dtrends.covid_19 WHERE DisplayName = '" + dName + "' AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "' ORDER BY Date ASC;";

        con_DT.query(statAll, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allLayerMenu', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude, CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.covid_19 WHERE SUBSTRING(RID, 1, 10)= '" + controlDate + "' GROUP BY DisplayName;";
        let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude," +
            " CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.covid_19 " +
            "WHERE Date= '" + req.query.RID + "' GROUP BY DisplayName;";
        let stat2 = "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));";
        // let stat3 = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let stat3 = "SELECT Date From dtrends.covid_19;";
        let stat4 = stat2 + stat1 + stat3;

        con_DT.query(stat4, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results[1]);
                res.json({"error": false, "data": results[1]});
            }
        });
    });

    app.get('/position',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let layername = req.query.layername;
        let parsedLayers = layername.split(",");
        // console.log("Parsed Layers: ");
        // console.log(parsedLayers);

        con_DT.query('SELECT LayerName, Longitude, Latitude, Altitude, ThirdLayer FROM layers WHERE LayerName = ?', parsedLayers[0], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "no result found!"});
            } else {
                res.json(results);
            }
        });
        // con_CS.query("SELECT LayerName, Longitude, Latitude, Altitude, ThirdLayer FROM LayerMenu Where LayerName = ?", parsedLayers[0], function (err, results) {
        //     console.log (results);
        //     res.json({"Longitude": results[0].Longitude, "Latitude" : results[0].Latitude, "Altitude" : results[0].Altitude, "ThirdLayer": results[0].ThirdLayer, "LayerName":results[0].LayerName});
        // })
    });

    function copyXML(){
        const today = new Date();//get the current date
        let date = today.getFullYear()+ '_' +(today.getMonth()+1)+ '_' + today.getDate();
        let time = today.getHours() + "_" + today.getMinutes()+'_' + today.getSeconds();
        let dataStr = date + "_"+ time;
        let copyDest = copyDestDir + '/' + dataStr+ '.xml'; //define a file name
        fsextra.copy(copySource, copyDest) //copy the file and rename
            .then(//if copy succeed, call pre-download XML function
                console.log('copy successful'),
                predownloadXml ()
            )
    }

    function predownloadXml () {
        const requestOptions = {
            uri: Download_From,
            timeout: download_interval - 20000
        };
        let resXMLRequest;
        console.log('predownloadXML was called');

        request.get(requestOptions)
            .on('error',function(err){ //called when error
                console.log(err.code);
                console.log('predownloadXML error');
                removeFile();
                // process.exit(0)
            })
            .on('response', function (res) {
                resXMLRequest = res;
                if (res.statusCode === 200){
                    res.pipe(fs.createWriteStream(copySource));
                    console.log('download starting');
                } else {
                    console.log("Respose with Error Code: " + res.statusCode);
                    removeFile();
                    // process.exit(0)
                }
            })
            .on('end', function () {
                downloadFalse = false;
                console.log("The End: " + resXMLRequest.statusCode);
                removeFile();
                // process.exit(0)
            })
    }

    function removeFile() {

        console.log('the remove function was called at: ' + copyDestDir);

        fs.readdir(copyDestDir, (err, files) => {//a method to calculate the number of the files in the geoCapacity folder

            // if(files.length > num_backups){
            //
            //     //if there are more than 100 file in the directory
            //     if(!downloadFalse){ //if download succeed, run the code below
            //         fs.unlink(copyDestDir + "/" + files[0], (err) => { //delete the first (the oldest) file in the directory
            //             if (err) {throw err} else {
            //                 downloadFalse = true; //change the value of "downloadFalse" to true
            //             }
            //             console.log('download and remove copy successfully');
            //         })
            //     } else { //if download failed, run the code below
            //         fs.unlink(copyDestDir + "/" + files[files.length-1], (err) => { //then delete the last (the latest) file in the directory
            //             if (err) {throw err}
            //             console.log('download file failed, removed copy successfully')
            //         })
            //     }
            // }else {
            //     //if the file number is less than num_backups, and download failed
            //     if (files.length > 0) {
            //         if (downloadFalse === null) {
            //             fs.unlink(copyDestDir + "/" + files[files.length - 1], (err) => { //then delete the last (the latest) file in the directory
            //                 if (err) throw err;
            //                 console.log('download file failed,number is less than num_backups, removed copy successfully')
            //             })
            //         }
            //     }
            // }
        });
    }

};