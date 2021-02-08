// config/database.js
let serverConfig = {
    commondb_connection: {
        'multipleStatements': true,
        'connectionLimit' : 100,
        // 'host': 'localhost',
        'host': '10.11.90.16',
        'user': 'AppUser',
        'password': 'Special888%',
        'port'    :  3306
    },
    session_connection: {
        'multipleStatements': true,
        'connectionLimit' : 100,
        // 'host': 'localhost',
        'host': '10.11.90.16',
        'user': 'AppUser',
        'password': 'Special888%',
        'port'    :  3306
    },

    liveDB_connection: {
        'multipleStatements': true,
        'connectionLimit' : 100,
        'mySql_sourceHost': 'localhost',
        'mySql_sourcePort': '33303',
        'mySql_destHost': 'localhost',
        'mySql_destPort': '3306',
        'mySql_user': 'AppUser',
        'mySql_password': 'Special888%',
        'ssh_destHost': 'aworldbridgelabs.com',
        'ssh_destPort': '5532',
        'ssh_user': 'ftaa',
        'ssh_password': 'Poiu0987$'
    },
    Session_db: 'dtrends',
    Upload_db: 'dtrends',

    Server_Port: 9091,

    // local_URL : "",
    // local_URL : "http://viewer.usgs.aworldbridgelabs.com",

    //upload path to geoserver when approved
    geoServer : 'http://cs.aworldbridgelabs.com:8080/geoserver/',
    // geoServer : 'http://10.11.90.16:8080/geoserver/',

    //sysnchronization between approvedfolder and data folder under geoserver when approved
    // Sync_Dir : '/usr/share/geoserver-2.15.0/data_dir/data/Approved',
    // Sync_Dir : 'syncfolder',

    //download/backup wmsCapabilities file (xml)
    Download_From : 'https://cors.aworldbridgelabs.com:9084/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities',
    Download_To:'../config/ows.xml',
    Backup_Dir:'../config/geoCapacity',

    num_backups: 24,
    download_interval: 3600000,

};

module.exports = serverConfig;