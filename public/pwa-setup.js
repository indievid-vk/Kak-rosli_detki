if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Use relative path for registration to handle various base URLs (like /Kak-rosli_detki/ or /)
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('[PWA] ServiceWorker registered with scope: ', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // once an hour

                registration.addEventListener('updatefound', () => {
                   const newWorker = registration.installing;
                   if (newWorker) {
                       newWorker.addEventListener('statechange', () => {
                           if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                               console.log('[PWA] New version available! Users should reload.');
                               // Broadcast to app
                               window.dispatchEvent(new CustomEvent('pwa-update-available'));
                           }
                       });
                   }
                });
            })
            .catch(function(error) {
                console.error('[PWA] ServiceWorker registration failed: ', error);
            });
    });

    // Handle controller change (reload after skipWaiting)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
