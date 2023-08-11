
(function() {

    
    const lat = 6.1659276;
    const lng = -75.5997826;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    // utilizar provider y geocoder
    const gocodeService =L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //El pin
    marker = new L.marker([lat, lng],{
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    //detectar el moviemiento de pin
    marker.on('moveend', function(e){
        marker = e.target        
        const posicion = marker.getLatLng();     
        
        console.log(posicion)
        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng))

        // obtener informacion de la calle a l soltar el pin
        gocodeService.reverse().latlng(posicion,13).run(function(error, resultado){
            //console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel)

            // llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })

})()