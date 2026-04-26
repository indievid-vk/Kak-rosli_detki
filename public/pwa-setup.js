if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register SW
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

// Add global error handler for chunk loading errors (to prevent white screens)
window.addEventListener('error', (e) => {
    if (e.message.includes('Loading chunk') || e.message.includes('Script error')) {
        const lastReload = localStorage.getItem('pwa_last_error_reload');
        const now = Date.now();
        // Prevent infinite loops (reload only if more than 5 seconds passed since last reload)
        if (!lastReload || now - parseInt(lastReload) > 5000) {
            localStorage.setItem('pwa_last_error_reload', now.toString());
            window.location.reload();
        }
    }
}, true);
