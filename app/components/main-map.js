import Ember from 'ember';
import Path from '../models/path';

const { get, set } = Ember;

export default Ember.Component.extend({
  currentLocation: null,

  destination: Ember.computed('currentLocation.{firstObject,lastObject}', 'path', {
    get() {
      let path = get(this, 'path.coordinates');
      let currentLocation = get(this, 'currentLocation').slice();
      return pathSearch(path, currentLocation, 0).slice().reverse();
    }
  }),

  path: Path.geoJSON,

  isLoading: true,

  init() {
    this._super(...arguments);
    if ("geolocation" in navigator) {
      /* geolocation is available */
      navigator.geolocation.getCurrentPosition(Ember.run.bind(this, function(position) {
        set(this, 'currentLocation', [position.coords.latitude, position.coords.longitude]);
        set(this, 'isLoading', false);
      }));
    } else {
      /* geolocation IS NOT available */
      alert("can't geolocate :(")
    }
  }
});

function pathSearch(path, point, lastIterDistance) {
  let firstElDistance = calcDistance(path[0][1], path[0][0], point[0], point[1]);
  let lastElDistance = calcDistance(path[path.length-1][1], path[path.length-1][0], point[0], point[1]);

  if(firstElDistance < lastElDistance){
    if(path.length === 2) {
      return path[0];
    }

    return pathSearch(path.slice(0, path.length/2), point, firstElDistance);
  }

  if(path.length === 2) {
    return path[1];
  }

  return pathSearch(path.slice(path.length/2, path.length-1), point, lastElDistance);
}


function calcDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	dist = dist * 1.609344;
	return dist;
}
