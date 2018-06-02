
const GOOGLE_KEY = "AIzaSyDv7dN0dT4TR0e8in4TH-0sRUaRfA6FxVY";
const NY_districts_shapes = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";
const NY_neighborhood_names = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const NY_housing = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";
const NY_crimes = "https://data.cityofnewyork.us/resource/9s4h-37hy.json";
const NY_museums = "https://data.cityofnewyork.us/api/views/fn6f-htvy/rows.json?accessType=DOWNLOAD";
const NY_art_galleries = "https://data.cityofnewyork.us/api/views/43hw-uvdj/rows.json?accessType=DOWNLOAD";


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
var museos=[];
var galleries=[];
var coord;
var longitud, latitud;
var drawDistri;

var safetyTable=[];
var safetyFull=[];
var distan=[];
var distanceTable=[];
var affordabilityOrigen=[];
var affordabilityTable=[];
var affordabilityFull=[];
var topOrigen=[];
var topBoroughs=[];
var topFull=[];

var directionsService;
var directionsRenderer;
var listo = false;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: NYUSternSchoolofBusiness
  });
  newMap();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  getDataBoroughs();
  getDataHousing();
  getDataCrimes();
  getDataNeighborhood();
  getDataMuseums();
  getDataGalleries();
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
    dataRow = data.responseJSON.data;
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

function getDataMuseums(){
  var data, dataRow;
  data = $.get(NY_museums, function(){}).done(function(){
    dataRow = data.responseJSON.data;
    museumsProcessor(dataRow);
  })
  .fail(function(error){console.log(error);})
}

function getDataGalleries(){
  var data, dataRow;
  data = $.get(NY_art_galleries, function(){}).done(function(){
    dataRow = data.responseJSON.data;
    galleriesProcessor(dataRow);
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
    housing.push(dataRow[i][15], {lat:latitud, lng:longitud}, dataRow[i][31], dataRow[i][12]);
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

function museumsProcessor(data){
  for (var i = 0; i < data.length; i++) {
    data[i][8] = data[i][8].slice(7, data[i][8].length-1);
    data[i][8] = data[i][8].split(" ");
    data[i][8][0] = parseFloat(data[i][8][0]);
    data[i][8][1] = parseFloat(data[i][8][1]);
    museos.push([data[i][8],data[i][9],data[i][10]]);
  }
}

//==============================================================================

function galleriesProcessor(data){
  for (var i = 0; i < data.length; i++) {
    data[i][9] = data[i][9].slice(7, data[i][8].length-1);
    data[i][9] = data[i][9].split(" ");
    data[i][9][0] = parseFloat(data[i][9][0]);
    data[i][9][1] = parseFloat(data[i][9][1]);
    galleries.push([data[i][9],data[i][10],data[i][12]]);
  }
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
  if (document.getElementById('MuseumsMarkers').checked) {
    drawMarkersMuseums();
  }
  if (document.getElementById('GalleriesMarkers').checked) {
    drawMarkersGalleries();
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
  NYUSternSchoolofBusinessMarker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    position: NYUSternSchoolofBusiness,
    label: "NYU Stern School of Business",
    map: map,
    icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Yellow.png"
  });
}

function drawMarkers(){  //DRAW MARKERS
    BronxDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: BronxDist,
      title: "Bronx",
      label: "Bronx",
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Red.png",
      map: map
    });
    BrooklynDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: BrooklynDist,
      title: "Brooklyn",
      label: "Brooklyn",
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Red.png",
      map: map
    });
    ManhattanDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: ManhattanDist,
      title: "Manhattan",
      label: "Manhattan",
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Red.png",
      map: map
    });
    QueensDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: QueensDist,
      title: "Queens",
      label: "Queens",
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Red.png",
      map: map
    });
    StatenIslandDistMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: StatenIslandDist,
      title: "Staten Island",
      label: "Staten Island",
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Red.png",
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
        title: statesDistricts[1][i][1],
        label: statesDistricts[1][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map: map
      });
    }
  }else if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < statesDistricts[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[2][i][2],
        title: statesDistricts[2][i][1],
        label: statesDistricts[2][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map: map
      });
    }
  }else if(drawDistri == 'Manhattan'){
    for (var i = 0; i < statesDistricts[0].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[0][i][2],
        title: statesDistricts[0][i][1],
        label: statesDistricts[0][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map: map
      });
    }
  }else if(drawDistri == 'Queens'){
    for (var i = 0; i < statesDistricts[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[3][i][2],
        title: statesDistricts[3][i][1],
        label: statesDistricts[3][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map: map
      });
    }
  }else if(drawDistri == 'Staten Island'){
    for (var i = 0; i < statesDistricts[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: statesDistricts[4][i][2],
        title: statesDistricts[4][i][1],
        label: statesDistricts[4][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map: map
      });
    }
  }else {
    var aja = ['Bronx','Brooklyn','Manhattan','Queens','Staten Island'];
    for (var i = 0; i < aja.length; i++) {
      drawMarkersBoroDC(aja[i]);
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
        title: NeighborhoodsFull[0][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Chartreuse.png",
        map: map
      });
    }
  }else if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < NeighborhoodsFull[1].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[1][i][2],
        title: NeighborhoodsFull[1][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Chartreuse.png",
        map: map
      });
    }
  }else if(drawDistri == 'Manhattan'){
    for (var i = 0; i < NeighborhoodsFull[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[2][i][2],
        title: NeighborhoodsFull[2][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Chartreuse.png",
        map: map
      });
    }
  }else if(drawDistri == 'Queens'){
    for (var i = 0; i < NeighborhoodsFull[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[3][i][2],
        title: NeighborhoodsFull[3][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Chartreuse.png",
        map: map
      });
    }
  }else if(drawDistri == 'Staten Island'){
    for (var i = 0; i < NeighborhoodsFull[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: NeighborhoodsFull[4][i][2],
        title: NeighborhoodsFull[4][i][1],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Chartreuse.png",
        map: map
      });
    }
  }else{
    var aja = ['Bronx','Brooklyn','Manhattan','Queens','Staten Island'];
    for (var i = 0; i < aja.length; i++) {
      drawNeighborhoodMarkers(aja[i]);
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
        title: housingFull[0][i][3],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Blue.png",
        map: map
      });
    }
  }else if(drawDistri == 'Bronx'){
    for (var i = 0; i < housingFull[1].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[1][i][1],
        title: housingFull[1][i][3],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Blue.png",
        map: map
      });
    }
  }else if(drawDistri == 'Brooklyn'){
    for (var i = 0; i < housingFull[2].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[2][i][1],
        title: housingFull[2][i][3],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Blue.png",
        map: map
      });
    }
  }else if(drawDistri == 'Queens'){
    for (var i = 0; i < housingFull[3].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[3][i][1],
        title: housingFull[3][i][3],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Blue.png",
        map: map
      });
    }
  }else if(drawDistri == 'Staten Island'){
    for (var i = 0; i < housingFull[4].length; i++) {
      Marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: housingFull[4][i][1],
        title: housingFull[4][i][3],
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Blue.png",
        map: map
      });
    }
  }else{
    var aja = ['Bronx','Brooklyn','Manhattan','Queens','Staten Island'];
    for (var i = 0; i < aja.length; i++) {
      drawHousingMarkers(aja[i]);
    }
  }
}

function drawMarkersMuseums(){  //DRAW MARKERS
  var Marker;
  for (var i = 0; i < museos.length; i++) {
    Marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: {lat: museos[i][0][1] , lng: museos[i][0][0]} ,
      title: museos[i][1] + " Tel:" + museos[i][2],
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Grey.png",
      map: map
    });
  }
}

function drawMarkersGalleries(){  //DRAW MARKERS
  var Marker;
  for (var i = 0; i < galleries.length; i++) {
    Marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: {lat: galleries[i][0][1] , lng: galleries[i][0][0]} ,
      title: galleries[i][1] + " Tel:" + galleries[i][2],
      icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Azure.png",
      map: map
    });
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
  top3();
  document.getElementById("outBest2").innerHTML =
    "<br>"
    +"<h4 style=\"text-align: center; color: #007bff\">"
      +"Carga Completa"
    +"</h4>";
}

function safety(){
  var distrito, result, coordenadas, Dmarker;
  crimesBoroughs.push(["Manhattan", (crimesFull[0].length/housingFull[0].length).toPrecision(3),crimesFull[0].length]);
  crimesBoroughs.push(["Bronx", (crimesFull[1].length/housingFull[1].length).toPrecision(3),crimesFull[0].length]);
  crimesBoroughs.push(["Brooklyn", (crimesFull[2].length/housingFull[2].length).toPrecision(3),crimesFull[0].length]);
  crimesBoroughs.push(["Queens", (crimesFull[3].length/housingFull[3].length).toPrecision(3),crimesFull[0].length]);
  crimesBoroughs.push(["Staten Island", (crimesFull[4].length/housingFull[4].length).toPrecision(3),crimesFull[0].length]);
  organiceSafaty(crimesBoroughs);
  //console.log(crimesBoroughs);

//CRIMENES POR DISTRITO====================
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
    for (var j = 0; j < crimesDistricts[i].length; j++) {
      safetyFull.push(crimesDistricts[i][j]);
    }
  }
  organiceSafaty(safetyFull);
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
  dataGraficsSafety();
  bestSafetyBoroughs();
  bestSafetyDistricts();
  for (var i = 0; i < 10; i++) {
    va = parseInt(safetyFull[i][0][0]);
    drawMarkerBest(va-1,safetyFull[i][0]);
  }
}


function dataGraficsSafety(){
  var DatosSafety=[];
  for (var i = 0; i < safetyFull.length; i++) {
    DatosSafety.push(safetyFull[i][1]);
  }
  var x = d3.scaleLinear()
    .domain([0, d3.max(DatosSafety)])
    .range([0,800])

  d3.select('#graphics')
    .selectAll('div')
    .data(DatosSafety)
    .enter().append('div')
    .attr('class', 'barra')
    .style('height', function(d){
      return x(d) + 'px';
    })
}


function drawMarkerBest(va, level){
  var distrito, Dmarker;
  for (var i = 0; i < statesDistricts[va].length; i++) {
    if (statesDistricts[va][i][1]==level) {
      distrito = new google.maps.Polygon({
        paths: statesDistricts[va][i][0],
        strokeColor: 'green',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'green',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        title: level,
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
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
  +"<th>Number of Crimes</th>"
  +"<th>Crimes / Housing</th>"
  +"</tr>"
  +"</thead>"
  +"<tbody>"
  +"<tr>"
  +"<td>"+crimesBoroughs[0][0]+"</td>"
  +"<td>"+crimesBoroughs[0][2]+"</td>"
  +"<td>"+crimesBoroughs[0][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[1][0]+"</td>"
  +"<td>"+crimesBoroughs[1][2]+"</td>"
  +"<td>"+crimesBoroughs[1][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[2][0]+"</td>"
  +"<td>"+crimesBoroughs[2][2]+"</td>"
  +"<td>"+crimesBoroughs[2][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[3][0]+"</td>"
  +"<td>"+crimesBoroughs[3][2]+"</td>"
  +"<td>"+crimesBoroughs[3][1]+"</td>"
  +"</tr>"
  +"<tr>"
  +"<td>"+crimesBoroughs[4][0]+"</td>"
  +"<td>"+crimesBoroughs[4][2]+"</td>"
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
        +"<th>Boro DC</th>"
        +"<th>Number of Crimes</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr>"
        +"<td>"+safetyFull[0][0]+"</td>"
        +"<td>"+safetyFull[0][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[1][0]+"</td>"
        +"<td>"+safetyFull[1][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[2][0]+"</td>"
        +"<td>"+safetyFull[2][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[3][0]+"</td>"
        +"<td>"+safetyFull[3][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[4][0]+"</td>"
        +"<td>"+safetyFull[4][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[5][0]+"</td>"
        +"<td>"+safetyFull[5][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[6][0]+"</td>"
        +"<td>"+safetyFull[6][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[7][0]+"</td>"
        +"<td>"+safetyFull[7][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[8][0]+"</td>"
        +"<td>"+safetyFull[8][1]+" Crimes</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+safetyFull[9][0]+"</td>"
        +"<td>"+safetyFull[9][1]+" Crimes</td>"
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
  dataGraficsDistance();
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

function dataGraficsDistance(){
  var DatosDistance=[];
  for (var i = 0; i < distanceTable.length; i++) {
    DatosDistance.push(distanceTable[i][1]);
  }
  var x = d3.scaleLinear()
    .domain([0, d3.max(DatosDistance)])
    .range([0,800])

  d3.select('#graphics')
    .selectAll('div')
    .data(DatosDistance)
    .enter().append('div')
    .attr('class', 'barra')
    .style('height', function(d){
      return x(d) + 'px';
    })
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
        strokeColor: 'green',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'green',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        title: level,
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map:map
      });
    }
  }
}

//==============================================================================

function affordability(){
  var distrito, result, coordenadas, Dmarker;
  for (var i = 0; i < statesDistricts.length; i++) {
    affordabilityTable.push([]);
    for (var j = 0; j < statesDistricts[i].length; j++) {
      affordabilityTable[i].push([statesDistricts[i][j][1], 0]);
      for (var k = 0; k < housingFull[i].length; k++) {
        if (housingFull[i][k][2] !== "0") {
          distrito = new google.maps.Polygon({paths: statesDistricts[i][j][0]});
          Dmarker = new google.maps.Marker({
            position: {lat:housingFull[i][k][1].lat, lng: housingFull[i][k][1].lng}
          });
          coordenadas = Dmarker.position;
          result = google.maps.geometry.poly.containsLocation(coordenadas, distrito);
          if (result) {
            affordabilityTable[i][j][1] += parseInt(housingFull[i][k][2]);
            affordabilityOrigen=affordabilityTable;
          }
        }
      }
    }
  }
  for (var i = 0; i < affordabilityTable.length; i++) {
    organiceAffordability(affordabilityTable[i]);
  }
  for (var i = 0; i < affordabilityTable.length; i++) {
    for (var j = 0; j < affordabilityTable[i].length; j++) {
      affordabilityFull.push(affordabilityTable[i][j]);
    }
  }
  organiceAffordability(affordabilityFull);
}

function organiceAffordability(afford){
  var cambio;
  for (var i = 0; i < afford.length-1; i++) {
    if((afford[i][1] < afford[i+1][1])){
      cambio = afford[i];
      afford[i]=afford[i+1];
      afford[i+1]=cambio;
      organiceAffordability(afford);
    }
  }
}

function bestAffordability(){
  var va;
  bestAffordabilityDistrics();
  dataGraficsAffordability();
  clearMap();
  for (var i = 0; i < 10; i++) {
    va = parseInt(affordabilityFull[i][0][0]);
    drawMarkerBestAffordability(va-1,affordabilityFull[i][0]);
  }
}

function dataGraficsAffordability(){
  var DatosAffordability=[];
  for (var i = 0; i < affordabilityFull.length; i++) {
    DatosAffordability.push(affordabilityFull[i][1]);
  }
  var x = d3.scaleLinear()
    .domain([0, d3.max(DatosAffordability)])
    .range([0,800])

  d3.select('#graphics')
    .selectAll('div')
    .data(DatosAffordability)
    .enter().append('div')
    .attr('class', 'barra')
    .style('height', function(d){
      return x(d) + 'px';
    })
}

function drawMarkerBestAffordability(va, level){
  var distrito, Dmarker;
  for (var i = 0; i < statesDistricts[va].length; i++) {
    if (statesDistricts[va][i][1]==level) {
      distrito = new google.maps.Polygon({
        paths: statesDistricts[va][i][0],
        strokeColor: 'green',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'green',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        title: level,
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map:map
      });
    }
  }
}

function bestAffordabilityDistrics(){
  document.getElementById("outBest1").innerHTML ="";
  document.getElementById("outBest2").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top 10 Best Affordability"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
    +"<thead>"
      +"<tr>"
        +"<th>Boro DC</th>"
        +"<th>Housing Affordability</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr>"
        +"<td>"+affordabilityFull[0][0]+"</td>"
        +"<td>"+affordabilityFull[0][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[1][0]+"</td>"
        +"<td>"+affordabilityFull[1][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[2][0]+"</td>"
        +"<td>"+affordabilityFull[2][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[3][0]+"</td>"
        +"<td>"+affordabilityFull[3][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[4][0]+"</td>"
        +"<td>"+affordabilityFull[4][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[5][0]+"</td>"
        +"<td>"+affordabilityFull[5][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[6][0]+"</td>"
        +"<td>"+affordabilityFull[6][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[7][0]+"</td>"
        +"<td>"+affordabilityFull[7][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[8][0]+"</td>"
        +"<td>"+affordabilityFull[8][1]+" Housing</td>"
      +"</tr>"
      +"<tr>"
        +"<td>"+affordabilityFull[9][0]+"</td>"
        +"<td>"+affordabilityFull[9][1]+" Housing</td>"
      +"</tr>"
    +"</tbody>"
  +"</table>";
}

//==============================================================================

function top3(){
  for (var i = 0; i < statesDistricts.length; i++) {
    topOrigen.push([]);
    for (var j = 0; j < statesDistricts[i].length; j++) {
      topOrigen[i].push([statesDistricts[i][j][1], 0]);

      for (var x = 0; x < safetyFull.length; x++) {
        if(safetyFull[x][0] == statesDistricts[i][j][1]){
          topOrigen[i][j][1] += x;
        }
      }
      for (var y = 0; y < distanceTable.length; y++) {
        if(distanceTable[y][0] == statesDistricts[i][j][1]){
          topOrigen[i][j][1] += y;
        }
      }
      for (var z = 0; z < affordabilityFull.length; z++) {
        if(affordabilityFull[z][0] == statesDistricts[i][j][1]){
          topOrigen[i][j][1] += z;
        }
      }
    }
  }
  for (var i = 0; i < topOrigen.length; i++) {
    organiceTop(topOrigen[i]);
  }
  for (var i = 0; i < topOrigen.length; i++) {
    for (var j = 0; j < topOrigen[i].length; j++) {
      topFull.push(topOrigen[i][j]);
    }
  }
  organiceTop(topFull);
  topBoroughs.push(["Manhattan",0],["Bronx",0],["Brooklyn",0],["Queens",0],["Staten Island",0]);
  for (var i = 0; i < topFull.length; i++) {
    if ("1" == parseInt(topFull[i][0][0])) {
      topBoroughs[0][1]+=topFull[i][1];
    }else if ("2" == parseInt(topFull[i][0][0])) {
      topBoroughs[1][1]+=topFull[i][1];
    }else if ("3" == parseInt(topFull[i][0][0])) {
      topBoroughs[2][1]+=topFull[i][1];
    }else if ("4" == parseInt(topFull[i][0][0])) {
      topBoroughs[3][1]+=topFull[i][1];
    }else if ("5" == parseInt(topFull[i][0][0])) {
      topBoroughs[4][1]+=topFull[i][1];
    }
  }
  for (var i = 0; i < topBoroughs.length; i++) {
    topBoroughs[i][1]=(topBoroughs[i][1]/topOrigen[i].length);
  }
  organiceTop(topBoroughs);
}

function organiceTop(top){
  var cambio;
  for (var i = 0; i < top.length-1; i++) {
    if(!(top[i][1] <= top[i+1][1])){
      cambio = top[i];
      top[i]=top[i+1];
      top[i+1]=cambio;
      organiceTop(top);
    }
  }
}

function bestTop(){
  clearMap();
  for (var i = 0; i < 3; i++) {
    va = parseInt(topFull[i][0][0]);
    drawMarkerBestTop(va-1,topFull[i][0]);
  }
  document.getElementById("outBest1").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top Best Boroughs"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
    +"<thead>"
      +"<tr>"
        +"<th>#</th>"
        +"<th>Name Boroughs</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr>"
        +"<td>1</td>"
        +"<td>"+topBoroughs[0][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>2</td>"
        +"<td>"+topBoroughs[1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>3</td>"
        +"<td>"+topBoroughs[2][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>4</td>"
        +"<td>"+topBoroughs[3][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>5</td>"
        +"<td>"+topBoroughs[4][0]+"</td>"
      +"</tr>"
    +"</tbody>"
  +"</table>";
  document.getElementById("outBest2").innerHTML =
  "<br>"
  +"<h4 style=\"text-align: center; color: #007bff\">"
    +"Top 10 Best Districts"
  +"</h4>"
  +"<table class=\"table table-bordered\">"
    +"<thead>"
      +"<tr>"
        +"<th>#</th>"
        +"<th>Boro DC</th>"
        +"<th>Name Boroughs</th>"
      +"</tr>"
    +"</thead>"
    +"<tbody>"
      +"<tr class=\"table-success\">"
        +"<td>1</td>"
        +"<td>"+topFull[0][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[0][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr class=\"table-success\">"
        +"<td>2</td>"
        +"<td>"+topFull[1][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[1][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr class=\"table-success\">"
        +"<td>3</td>"
        +"<td>"+topFull[2][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[2][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>4</td>"
        +"<td>"+topFull[3][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[3][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>5</td>"
        +"<td>"+topFull[4][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[4][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>6</td>"
        +"<td>"+topFull[5][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[5][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>7</td>"
        +"<td>"+topFull[6][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[6][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>8</td>"
        +"<td>"+topFull[7][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[7][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>9</td>"
        +"<td>"+topFull[8][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[8][0][0]))-1][0]+"</td>"
      +"</tr>"
      +"<tr>"
        +"<td>10</td>"
        +"<td>"+topFull[9][0]+"</td>"
        +"<td>"+topBoroughs[(parseInt(topFull[9][0][0]))-1][0]+"</td>"
      +"</tr>"
    +"</tbody>"
  +"</table>";
}

function drawMarkerBestTop(va, level){
  var distrito, Dmarker;
  for (var i = 0; i < statesDistricts[va].length; i++) {
    if (statesDistricts[va][i][1]==level) {
      distrito = new google.maps.Polygon({
        paths: statesDistricts[va][i][0],
        strokeColor: 'green',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'green',
        fillOpacity: 0.35
      });
      distrito.setMap(map);
      Dmarker = new google.maps.Marker({
        position: statesDistricts[va][i][2],
        label: level,
        title: level,
        icon: "http://individual.icons-land.com/IconsPreview/MapMarkers/PNG/Centered/32x32/MapMarker_Marker_Outside_Violet.png",
        map:map
      });
    }
  }
}


function downloadTable(){
    $("table").tableToCSV();
}

$(document).ready(function() {
  $("#Draw").on("click",drawMap)
  $("#Clear").on("click",newMap)
  $("#Estadisticas").on("click",estadistics)
  $("#Safety").on("click",bestSafety)
  $("#Distance").on("click",bestDistance)
  $("#Affordability").on("click",bestAffordability)
  $("#Top3").on("click",bestTop)
  $("#Download").on("click",downloadTable)
});
