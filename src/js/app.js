//import getBreweries from function from beer.js
import getBreweries from "./beer";
//import cities.json with npm
import cities from "cities.json";
import "./general";

//define BreweryMap class
class BreweryMap {
  //define constructor
  constructor() {
    //define instance variables
    //ui elements
    this.$searchCity = document.getElementById("searchCity");
    this.$searchState = document.getElementById("searchState");
    this.$numInput = document.getElementById("numInput");
    this.$submitBtn = document.getElementById("submitBtn");
    this.$resetBtn = document.getElementById("resetBtn");
    //bubbleButton is the DOM element with class="bubbleButton"
    this.$bubbleButton = document.querySelector(".bubbleButton");
    //Google API key from .env file
    this.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    //citiesObj is an empty object
    this.citiesObj = {};
    //cityOptions is the DOM element with id="cityOptions"
    this.cityOptions = document.getElementById("cityOptions");
    //stateOptions is the DOM element with id="stateOptions"
    this.stateOptions = document.getElementById("stateOptions");
    //numOptions is the DOM element with id="numOptions"
    this.numOptions = document.getElementById("numOptions");
    //bubbleButton is the DOM element with class="bubbleButton"
    this.checkScreenWidth = this.checkScreenWidth.bind(this);
    //coords is an empty string
    this.coords = "";
    //cityLatLng is null
    this.cityLatLng = null;
    this.stateCodes = [];
    this.markers = [];

    //call populateCityOptions, populateStateOptions, populateNumOptions, and addBubbleButtonListener
    this.populateCityOptions();
    this.populateStateOptions();
    this.populateNumOptions();
    this.addBubbleButtonListener();
    this.addResetButtonListener();

    window.addEventListener("resize", this.checkScreenWidth);
  }

  //define methods

  //populate city options
  populateCityOptions() {
    //for each city in cities.json
    cities.forEach((city) => {
      //if the country is US and the city name is not in citiesObj
      if (city.country === "US" && !(city.name in this.citiesObj)) {
        //save the city name as a variable
        const cityName = city.name;
        //add the city name to citiesObj key and value
        this.citiesObj[cityName] = cityName;
      }
    });

    //for each city in citiesObj
    Object.values(this.citiesObj).forEach((city) => {
      //create an option element
      const option = document.createElement("option");
      //set the option value to the city name
      option.value = city;
      //append the option to the cityOptions DOM element
      this.cityOptions.appendChild(option);
    });
  }

  //populate state options
  populateStateOptions() {
    //array of state codes
    this.stateCodes = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    //for each state code
    this.stateCodes.forEach((stateCode) => {
      //create an option element
      const option = document.createElement("option");
      //set the option value to the state code
      option.value = stateCode;
      //set the option text to the state code
      option.text = stateCode;
      //append the option to the stateOptions DOM element
      this.stateOptions.appendChild(option);
    });
  }

  //populate number options
  populateNumOptions() {
    //array of numbers 1-30
    const numCodes = [];

    for (let i = 1; i <= 30; i++) {
      numCodes.push(i.toString());
    }

    //for each number in numCodes
    numCodes.forEach((numCode) => {
      //create an option element
      const option = document.createElement("option");
      //set the option value to the number
      option.value = numCode;
      //set the option text to the number
      option.text = numCode;
      //append the option to the numOptions DOM element
      this.numOptions.appendChild(option);
    });
  }

  //get latitude and longitude of city
  //async function
  async getLatLng(searchCity, searchState) {
    //fetch request to Google geocode API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${searchCity}%20${searchState}&key=${this.GOOGLE_API_KEY}`
    );
    //save response as json
    const data = await response.json();
    //cityCoords equals an object with lat and lng
    const cityCoords = {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };

    //return cityCoords
    return cityCoords;
  }

  //get brewery data
  async getData(cityLatLng) {
    //save city latitude as cityLat
    const cityLat = cityLatLng.lat;
    //save city longitude as cityLng
    const cityLng = cityLatLng.lng;
    //save number of breweries as numBreweries
    const numBreweries = document.querySelector("#numInput").value;
    //return getBreweries function with cityLat, cityLng, and numBreweries as arguments
    return getBreweries(cityLat, cityLng, numBreweries);
  }

  //initialize brewery map on bubble button click
  async initBrewMap(coords, cityLatLng) {
    //empty array of marker positions
    let markerPositions = [];

    //if coords is not empty
    if (coords && Object.keys(coords).length > 0) {
      //markerPositions equals an array of the values of coords at position.lat or lng
      markerPositions = Object.values(coords).map((item) => ({
        //parse data to float for lat and lng
        lat: parseFloat(item.position.lat),
        lng: parseFloat(item.position.lng),
      }));
    } else {
      //markerPositions equals an array of objects with lat and lng of eugene
      markerPositions = [
        { lat: 44.05674657, lng: -123.0864976 },
        { lat: 44.04979409, lng: -123.0824349 },
        { lat: 44.04539623, lng: -123.0921962 },
        { lat: 44.05174833, lng: -123.0928507 },
        { lat: 44.054404, lng: -123.089843 },
      ];
    }

    //centerCoords equals cityLatLng or eugene
    let centerCoords = cityLatLng
      ? cityLatLng
      : { lat: 44.05674657, lng: -123.0864976 };

    //map equals a new google map with centerCoords and zoom of 13
    const map = new google.maps.Map(document.getElementById("map"), {
      center: centerCoords,
      zoom: 13,
    });

    this.markers = [];

    //for each position in markerPositions
    markerPositions.forEach((position, index) => {
      //infowindow equals a new google maps infowindow with content of brewery data
      const infowindow = new google.maps.InfoWindow({
        content: `<div><h5>${coords[index].name}</h5></div>
      <div><p>${coords[index].address}</p></div>
      <div><p>${coords[index].city}, ${coords[index].state}</p></div>
      <div><p>${coords[index].phone}</p></div>
      <div><a href="${coords[index].website}">${coords[index].website}</a></div>`,
        ariaLabel: index,
      });

      //marker equals a new google maps marker with position, map, title, and icon
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: "title",
        icon: {
          url: "./assets/beer.png",
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      //add listener to marker to open infowindow on click
      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map,
        });
      });
      this.markers.push({ info: infowindow, marker: marker });
    });
  }

  //add bubble button listener
  //async function

  async addBubbleButtonListener() {
    //add event listener  "click" to bubble button
    this.$bubbleButton.addEventListener("click", async () => {
      if (this.handleValidation() === false) {
        return;
      } else {
        //empty coords
        this.coords = "";
        //searchCity equals the value of the DOM element with id="searchCity"
        const searchCity = document.getElementById("searchCity").value;
        //searchState equals the value of the DOM element with id="searchState"
        const searchState = document.getElementById("searchState").value;
        //cityLatLng equals the result of getLatLng function with searchCity and searchState as arguments
        this.cityLatLng = await this.getLatLng(searchCity, searchState);
        //coords equals the result of getData function with cityLatLng as argument
        this.coords = await this.getData(this.cityLatLng);

        //if coords is not empty
        if (this.coords && Object.keys(this.coords).length > 0) {
          //call initBrewMap function with coords and cityLatLng as arguments
          this.initBrewMap(this.coords, this.cityLatLng);
          this.displayResults();
          this.checkScreenWidth();
        }
      }
    });
  }

  addResetButtonListener() {
    this.$resetBtn.addEventListener("click", () => {
      console.log("reset");
      this.resetForm();
    });
  }

  //initialize default map
  initMap() {
    //centerCoords equals eugene
    let centerCoords = { lat: 44.05674657, lng: -123.0864976 };

    //map equals a new google map with centerCoords and zoom of 13
    const map = new google.maps.Map(document.getElementById("map"), {
      center: centerCoords,
      zoom: 13,
    });
  }

  //load google maps
  loadGoogleMaps() {
    //call initMap function
    window.initMap = this.initMap;

    //create script element
    const script = document.createElement("script");
    //set script src to google maps api with GOOGLE_API_KEY
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_API_KEY}&callback=initMap`;
    //append script to body
    document.querySelector("body").appendChild(script);
  }

  checkScreenWidth() {
    const containerElement = document.getElementById("container");
    const upperDiv = document.getElementById("upperDiv");
    const resultsDiv = document.getElementById("resultsDiv");
    const mapDiv = document.getElementById("mapDiv");

    // Check the screen size
    if (window.innerWidth < 1000 && this.markers.length > 0) {
      containerElement.classList.remove("container");
      containerElement.classList.add("container-fluid");
      upperDiv.classList.remove("row");
      resultsDiv.classList.add("col-12");
      resultsDiv.classList.remove("col-6");
      mapDiv.classList.add("col-12");
      mapDiv.classList.remove("col-6");
    } else if (window.innerWidth >= 1000 && this.markers.length > 0) {
      containerElement.classList.remove("container-fluid");
      containerElement.classList.add("container");
      upperDiv.classList.add("row");
      resultsDiv.classList.remove("col-12");
      resultsDiv.classList.add("col-6");
      mapDiv.classList.remove("col-12");
      mapDiv.classList.add("col-6");
    } else if (window.innerWidth < 1000 && this.markers.length === 0) {
      containerElement.classList.remove("container");
      containerElement.classList.add("container-fluid");
      upperDiv.classList.remove("row");
      resultsDiv.classList.remove("col-12");
      resultsDiv.classList.add("col-6");
      mapDiv.classList.add("col-12");
      mapDiv.classList.remove("col-6");
    } else if (window.innerWidth >= 1000 && this.markers.length === 0) {
      containerElement.classList.remove("container-fluid");
      containerElement.classList.add("container");
      upperDiv.classList.add("row");
      resultsDiv.classList.remove("col-12");
      resultsDiv.classList.add("col-6");
      mapDiv.classList.add("col-12");
      mapDiv.classList.remove("col-6");
    }
  }

  handleValidation() {
    let errorInputs = [];

    if (
      this.$searchCity.value == "" ||
      !(this.$searchCity.value in this.citiesObj)
    ) {
      this.$searchCity.classList.add("is-invalid");
      errorInputs.push(this.$searchCity);
    } else {
      this.$searchCity.classList.remove("is-invalid");
    }

    if (
      this.$searchState.value == "" ||
      !this.stateCodes.includes(this.$searchState.value.toUpperCase())
    ) {
      this.$searchState.classList.add("is-invalid");
      errorInputs.push(this.$searchState);
    } else {
      this.$searchState.classList.remove("is-invalid");
    }

    if (
      this.$numInput.value == "" ||
      this.$numInput.value < 1 ||
      this.$numInput.value > 30
    ) {
      this.$numInput.classList.add("is-invalid");
      errorInputs.push(this.$numInput);
    } else {
      this.$numInput.classList.remove("is-invalid");
    }

    if (errorInputs.length === 0) {
      errorInputs = [];
      return true;
    } else {
      errorInputs = [];
      return false;
    }
  }

  resetForm() {
    this.$searchCity.value = "";
    this.$searchState.value = "";
    this.$numInput.value = "";

    this.$searchCity.classList.remove("is-invalid");
    this.$searchState.classList.remove("is-invalid");
    this.$numInput.classList.remove("is-invalid");

    const resultsContainer = document.getElementById("resultsDiv");
    const results = document.getElementById("results");

    resultsContainer.classList.add("visually-hidden");

    results.innerHTML = "";
    this.markers = [];
    this.initMap();
    this.checkScreenWidth();
  }

  displayResults() {
    const resultsContainer = document.getElementById("resultsDiv");
    const results = document.getElementById("results");

    resultsContainer.classList.remove("visually-hidden");
    resultsContainer.classList.add("justify-content-center");
    results.innerHTML =
      "<div class='text-center'><h1><u>Breweries:<h1></u></div>";

    Object.values(this.coords).forEach((value, index) => {
      const result = document.createElement("div");
      result.classList.add("pt-3");
      result.classList.add("col-12");
      result.classList.add("result");
      result.classList.add("text-center");
      result.classList.add("align-items-center");
      result.innerHTML = `<div><h5>${index + 1}. ${value.name}</h5></div>
      <div><p>${value.address}</p></div>
      <div><p>${value.city}, ${value.state}</p></div>
      <div><p>${value.phone}</p></div>
      <div><a href="${value.website}">${value.website}</a></div>
      <hr>`;

      result.addEventListener("click", () => {
        if (this.markers[index].info.isOpen) {
          this.markers[index].info.close();
          this.markers[index].info.isOpen = false;
        } else {
          google.maps.event.trigger(this.markers[index].marker, "click");
          this.markers[index].info.isOpen = true;
        }
      });

      results.appendChild(result);
    });
  }

  //initialize app
  init() {
    this.loadGoogleMaps();
    this.checkScreenWidth();
  }
}

//on window load
window.onload = () => {
  document.getElementById("loading-container").classList.add("visually-hidden");
  document
    .getElementById("content-container")
    .classList.remove("visually-hidden");

  //create new BreweryMap object
  const breweryMap = new BreweryMap();
  //call init function
  breweryMap.init();
};
