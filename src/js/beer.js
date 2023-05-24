//exported function to get breweries from openbrewerydb api
export default async function getBreweries(cityLat, cityLng, numBreweries) {
  //fetch request to openbrewerydb api
  const response = await fetch(
    `https://api.openbrewerydb.org/v1/breweries?by_dist=${cityLat},${cityLng}&per_page=${numBreweries}`
  );
  //save response as json
  const data = await response.json();
  //empty object to store brewery data
  const coords = {};

  //for each brewery in data
  Object.values(data).forEach((value, index) => {
    //set coords at index to an object with name, address, city, state, phone, website, and position
    coords[index] = {
      name: value.name,
      address: value.address_1,
      city: value.city,
      state: value.state,
      phone: value.phone,
      website: value.website_url,
      //position is an object with lat and lng
      position: { lat: value.latitude, lng: value.longitude },
    };
  });
  //return coords object with brewery data
  return coords;
}
