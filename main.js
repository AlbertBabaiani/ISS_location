const location_sun_moon = document.getElementById('location_sun_moon');
const altitude_id = document.getElementById('altitude_id');
const longitude_id = document.getElementById('longitude_id');
const latitude_id = document.getElementById('latitude_id');
const velocity_id = document.getElementById('velocity_id');

const distance_between = document.querySelector('.distance_between');
const distance = document.getElementById('distance');

const error_message = document.querySelector('.error-message');

let my_location_allowed = false;
let more_than_once = false;

///////////////////////////////////////////////////////



const control_panel_sub = document.querySelector('.control-panel-sub');
const shrink_control_panel = document.getElementById('shrink_control_panel');

shrink_control_panel.addEventListener('click', function(){
    if(control_panel_sub.classList.contains('expanded-panel')){
        control_panel_sub.classList.remove('expanded-panel');
    }
    else{
        control_panel_sub.classList.add('expanded-panel');
    }
})


const hide_control_panel = document.querySelector('.hide_control_panel');

hide_control_panel.addEventListener('click', function(){
    control_panel_sub.classList.remove('expanded-panel');
    control_panel_sub.classList.toggle('hidden-panel');

    if(control_panel_sub.classList.contains('hidden-panel')){
        document.querySelector('.h_c_p').style.transform = 'rotate(-180deg)'
    }
    else{
        document.querySelector('.h_c_p').style.transform = 'rotate(0deg)'
    }
})








// ///////////////////////////////////////


const map = L.map('map').setView([0, 0], 5);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




// Effect on clicking -----------

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

// map.on('click', onMapClick);

const popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

// Effect on clicking end -----------






// Custom icon ------------------------

const iss_icon = L.icon({
    iconUrl: 'iss200.png',
    iconSize: [90, 72],
    iconAnchor: [45, 36]
});

const iss_marker = L.marker([0, 0], {icon: iss_icon}).addTo(map);

const circle = L.circle(iss_marker.getLatLng(), {
    color: 'white',
    fillColor: 'gray',
    fillOpacity: 0.3,
    radius: 2400000
  }).addTo(map);


// Custom icon end ------------------------











/////////////////////////////////
////// Zoom out
/////////////////////////////////

let focus_on_iss_boolean = true;

let my_loc_marker;

function myLocation(){
    focus_on_iss_boolean = false;
    focus_icon();
    map.locate({setView: true, maxZoom: 16});

    function onLocationFound(e) {
        const radius = e.accuracy;
        console.log(more_than_once)
        
        if(!more_than_once){
            my_loc_marker = L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + Math.round(radius) + " meters from this point").openPopup();

            my_loc = L.circle(e.latlng, radius).addTo(map);
            more_than_once = true;
        }

        
        my_location_allowed = true;
    }

    map.on('locationfound', onLocationFound);




    // Error --------------------

    function onLocationError(e) {
        my_location_allowed = false;
        alert(e.message);
    }

    map.on('locationerror', onLocationError);

    // Error End--------------------
}



function zoomOut(){
    if(!focus_on_iss_boolean){
        map.setView([0, 0], 1);
    }
    else{
        map.setZoom(1);
    }
    focus_icon();

}

/////////////////////////////////
////// Zoom out End
/////////////////////////////////








function change_focus(){
    if(focus_on_iss_boolean){
        // focus_on_iss_btn.querySelector('span').textContent = 'Focus From Iss'
        focus_on_iss_boolean = false;
    }
    else{
        // focus_on_iss_btn.querySelector('span').textContent = 'Unfocus From Iss'
        focus_on_iss_boolean = true;
        map.setZoom(5);
    }

    focus_icon();
}





const focus_on_iss_btn = document.getElementById('focus_on_iss');






const url = 'https://api.wheretheiss.at/v1/satellites/25544'

async function get_iss(){
    const response = await fetch(url)
    const data = await response.json();
    
    const {latitude, longitude} = data;
    // console.log(data)

    show_info(data)

    iss_marker.setLatLng([latitude, longitude]);
    circle.setLatLng([latitude+0, longitude])

    if(focus_on_iss_boolean){
        map.setView([latitude, longitude]);
    }


    if (my_location_allowed) {
        distance_between.style.display = 'block';
        let distancee = iss_marker.getLatLng().distanceTo(my_loc.getLatLng());

        distance.textContent = Math.round(distancee / 1000).toLocaleString();
    }

    error_message.style.display = 'none';

}

// get_iss()

setInterval(() => {
    get_iss().catch(error => {
        console.log(error);
        error_message.style.display = 'block';
    });
}, 2000);




function focus_icon(){
    if(focus_on_iss_boolean){
        focus_on_iss_btn.querySelector('span').textContent = 'Unfocus from Iss'
        focus_on_iss_btn.style.background = '#36a2eb'
        focus_on_iss_btn.style.color = '#fff'
    }
    else{
        focus_on_iss_btn.querySelector('span').textContent = 'Focus on Iss'
        focus_on_iss_btn.style.background = '#d7d7d7'
        focus_on_iss_btn.style.color = 'initial'
    }
}

focus_icon();


function show_info(arr){
    altitude_id.textContent = arr.altitude;
    longitude_id.textContent = arr.longitude;
    latitude_id.textContent = arr.latitude;
    velocity_id.textContent = Math.toFixed(arr.velocity, 2);

    if(arr.visibility === 'daylight'){
        location_sun_moon.textContent = 'The ISS is in daylight';
        location_sun_moon.parentNode.classList.add('day')
        location_sun_moon.parentNode.classList.remove('night')
    }
    else{
        location_sun_moon.textContent = "The ISS is in Earth's shadow";
        location_sun_moon.parentNode.classList.add('night')
        location_sun_moon.parentNode.classList.remove('day')
    }
}


