
//cambios para que funcione con fetch

/**
 * Common database helper functions.
 */
 
//necesitamos variable global para base de datos

var bdFetch; 
 
 
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
  	
  	//puerto cambiado a node server 1337
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
    static fetchRestaurants(callback) {
         fetch(DBHelper.DATABASE_URL)
            .then(response => {
                response.json()
                    .then(resp => {
                        dbFetch.then((db) => {
                            if (!db) return;

								const tx = db.transaction('restaurants', 'readwrite');
								const store = tx.objectStore('restaurants');

								resp.forEach(restaurant => {
								store.put(restaurant);
								});
                        	console.log('Added to IDB');
                        })
                        return callback(null, resp)
                    })
                    .catch(e => callback(e, null))
            })
            .catch(error => {
                dbFetch.then(db => {
                    if (!db) return;
                    const store = db.transaction('restaurants')
                        .objectStore('restaurants');

                    store.getAll().then(function (restaurants) {
                        console.log('** From IDB **');
                        return callback(null, restaurants);
                    });
                });
                console.error(error);
            });
}

  /**
   * Fetch a restaurant by its ID.
   */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        fetch(`${DBHelper.DATABASE_URL}/${id}`)
            .then(response => {
                response.json()
                    .then(resp => callback(null, resp))
                    .catch(e => callback('Restaurant does not exist', null));
            })
            .catch(error => {
                dbFetch.then(db => {
                    if (!db) return;
                    const store = db.transaction('restaurants')
                        .objectStore('restaurants');

                    store.get(parseInt(id)).then(function (restaurant) {
                        console.log('** From IDB - ID **');
                        return callback(null, restaurant);
                    });
                });
                console.error(error);
            })

}

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

