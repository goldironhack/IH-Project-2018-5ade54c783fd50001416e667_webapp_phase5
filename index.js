
const GOOGLE_KEY = "AIzaSyDv7dN0dT4TR0e8in4TH-0sRUaRfA6FxVY";
const NY_districts_shapes = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";
const NY_neighborhood_names = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const NY_housing = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";
const NY_crimes = "https://data.cityofnewyork.us/resource/9s4h-37hy.json";


var map;
var description;
var NYUSternSchoolofBusiness = {lat:40.7291, lng: -73.9965}
var NYUSternSchoolofBusinessMarker;
var BronxDist = {lat:40.8447766, lng: -73.8649325}
var BronxDistMarker;
var BrooklynDist = {lat:40.6781751, lng: -73.9442477}
var BrooklynDistMarker;
var ManhattanDist = {lat:40.7830361, lng: -73.9713486}
var ManhattanDistMarker;
var QueensDist = {lat:40.7281979, lng: -73.7950014}
var QueensDistMarker;
var StatenIslandDist = {lat:40.5794788, lng: -74.1503226}
var StatenIslandDistMarker;

var markersNeighborhood = [];
var markersHousing = [];

var statesDistricts = [];
var Neighborhoods = [];
var NeighborhoodsFull = [];
var housingFull=[];
var crimesFull=[];
var crimesBoroughs=[];
var crimesDistricts=[];
var total=[];
var coord;
var longitud, latitud;
var drawDistri;

var safetyTable=[];
var distan=[];
var distanceTable=[];
var affordabilityTable=[];

var directionsService;
var directionsRenderer;
var listo = false;

function initMap() {
  newMap();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  getDataBoroughs();
  getDataHousing();
  getDataCrimes();
  getDataNeighborhood();
}

//==============================================================================
//===========================================GET DATAS==========================
//==============================================================================

function getDataBoroughs(){
  var data, dataRow;
  data = $.get(NY_districts_shapes, function(){}).done(function(){
    dataRow = data.responseText;
    statesDistricts = coordinateProcessor(dataRow);
    distance();
  })
  .fail(function(error){console.log(error);})
}

function getDataNeighborhood(){
  var data, dataRow;
  data = $.get(NY_neighborhood_names, function(){}).done(function(){
    dataRow = data.responseJSON.data;
    neighborhoodProcessor(dataRow);
  })
  .fail(function(error){console.log(error);})
}

function getDataHousing(){
  var data, dataRow;
  data = $.get(NY_housing, function(){}).done(function(){
    //console.log(data);
    dataRow = data.responseJSON.data;
    //console.log(dataRow);
    housingProcessor(dataRow);
  })
  .fail(function(error){console.log(error);})
}

function getDataCrimes() {
  $.ajax({url:NY_crimes, type:"GET", data:{cmplnt_to_dt:"2015-12-31T00:00:00.000"}
  }).done(function(data) {
    crimesProcessor(data);
  })
  .fail(function(error){console.log(error);})
}

//==============================================================================
//=====================================PROCESSOR DATAS==========================
//==============================================================================

function coordinateProcessor(dataRow){
  var indice;
  var polygon = [];
  var dis1 = [], dis2 = [], dis3 = [],dis4 = [], dis5 = [];
  var states = [];
  var temp = [];
  var MaxLatitud, MinLatitud, MaxLongitud, MinLongitud;
  var CenterLatitud, CenterLongitud;

  indice = dataRow.indexOf(":[{");
  dataRow = dataRow.slice(indice+3, dataRow.length);
  dataRow = dataRow.split("},{");
  for (var i = 0; i < dataRow.length; i++) {
    MaxLatitud=0; MinLatitud=100; MaxLongitud= -100; MinLongitud=100;
    CenterLatitud=0; CenterLongitud=0;
    polygon = []; temp = []; states = [];
    indice = dataRow[i].indexOf(":[[");
    dataRow[i] = dataRow[i].slice(indice+3, dataRow[i].length);
    dataRow[i] = dataRow[i].split("},");
    //OBTENCION CORDENADAS=====================================================
    dataRow[i][0] = dataRow[i][0].split("],[");
    for (var j = 0; j < dataRow[i][0].length; j++) {
      dataRow[i][0][j] = dataRow[i][0][j].split(",");
      dataRow[i][0][j] = convertidor(dataRow[i][0][j]);
      longitud = parseFloat(dataRow[i][0][j][0]);
      latitud = parseFloat(dataRow[i][0][j][1]);
      //CENTRO DEL POLIGONO====================================================
      if(latitud >= MaxLatitud){MaxLatitud=latitud}
      if(latitud <= MinLatitud){MinLatitud=latitud}
      if(longitud >= MaxLongitud){MaxLongitud=longitud}
      if(longitud <= MinLongitud){MinLongitud=longitud}
      polygon.push({lat:latitud,lng:longitud});
    }
    //OBTENCION BORODC=========================================================
    indice = dataRow[i][1].indexOf("CD\":");
    dataRow[i][1] = dataRow[i][1].slice(indice+4, indice+7);
    //FINALIZANDO CENTROS======================================================
    CenterLatitud = (MaxLatitud+MinLatitud)/2;
    CenterLongitud = (MaxLongitud+MinLongitud)/2;
    //SEPARANDO POLIGONOS SEGUN EL ESTADO =====================================
    temp.push(polygon, dataRow[i][1], {lat:CenterLatitud,lng:CenterLongitud});
    if (dataRow[i][1][0] == "1"){dis1.push(temp);}
    if (dataRow[i][1][0] == "2"){dis2.push(temp);}
    if (dataRow[i][1][0] == "3"){dis3.push(temp);}
    if (dataRow[i][1][0] == "4"){dis4.push(temp);}
    if (dataRow[i][1][0] == "5"){dis5.push(temp);}
  }
  states.push(dis1, dis2, dis3, dis4, dis5);
  return states;
}

function convertidor(coord){
  coord[0] = coord[0].replace(/\D/g,'');
  coord[1] = coord[1].replace(/\D/g,'');
  ls = coord[0].length;
  ls = Math.pow(10, ls-2);
  coord[0] = coord[0]/(ls*(-1));
  ls = coord[1].length;
  ls = Math.pow(10, ls-2);
  coord[1] = coord[1]/ls;
  return coord;
}
//==============================================================================
function neighborhoodProcessor(dataRow){
  var NeighborhoodsBX=[], NeighborhoodsBK=[], NeighborhoodsMG=[], NeighborhoodsQE=[], NeighborhoodsSI=[];
  for (var i = 0; i < dataRow.length-1; i++) {
    coord = dataRow[i][9];
    coord = coord.slice(7, coord.length-1);
    coord = coord.split(" ");
    longitud = parseFloat(coord[0]);
    latitud = parseFloat(coord[1]);
    Neighborhoods=[];
    Neighborhoods.push(dataRow[i][8], dataRow[i][10], {lat:latitud,lng:longitud});
    if(dataRow[i][16] == 'Bronx'){NeighborhoodsBX.push(Neighborhoods);}
    if(dataRow[i][16] == 'Brooklyn'){NeighborhoodsBK.push(Neighborhoods);}
    if(dataRow[i][16] == 'Manhattan'){NeighborhoodsMG.push(Neighborhoods);}
    if(dataRow[i][16] == 'Queens'){NeighborhoodsQE.push(Neighborhoods);}
    if(dataRow[i][16] == 'Staten Island'){NeighborhoodsSI.push(Neighborhoods);}
  }
  NeighborhoodsFull.push(NeighborhoodsBX, NeighborhoodsBK, NeighborhoodsMG, NeighborhoodsQE, NeighborhoodsSI);
}

//==============================================================================
function housingProcessor(dataRow){
  var housing=[], housingBX=[], housingBK=[], housingMG=[], housingQE=[], housingSI=[];
  for (var i = 0; i < dataRow.length; i++) {
    housing=[];
    latitud = parseFloat(dataRow[i][23]);
    longitud = parseFloat(dataRow[i][24]);
    latitud2 = parseFloat(dataRow[i][25]);
    longitud2 = parseFloat(dataRow[i][26]);
    housing.push(dataRow[i][15], {lat:latitud, lng:longitud}, dataRow[i][31], dataRow[i][12], {lat:latitud2, lng:longitud2});
    if(dataRow[i][15] == "Bronx"){housingBX.push(housing);}
    if(dataRow[i][15] == "Brooklyn"){housingBK.push(housing);}
    if(dataRow[i][15] == "Manhattan"){housingMG.push(housing);}
    if(dataRow[i][15] == "Queens"){housingQE.push(housing);}
    if(dataRow[i][15] == "Staten Island"){housingSI.push(housing);}
  }
  housingFull.push(housingMG, housingBX, housingBK, housingQE, housingSI);

}

//==============================================================================
function crimesProcessor(data){
  var crimes=[], crimesBX=[], crimesBK=[], crimesMG=[], crimesQE=[], crimesSI=[];
  for (var i = 0; i < data.length; i++) {
    crimes=[];
    crimes.push(data[i].boro_nm, data[i].ofns_desc, data[i].lat_lon,data[i].cmplnt_fr_dt);
    if(data[i].boro_nm == "BRONX"){crimesBX.push(crimes);}
    if(data[i].boro_nm == "BROOKLYN"){crimesBK.push(crimes);}
    if(data[i].boro_nm == "MANHATTAN"){crimesMG.push(crimes);}
    if(data[i].boro_nm == "QUEENS"){crimesQE.push(crimes);}
    if(data[i].boro_nm == "STATEN ISLAND"){crimesSI.push(crimes);}
  }
  crimesFull.push(crimesMG, crimesBX, crimesBK, crimesQE, crimesSI);
}

//==============================================================================
//============================================GENERAL DRAW======================
//==============================================================================

function newMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: NYUSternSchoolofBusiness
  });
  drawNewYork(map);
  drawNYUMarker();
  if (document.getElementById('BoroughsMarkers').checked) {
    drawMarkers();
  }
}

function drawMap(){
  drawDistri = document.getElementById('selectDistricts').value;
  clearMap();
  drawDistricts(drawDistri);
  if (document.getElementById('BoroughsMarkers').checked) {
    drawMarkers();
  }
  if (document.getElementById('DistrictsMarkers').checked) {
    drawMarkersBoroDC(drawDistri);
  }
  if (document.getElementById('NeighborhoodsMarkers').checked) {
    drawNeighborhoodMarkers(drawDistri);
  }
  if (document.getElementById('HousingMarkers').checked) {
    drawHousingMarkers(drawDistri);
  }
}

function clearMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: NYUSternSchoolofBusiness
  });
  drawNYUMarker();
}

//==============================================================================
//========================DRAW POLYGONS AND MARKERS=============================
//==============================================================================

function drawNewYork(map){  //DRAW POLYGON
  map.data.loadGeoJson('https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson');
  map.data.setStyle(function(feature) {
          var color = 'green';
          return /** @type {google.maps.Data.StyleOptions} */({
            fillColor: color,
            strokeColor: color,
            strokeWeight: 2
          });
        });
}

function drawDistricts(drawDistri){  //DRAW POLYGON
  if(drawDistri == 'Manhattan'){
    map.setZoom(12);
    map.setCenter(ManhattanDist);
    for (var i = 0; i < statesDistricts[0].length; i++) {
      color = getRandomColor();
      drawPolygon(color,statesDistricts[0][i][0]);
    }
  }else if(drawDistri == 'Bronx'){
    map.setZoom(12);
    map.setCenter(BronxDist);
    for (var i = 0; i < statesDistricts[1].length; i++) {
      color = getRandomColor();
      drawPolygon(color,statesDistricts[1][i][0]);
    }
  }else if(drawDistri == 'Brooklyn'){
    map.setZoom(12);
    map.setCenter({lat:40.6512035, lng: -73.940894});
    for (var i = 0; i < statesDistricts[2].length; i++) {
      color = getRandomColor();
      drawPolygon(color,statesDistricts[2][i][0]);
    }
  }else if(drawDistri == 'Queens'){
    map.setZoom(11);
    map.setCenter(QueensDist);
    for (var i = 0; i < statesDistricts[3].length; i++) {
      color = getRandomColor();
      drawPolygon(color,statesDistricts[3][i][0]);
    }
  }else if(drawDistri == 'Staten Island'){
    map.setZoom(12);
    map.setCenter(StatenIslandDist);
    for (var i = 0; i < statesDistricts[4].length; i++) {
      color = getRandomColor();
      drawPolygon(color,statesDistricts[4][i][0]);
    }
  }else{
    newMap();
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function drawPolygon(color,polygon){
  var distritos = new google.maps.Polygon({
    paths: polygon,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35
  });
  distritos.setMap(map);
}

function drawNYUMarker(){  //DRAW MARKERS
  var destinationIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=O|FFFF00|000000';;
  NYUSternSchoolofBusinessMarker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    position: NYUSternSchoolofBusiness,
    label: "NYU Stern School of Business",
    map: map,
    icon: destinationIcon
  });
}

function drawMarkers(){  //DRAW MARKERS
    BronxDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: BronxDist,
      label: "Bronx",
      map: map
    });
    BrooklynDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: BrooklynDist,
      label: "Brooklyn",
      map: map
    });
    ManhattanDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: ManhattanDist,
      label: "Manhattan",
      map: map
    });
    QueensDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: QueensDist,
      label: "Queens",
      map: map
    });
    StatenIslandDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: StatenIslandDist,
      label: "Staten Island",
      map: map
    });
}

function drawMarkersBoroDC(drawDistri){  //DRAW MARKERS
  var Marker;
  if(drawDistri == 'Bronx'){
    for (var i = 0; i < statesDistricts[1].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[1][i][2],
        label: statesDistricts[1][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < statesDistricts[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[2][i][2],
        label: statesDistricts[2][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Manhattan'){
    for (var i = 0; i < statesDistricts[0].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[0][i][2],
        label: statesDistricts[0][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Queens'){
    for (var i = 0; i < statesDistricts[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[3][i][2],
        label: statesDistricts[3][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Staten Island'){
    for (var i = 0; i < statesDistricts[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[4][i][2],
        label: statesDistricts[4][i][1],
        map: map
      });
    }
  }
}

function drawNeighborhoodMarkers(drawDistri){  //DRAW MARKERS
  var Marker;
  if(drawDistri == 'Bronx'){
    for (var i = 0; i < NeighborhoodsFull[0].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[0][i][2],
        label: NeighborhoodsFull[0][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < NeighborhoodsFull[1].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[1][i][2],
        label: NeighborhoodsFull[1][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Manhattan'){
    for (var i = 0; i < NeighborhoodsFull[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[2][i][2],
        label: NeighborhoodsFull[2][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Queens'){
    for (var i = 0; i < NeighborhoodsFull[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[3][i][2],
        label: NeighborhoodsFull[3][i][1],
        map: map
      });
    }
  }
  if(drawDistri == 'Staten Island'){
    for (var i = 0; i < NeighborhoodsFull[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[4][i][2],
        label: NeighborhoodsFull[4][i][1],
        map: map
      });
    }
  }
}

function drawHousingMarkers(drawDistri){  //DRAW MARKERS
  var Marker;
  if(drawDistri == 'Manhattan'){
    for (var i = 0; i < housingFull[0].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[0][i][1],
        label: housingFull[0][i][3],
        map: map
      });
    }
  }
  if(drawDistri == 'Bronx'){
    for (var i = 0; i < housingFull[1].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[1][i][1],
        label: housingFull[1][i][3],
        map: map
      });
    }
  }
  if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < housingFull[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[2][i][1],
        label: housingFull[2][i][3],
        map: map
      });
    }
  }
  if(drawDistri == 'Queens'){
    for (var i = 0; i < housingFull[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[3][i][1],
        label: housingFull[3][i][3],
        map: map
      });
    }
  }
  if(drawDistri == 'Staten Island'){
    for (var i = 0; i < housingFull[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[4][i][1],
        label: housingFull[4][i][3],
        map: map
      });
    }
  }
}

//==============================================================================
//========================ESTADISTICS DATAS=====================================
//==============================================================================

function estadistics(){
  distance();
  affordability();
  safety();
  distanceTableValor();
  document.getElementById("outBest2").innerHTML =
    "<br>"
    +"<h4 style=\"text-align: center; color: #007bff\">"
      +"Carga Completa"
    +"</h4>";
}

function safety(){
  var distrito, result, coordenadas, Dmarker;
  crimesBoroughs.push(["Manhattan", (crimesFull[0].length/housingFull[0].length).toPrecision(3)]);
  crimesBoroughs.push(["Bronx", (crimesFull[1].length/housingFull[1].length).toPrecision(3)]);
  crimesBoroughs.push(["Brooklyn", (crimesFull[2].length/housingFull[2].length).toPrecision(3)]);
  crimesBoroughs.push(["Queens", (crimesFull[3].length/housingFull[3].length).toPrecision(3)]);
  crimesBoroughs.push(["Staten Island", (crimesFull[4].length/housingFull[4].length).toPrecision(3)]);

  organiceSafaty(crimesBoroughs);
  //console.log(crimesBoroughs);

//CRIMENES POR DISTRITO
  for (var i = 0; i < crimesFull.length; i++) {
    crimesDistricts.push([]);
    for (var k = 0; k < statesDistricts[i].length; k++) {
      crimesDistricts[i].push([statesDistricts[i][k][1], 0]);
      for (var j = 6; j < crimesFull[i].length; j++) {
        distrito = new google.maps.Polygon({paths: statesDistricts[i][k][0]});
        Dmarker = new google.maps.Marker({
          position: {lat:crimesFull[i][j][2].coordinates[1], lng: crimesFull[i][j][2].coordinates[0]}
        });
        coordenadas = Dmarker.position;
        result = google.maps.geometry.poly.containsLocation(coordenadas, distrito);
        if (result) {
          crimesDistricts[i][k][1]++;
        }
      }
    }
  }
  for (var i = 0; i < crimesDistricts.length; i++) {
    for (var j = 0; j < crimesDistricts[i].length; j++) {
      if(crimesDistricts[i].length<(parseInt((crimesDistricts[i][j][0])-((i+1)*100)))){
        crimesDistricts[i][j][1]=1000;
      }
    }
  }

  for (var i = 0; i < crimesDistricts.length; i++) {
    organiceSafaty(crimesDistricts[i]);
  }
  for (var i = 0; i < crimesDistricts.length; i++) {
    for (var j = 0; j < 3; j++) {
      total.push(crimesDistricts[i][j]);
    }
  }
  organiceSafaty(total);
  //console.log(total);
}

function organiceSafaty(crimenes){
  var cambio;
  for (var i = 0; i < crimenes.length-1; i++) {
    if(!(crimenes[i][1] <= crimenes[i+1][1])){
      cambio = crimenes[i];
      crimenes[i]=crimenes[i+1];
      crimenes[i+1]=cambio;
      organiceSafaty(crimenes);
    }
  }
}

function bestSafety(){
  var va;
  bestSafetyBoroughs();
  bestSafetyDistricts();
  for (var i = 0; i < 10; i++) {
    va = parseInt(total[i][0][0]);
    drawMarkerBest(va-1,total[i][0]);
  }
}

function drawMarkerBest(va, level){
  var distrito, Dmarker;
  for (var i = 0; i < statesDistricts[va].length; i++) {
    if (statesDistricts[va][i][1]==level) {
      distrito = new google.maps.Polygon({
        paths: statesDistricts[va][i][0],
        strokeColor: 'blue',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'blue',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        map:map
      });

    }
  }
}

function bestSafetyBoroughs(){
  document.getElementById("outBest1").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
  +"Security by Boroughs"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
  +"<thead>"
  +"<tr>"
  +"<th>Boroughs Name</th>"
  +"<th>Number of Crimes / Number of Housing</th>"
  +"</tr>"
  +"</thead>"
  +"<tbody>"
  +"<tr>"
  +"<td>"+crimesBoroughs[0][0]+"</td>"
  +"<td>"+crimesBoroughs[0][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[1][0]+"</td>"
  +"<td>"+crimesBoroughs[1][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[2][0] +"</td>"
  +"<td>"+crimesBoroughs[2][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[3][0] +"</td>"
  +"<td>"+crimesBoroughs[3][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[4][0] +"</td>"
  +"<td>"+crimesBoroughs[4][1]+"</td>"
  +"</tr>"
  +"</tbody>"
  +"</table>";
}

function bestSafetyDistricts(){
  clearMap();
  document.getElementById("outBest2").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top 10 of the Most Safe Districts"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
    +"<thead>"
      +"<tr>"
        +"<th>BoroDC</th>"
        +"<th>Number of Crimes</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr>"
        +"<td>"+total[0][0]+"</td>"
        +"<td>"+total[0][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[1][0]+"</td>"
        +"<td>"+total[1][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[2][0]+"</td>"
        +"<td>"+total[2][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[3][0]+"</td>"
        +"<td>"+total[3][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[4][0]+"</td>"
        +"<td>"+total[4][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[5][0]+"</td>"
        +"<td>"+total[5][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[6][0]+"</td>"
        +"<td>"+total[6][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[7][0]+"</td>"
        +"<td>"+total[7][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[8][0]+"</td>"
        +"<td>"+total[8][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+total[9][0]+"</td>"
        +"<td>"+total[9][1]+" Crimes</td>"
      +"</tr>"
    +"</tbody>"
  +"</table>";
}



//============================DISTANCE==========================================
function distance(){
  var service = new google.maps.DistanceMatrixService();
  for (var i = 0; i < statesDistricts.length; i++) {
    for (var j = 0; j < statesDistricts[i].length; j++) {
      service.getDistanceMatrix({
        origins: [statesDistricts[i][j][2]],
        destinations: [NYUSternSchoolofBusiness],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, callback);
    }
  }
}

function callback(response, status) {
  if (status == "OK") {
    var results = response.rows[0].elements;
    var elements = results[0];
    var distancia = elements.distance.text;
    distancia = distancia.replace(",", ".");
    var aja = parseFloat(distancia);
    distan.push(aja);
  }

}

function distanceTableValor(){
  var k = 0;
  for (var i = 0; i < statesDistricts.length; i++) {
    for (var j = 0; j < statesDistricts[i].length; j++) {
      distanceTable.push([statesDistricts[i][j][1], distan[k]]);
      k++;
    }
  }
  organiceDistance();
}

function organiceDistance(){
  var cambio;
  for (var i = 0; i < distanceTable.length-1; i++) {
    if(!(distanceTable[i][1] <= distanceTable[i+1][1])){
      cambio = distanceTable[i];
      distanceTable[i]=distanceTable[i+1];
      distanceTable[i+1]=cambio;
      organiceDistance();
    }
  }
}


function bestDistance(){
  clearMap();
  prepareRout();
  document.getElementById("outBest1").innerHTML ="";
  document.getElementById("outBest2").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top 10 Best Distance"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
    +"<thead>"
      +"<tr>"
        +"<th>Boro DC</th>"
        +"<th>Distance to NYU</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr>"
        +"<td>"+distanceTable[0][0]+"</td>"
        +"<td>"+distanceTable[0][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[1][0]+"</td>"
        +"<td>"+distanceTable[1][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[2][0]+"</td>"
        +"<td>"+distanceTable[2][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[3][0]+"</td>"
        +"<td>"+distanceTable[3][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[4][0]+"</td>"
        +"<td>"+distanceTable[4][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[5][0]+"</td>"
        +"<td>"+distanceTable[5][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[6][0]+"</td>"
        +"<td>"+distanceTable[6][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[7][0]+"</td>"
        +"<td>"+distanceTable[7][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[8][0]+"</td>"
        +"<td>"+distanceTable[8][1]+" km</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+distanceTable[9][0]+"</td>"
        +"<td>"+distanceTable[9][1]+" km</td>"
      +"</tr>"
    +"</tbody>"
  +"</table>";
}

function prepareRout(){
  var va;
  for (var i = 0; i < 10; i++) {
    va = parseInt(distanceTable[i][0][0]);
    getMarker(va-1,distanceTable[i][0]);
  }
}

function getMarker(va, level){
  var Dmarker, distrito;
  for (var i = 0; i < statesDistricts[va].length; i++) {
    if (statesDistricts[va][i][1]==level) {
      distrito = new google.maps.Polygon({
        paths: statesDistricts[va][i][0],
        strokeColor: 'blue',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'blue',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        map:map
      });
      getRoute(Dmarker);
    }
  }
}

function getRoute(marker){
  var originPoint = NYUSternSchoolofBusinessMarker.position;
  var request ={
    origin: originPoint,
    destination: marker.position,
    travelMode: 'DRIVING'
  };
  directionsRenderer.setMap(map);
  directionsService.route(request,function(result,status){
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
    }
  })
}

function affordability(){

}

function bestAffordability(){
  clearMap();
  document.getElementById("outBest1").innerHTML ="";
  document.getElementById("outBest2").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top 10 Best Affordability"
  +"</h4>"
}

//==============================================================================
//==============================================================================
//==============================================================================

$(document).ready(function() {
  $("#Draw").on("click",drawMap)
  $("#Clear").on("click",newMap)
  $("#Estadisticas").on("click",estadistics)
  $("#Safety").on("click",bestSafety)
  $("#Distance").on("click",bestDistance)
  $("#Affordability").on("click",bestAffordability)
});
