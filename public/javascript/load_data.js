import {tiempoArr, precipitacionArr, uvArr, temperaturaArr} from './static_data.js';

let fechaActual = () => new Date().toISOString().slice(0,10);

let cargarPrecipitacion = () => {
    let actual = fechaActual();

    let datos = [];

    for (let index = 0; index < tiempoArr.length; index++) {
        const tiempo = tiempoArr[index];
        const precipitacion = precipitacionArr[index]
    
        if(tiempo.includes(actual)) {
          datos.push(precipitacion)
        }
    }

    let max = Math.max(...datos)
    let min = Math.min(...datos)
    let sum = datos.reduce((a, b) => a + b, 0);
    let prom = (sum / datos.length) || 0;

    let precipitacionMinValue = document.getElementById("precipitacionMinValue")
    let precipitacionPromValue = document.getElementById("precipitacionPromValue")
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue")
    
    precipitacionMinValue.textContent = `Min ${min} [mm]`
    precipitacionPromValue.textContent = `Prom ${ Math.round(prom * 100) / 100 } [mm]`
    precipitacionMaxValue.textContent = `Max ${max} [mm]`
}

//cargarPrecipitacion()

let cargarFechaActual = () => {
    let coleccionHTML = document.getElementsByTagName("h6")
    let tituloH6 = coleccionHTML[0]
    tituloH6.textContent = fechaActual()
}

//cargarFechaActual()

let cargarOpenMeteo = () => {

    //URL que responde con la respuesta a cargar
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto'; 
  
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        
        console.log(responseJSON);  
        //Respuesta en formato JSON
        
        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot1');
        
        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;
        
        //Etiquetas de los datos
        let data = responseJSON.hourly.temperature_2m;
        
        //Objeto de configuración del gráfico
        let config = {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                    {
                    label: 'Temperature [2m]',
                    data: data,
                    borderColor: '#d2691e',
                    }
                ]
            }
        };
        
        //Objeto con la instanciación del gráfico
        let chart1  = new Chart(plotRef, config);
        })
    .catch(console.error);
}

let cargarOpenMete = () => {

    //URL que responde con la respuesta a cargar
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m,precipitation_probability&timezone=auto'
  
    fetch( URL )
      .then(responseText => responseText.json())
      .then(responseJSON => {
        
        console.log(responseJSON);  
        //Respuesta en formato JSON
        
        //Referencia al elemento con el identificador plot
        let plotRef = document.getElementById('plot2');
        
        //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;
        
        //Etiquetas de los datos
        let data = responseJSON.hourly.precipitation_probability;
        let data2 = responseJSON.hourly.temperature_2m;
        //Objeto de configuración del gráfico
        let config = {
            type: 'line',
            data: {
                labels: labels, 
                datasets: [
                    {
                    label: 'Precipitation probability',
                    data: data, 
                    },
                    {
                    label: 'Temperature',
                    data: data2,
                    }
                ]
            }
        };
        
        //Objeto con la instanciación del gráfico
        let chart2  = new Chart(plotRef, config);
        })
    .catch(console.error);
}




cargarPrecipitacion()
cargarFechaActual()
cargarOpenMeteo()
cargarOpenMete()


let parseXML = (responseText) => {

    const parser = new DOMParser();
    const xml = parser.parseFromString(responseText, "application/xml");

    console.log(xml)

    // Referencia al elemento `#forecastbody` del documento HTML

    let forecastElement = document.querySelector("#forecastbody")
    forecastElement.innerHTML = ''

    // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
    let timeArr = xml.querySelectorAll("time")

    timeArr.forEach(time => {
        
        let from = time.getAttribute("from").replace("T", " ")

        let humidity = time.querySelector("humidity").getAttribute("value")
        let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
        let precipitation = time.querySelector("precipitation").getAttribute("probability")
        let pressure = time.querySelector("pressure").getAttribute("unit")
        let cloud = time.querySelector("clouds").getAttribute("value")

        let template = `
            <tr>
                <td>${from}</td>
                <td>${humidity}</td>
                <td>${windSpeed}</td>
                <td>${precipitation}</td>
                <td>${pressure}</td>
                <td>${cloud}</td>
            </tr>
        `

        //Renderizando la plantilla en el elemento HTML
        forecastElement.innerHTML += template;
    })

}

//Callback Async
let selectListener = async (event) => {

    let selectedCity = event.target.value

    // Lea la entrada de almacenamiento local
    let cityStorage = localStorage.getItem(selectedCity);
    if (cityStorage == null) {
        try {
        
            //API key
            let APIkey = 'a42f3c833b01df734e4e076c0047847f'
            let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`
        
            let response = await fetch(url)
            let responseText = await response.text()
                
            await parseXML(responseText)

            // Guarde la entrada de almacenamiento local
            await localStorage.setItem(selectedCity, responseText)
        
        } catch (error) {
            console.log(error)
        }
    } 
    else {
        // Procese un valor previo
        parseXML(cityStorage)
    }
}


let loadForecastByCity = () => {
  
    //Handling event
    let selectElement = document.querySelector("select")
    selectElement.addEventListener("change", selectListener)  
}   


loadForecastByCity()


let loadExternalTable = async() => {
  
    //Requerimiento asíncrono

    let proxyURL = 'https://cors-anywhere.herokuapp.com/'
    let endpoint = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'

    let response = await fetch(endpoint)
    let responseText = await response.text()

    const parser = await new DOMParser();
    const xml = await parser.parseFromString(responseText,"text/html");

    let table = await xml.querySelector("#postcontent table")
    
    document.getElementById("monitoreo").innerHTML = table.outerHTML
}
   
loadExternalTable()