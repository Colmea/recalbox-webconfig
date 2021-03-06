var express = require('express');
var router = express.Router();
var  fs = require('fs');
var path = require('path');
var crypto = require('crypto');

// Const
var recalboxConfPath    = '/recalbox/share/system/recalbox.conf';
var recalboxRomsPath     = '/recalbox/share/roms';
var recalboxBiosPath    = "/recalbox/share/bios";
var recalboxLog    = "/recalbox.log";

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET ROMS */
router.get("/Roms/:dir",function(req,res,next){

    //list directory of /recalbox/share/roms
    var arrayDIr =  fs.readdirSync(recalboxRomsPath);
    var selectedDir = req.params.dir;
    if(selectedDir == "home") {
        res.render('roms', {pageTitle: 'Roms', directory: arrayDIr});
    }else {

        //https://www.npmjs.com/package/drag-and-drop-files
        var filePath = path.join(recalboxRomsPath, selectedDir);

        var files = [];
        var arrayFile = fs.readdirSync(filePath);
        arrayFile.forEach(function (item) {
            files.push({section:selectedDir,name:item});
        });

        res.render('roms', {pageTitle: 'Roms', directory: arrayDIr, files:files,sltPath:selectedDir});
    }

});

router.get("/Roms/delete/:section/:file",function(req,res,next){

    var section = req.params.section;
    var file = req.params.file;
    var filePath =recalboxRomsPath+"/"+section+"/"+file;
    fs.unlinkSync(filePath);

    res.redirect("/Roms/"+section);
});

router.get("/Bios",function(req,res,next){
    //list file of /recalbox/share/bios
    /*
     getAllFiles(recalboxBiosPath,function(filePath, stat) {
     console.log(filePath);

     });
     */
    var arrayFile =  fs.readdirSync(recalboxBiosPath);
    //console.log(arrayFile);
    arrayFile.forEach(function(item){
        console.log(recalboxBiosPath+"/"+item);
        var fd = fs.createReadStream(recalboxBiosPath+"/"+item);
        console.log(checksum(fd));
    });


    res.render('bios',{pageTitle:'Bios'});
});

router.get("/Config",function(req,res,next){
    // show config file  /recalbox/share/system/recalbox.conf
    fs.readFile(recalboxConfPath, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }

        res.render('config',{pageTitle:'Config',conf:data});
    });

});

router.post("/Config",function(req,res)
{
    var data = req.body.recalboxconf;

    fs.writeFile(recalboxConfPath, data, function (err) {
        if (err) return console.log(err);
    });
    res.render('config',{pageTitle:'Config',conf:data});
});


router.get("/Log",function(req,res,next){
    // dmesg
    //recalbox.log
    // etc...

    fs.readFile(recalboxLog, 'utf8', function (err,data) {
        if (err) {
            //res.render('log',{pageTitle:'Log',log:err});
            //   return console.log(err);
        }
        console.log(data);
        res.render("log",{pageTitle:"Log",conf:data});
        //res.render('config',{pageTitle:'Config',conf:data});

    });

});

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}


// to remove, only sample
function getAllFolder(currentDirPath, callback) {

    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);

        if (stat.isFile()) {
            //callback(filePath, stat);
        } else if (stat.isDirectory()) {
            //walk(filePath, callback);
            callback(filePath, stat)
        }
    });
}

function getAllFiles(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            //walk(filePath, callback);
        }
    });
}

module.exports = router;
