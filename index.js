const NEARLY_DISTANCE_METER = 1000;
const NEARLY_TYPES_TRAIN_STATION = ['train_station'];
const TRAVEL_MODE_WALKING = 'WALKING';

export const getGeocode = address => {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status !== 'OK') {
        reject('ロケーションを取得できませんでした');
        return;
      }
      const geo = results[0].geometry.location;
      resolve(new google.maps.LatLng(geo.lat(), geo.lng()));
    });
  });
};

export const getNearlyStation = location => {
  return new Promise((resolve, reject) => {
    const placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch(
      {
        location,
        radius: NEARLY_DISTANCE_METER,
        type: NEARLY_TYPES_TRAIN_STATION,
      },
      (results, status) => {
        if (status !== 'OK') {
          reject('最寄りの駅を取得できませんでした');
          return;
        }
        const geo = results[0].geometry.location;
        resolve({
          name: results[0].name,
          location: new google.maps.LatLng(geo.lat(), geo.lng()),
        });
      },
    );
  });
};

export const getDistanceTwoPoint = (baseLocation, destination) => {
  return new Promise((resolve, reject) => {
    const distance = new google.maps.DistanceMatrixService();
    distance.getDistanceMatrix(
      {
        origins: [baseLocation],
        destinations: [destination],
        travelMode: TRAVEL_MODE_WALKING,
      },
      (response, status) => {
        if (status !== 'OK') {
          reject('距離と時間を取得できませんでした');
          return;
        }
        resolve({
          distance: response.rows[0].elements[0].distance.text,
          time: response.rows[0].elements[0].duration.text,
        });
      },
    );
  });
};

export const getDistanceNearlyStation = async address => {
  if (!address) return;
  try {
    const spaceLatLng = await getGeocode(address);
    const { name, location } = await getNearlyStation(spaceLatLng);
    const { distance, time } = await getDistanceTwoPoint(spaceLatLng, location);
    return { isError: false, name, distance, time };
  } catch (error) {
    return { isError: true, errorMessage: error };
  }
};
