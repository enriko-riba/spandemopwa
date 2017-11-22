var CACHE_VERSION = '0.0.007';
var CACHE_NAME = 'app' + CACHE_VERSION;

self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] install', event);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => fetch("bundle_manifest.json")
                .then(function(response){ 
                    return response.json();
                })
                .then(function(assets){
                    cache.addAll( [ //"/",
                                    //assets["main.js"],
                                    //assets["main.css"],
                                    assets["runtime.js"],
                                    assets["vendor.js"],
                                    assets["frb.js"],
                                    assets["assets\master.jpg"]
                                ]);
                })
          ).then(() => self.skipWaiting())
      );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] activate');
    e.waitUntil( caches.keys()
        .then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                            if (key !== CACHE_NAME) {
                                console.log(`[ServiceWorker] Removing old cache: '${key}'`);
                                return caches.delete(key);
                            }
                        }));
    })
    .then(function() { return self.clients.claim();})
    );
});

self.addEventListener('fetch', function (event) {
    const request = event.request;
    
    // Ignore not GET request.
    if (request.method !== 'GET') {
        console.log(`[ServiceWorker] Ignore non GET request ${request.method}`);
        return;
    }
    // Ignore different origin.
    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== location.origin) {
        console.log(`[ServiceWorker] Ignore different origin ${requestUrl.origin}`)
        return;
    }
 
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // if cache hit - return response
                if (response) {
                    console.log("[ServiceWorker] from cache:", response.url);
                    return response;
                }
                

                console.log("[ServiceWorker] from server:", requestUrl.href);

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {

                        // Check if we received a valid response
                        if (response.type!=='opaque' && (response.status !== 200 || response.type !== 'basic')) {
                            return response;
                        }

                        /*
                            the following writes the response to cache and then returns it

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                                console.log("[ServiceWorker] added response to cache: ", response.url);
                            });
                        */
                        return response;
                    }
                );
        })
    );
});


self.addEventListener('push', function(e) {
    var body;
    if (e.data) {
        body = e.data.text();
    } else {
        body = 'No payload';
    }
        
    var options = {
        body: body,
        icon: 'assets/push.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {action: 'explore', title: 'This is a push notification', icon: 'assets/checkmark.png'},
            {action: 'close', title: 'Close', icon: 'assets/xmark.png'}
        ]
    };
    e.waitUntil(
        self.registration.showNotification('Newsflash', options)
    );
});


self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;  
    if (!notification.data.hasOwnProperty('options'))
        return;  
        
    // Close the notification if the setting has been set to do so.
    var options = notification.data.options;
    if (options.close)
        event.notification.close();  
      
    // Available settings for |options.action| are:
    //
    //    'default'      First try to focus an existing window for the URL, open a
    //                   new one if none could be found.
    //    'focus-only'   Only try to focus existing windows for the URL, don't do
    //                   anything if none exists.
    //    'message'      Sends a message to all clients about this notification
    //                   having been clicked, with the notification's information.
    //    'open-only'    Do not try to find existing windows, always open a new
    //                   window for the given URL.
    if (options.action == 'message') {
          firstWindowClient().then(function(client) {
              var message = 'Clicked on "' + notification.title + '"';
              if (event.action)
              message += ' (action "' + event.action + '")';
              
              client.postMessage(message);
            });            
            return;
    }
        
    var promise = Promise.resolve();
    if (options.action == 'default' || options.action == 'focus-only') {
        promise = promise.then(findWindowClient)
                         .then(function(client) { return client.focus(); });
        if (options.action == 'default') {
            promise = promise.catch(function() { clients.openWindow(options.url); });
        }
    } else if (options.action == 'open-only') {
        promise = promise.then(function() { clients.openWindow(options.url); });
    }  
    event.waitUntil(promise);
});

/**
 * Returns the first client app window served by this serviceworker process
 */
function findWindowClient() {
    return clients.matchAll({ type: 'window' }).then(function(windowClients) {
        return windowClients.length ? windowClients[0] : Promise.reject("No clients");
    });
}