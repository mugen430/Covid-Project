const country_name_element = document.querySelector(".country .name");
const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");
const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");
const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");
const ctx = document.getElementById("axes_line_chart").getContext("2d");
let map;


let app_data = [],
  cases_list = [],
  recovered_list = [],
  deaths_list = [],
  deaths = [],
  formattedDates = [];

  fetch("https://covid-193.p.rapidapi.com/history?day=2020-06-02&country=usa", {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "covid-193.p.rapidapi.com",
      "x-rapidapi-key": "6e9650c3b2msh4ff1005662befa2p1b72c4jsn07b812839aae"
    }
  })
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.log(err);
  });

const country_code = geoplugin_countryCode();
let user_country;
country_list.forEach((country) => {
  if (country.code == country_code) {
    user_country = country.name;
  }
});

const myMap = (lat, lon) => {
    const mapProp = {
      center: new google.maps.LatLng(lat, lon),
      zoom: 10
    };
    return new google.maps.Map(document.getElementById("map"), mapProp);
  }
  

const searchForCityByName = (city) => {
    const APIKey = "089100f1dce99fc69ca132b28b1e31ea";
    const queryURLWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIKey}`;
    $.ajax({
      url: queryURLWeather,
      method: "GET",
      error: (() => instance.open())
    }).then((response) => {
      const lat = response.coord.lat;
      const lon = response.coord.lon;
      map = myMap(lat, lon);
      const request = { query: city, fields: ["name", "geometry"] };
      service = new google.maps.places.PlacesService(map);
      service.findPlaceFromQuery(request, (results, status) => status === google.maps.places.PlacesServiceStatus.OK && map.setCenter(results[0].geometry.location));
    });
}

const fetchData = (country) => {
  user_country = country;
  country_name_element.innerHTML = "Processing";

    (cases_list = []),
    (recovered_list = []),
    (deaths_list = []),
    (dates = []),
    (formattedDates = []);

  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const api_fetch = async (country) => {
    searchForCityByName(country);
    await fetch("https://api.covid19api.com/total/country/" + country + "/status/confirmed", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        data.forEach((entry) => {
          dates.push(entry.Date);
          cases_list.push(entry.Cases);
        });
      });
    await fetch("https://api.covid19api.com/total/country/" + country + "/status/recovered", requestOptions)
      .then((res) =>  res.json())
      .then((data) => data.forEach((entry) => recovered_list.push(entry.Cases)));
    await fetch("https://api.covid19api.com/total/country/" + country + "/status/deaths", requestOptions)
      .then((res) => res.json())
      .then((data) => data.forEach((entry) => deaths_list.push(entry.Cases)));
    updateUI();
  };
  api_fetch(country);
}

fetchData(user_country);

const updateUI = () => {
  updateStats();
  axesLinearChart();
}

const updateStats = () => {
  const total_cases = cases_list[cases_list.length - 1];
  const new_confirmed_cases = total_cases - cases_list[cases_list.length - 2];

  const total_recovered = recovered_list[recovered_list.length - 1];
  const new_recovered_cases = total_recovered - recovered_list[recovered_list.length - 2];

  const total_deaths = deaths_list[deaths_list.length - 1];
  const new_deaths_cases = total_deaths - deaths_list[deaths_list.length - 2];
  
  country_name_element.innerHTML = user_country;
  total_cases_element.innerHTML = total_cases;
  new_cases_element.innerHTML = `+${new_confirmed_cases}`;
  recovered_element.innerHTML = total_recovered;
  new_recovered_element.innerHTML = `+${new_recovered_cases}`;
  deaths_element.innerHTML = total_deaths;
  new_deaths_element.innerHTML = `+${new_deaths_cases}`;
  dates.forEach((date) => formattedDates.push(formatDate(date)));
}

let my_chart;

const axesLinearChart = () => {
  my_chart && my_chart.destroy();

  my_chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Cases",
          data: cases_list,
          fill: false,
          borderColor: "#FFF",
          backgroundColor: "#FFF",
          borderWidth: 1,
        },
        {
          label: "Recovered",
          data: recovered_list,
          fill: false,
          borderColor: "#009688",
          backgroundColor: "#009688",
          borderWidth: 1,
        },
        {
          label: "Deaths",
          data: deaths_list,
          fill: false,
          borderColor: "#f44336",
          backgroundColor: "#f44336",
          borderWidth: 1,
        },
      ],
      labels: formattedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

const monthsNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatDate = (dateString) => {
  let date = new Date(dateString);
  return `${date.getDate()} ${monthsNames[date.getMonth() - 1]}`;
}

