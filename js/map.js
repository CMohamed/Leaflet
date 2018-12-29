var mymap = L.map('mapid', {
    closePopupOnClick:false
    }).setView([33, -7], 7);




//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

function addPoint(long, lat){
    L.marker([long, lat]).addTo(mymap);
}

// add Tiles
streets = L
    .tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
            attribution : 'Source: Esri, NAVTEQ, 2012'
        });
world = L
    .tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution : 'Esri'
        });
//streets.addTo(mymap);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

// Add Group Layers Control

var baseMaps = {
    "World Street map" : streets,
    "World Imagery" : world
};

L.control.layers(baseMaps).addTo(mymap);


// process

Points = {};
ListPoints =[];
popup = [];
mrk = [];

function Upload() {

    var fileUpload = document.getElementById("fileUpload");

    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;

    if (regex.test(fileUpload.value.toLowerCase())) {

        if (typeof (FileReader) != "undefined") {

            var reader = new FileReader();

            reader.onload = function (e) {

                var table = document.createElement("table");

                var rows = e.target.result.split("\n");

                for (var i = 0; i < rows.length; i++) {
                    var line = rows[i];
                    console.log(line);
                    var list = line.split(",");
                    var x = Number(list[0]);
                    var y = Number(list[1]);
                    var q = Number(list[2]);
                    var pt = [x,y];

                    if (Points[pt] == undefined){
                        ListPoints.push(pt)
                        Points[pt] = q ;
                    }else{
                        Points[pt] += q;
                    }
                    var row = table.insertRow(-1);

                    var cells = rows[i].split(",");

                    for (var j = 0; j < cells.length; j++) {

                        var cell = row.insertCell(-1);
                        //console.log(cells[i]);

                        cell.innerHTML = cells[j];

                    }

                }
                console.log(Points);

                // affichage des points

                for(var i=0; i<ListPoints.length; i++){
                    //var myMarker = L.marker(pt).addTo(mymap);
                    //myMarker.bindPopup("<b>the value of this point :</b>").openPopup();

                    popup[i] = L.popup({
                        closeButton: true,
                        autoClose: false
                    })
                        .setLatLng(ListPoints[i])
                        .setContent('<p>commandes : '+Points[ListPoints[i]]+' </p><br><br><br>')
                        .openOn(mymap);

                    mrk[i] = L.marker(ListPoints[i]);
                    mrk[i].bindPopup("hhhhh").openPopup();


                    mrk[i].addTo(mymap);
                    mrk[i].on('click', function () {
                        console.log('hhhhhhhhhhh');
                    });


                }
                var dvCSV = document.getElementById("dvCSV");

                dvCSV.innerHTML = "";

                dvCSV.appendChild(table);

            }

            reader.readAsText(fileUpload.files[0]);

        } else {

            alert("This browser does not support HTML5.");

        }

    } else {

        alert("Please upload a valid CSV file.");

    }

}