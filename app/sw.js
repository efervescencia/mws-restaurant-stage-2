if (typeof nexie === "undefined") {
        self.importScripts('js/nexie.js');
    }

 var CACHE_NAME  = 'mws-cache-v1';
 var urlsToCache = [
'/', 
'index.html',
'restaurant.html',
'css/styles.css',
'js/main.js',
'js/restaurant_info.js',
'img/',
'js/dbhelper.js',
'js/nexie.js'
];

self.addEventListener('install', function(event) {
  // Instalamos el service worker
  event.waitUntil(   
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('cache instalada');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
console.log("service worker atctivated a true");

var dbPromise = idb.open('restaurants',1,function(upgradeDb){

	var keyValStore = upgradeDb.createObjectStore('urls');

});

});



self.addEventListener('fetch', event => {
	
	//que no sea un POST
  if(event.request.method != 'GET') return;
  
  //primero si es un JSON
  if(event.request.url.includes(':1337')){
    event.respondWith(fuenteDB(event.request).catch((error) => {
      console.log(error);
    }));
    //ademas actualizo la base de datos
    event.waitUntil(updateDB(event.request));
  }else{
  	//miramos a ver si está en la cache
    event.respondWith(fromCache(event.request).catch((error) => {
      console.log(error);
    }));
	//actualizamos la cache  
    event.waitUntil(updateCache(event.request));
  }
});


function fuenteDB(request){
  return  dbPromise.urls.get(request.url).then(function (matching) 
  {
    return (matching) ? new Response(JSON.stringify(matching.data)) : fetch(request);
  });
}


function updateDB(request){
  return fetch(request).then(function (response) {
    console.log(response);
    return response.json();
  }).then( response => {
    console.log('añadimos:', response);
    return db.urls.put({ url: request.url, data: response });
  }).catch(error => {
    console.log(error);
  });
}



/*
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
*/