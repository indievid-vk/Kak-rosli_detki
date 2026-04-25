if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Проверяем, нужно ли нам принудительно сбросить SW (например, при переходе на новую мажорную версию)
        const SW_VERSION = '110';
        const currentVersion = localStorage.getItem('sw_version');

        if (currentVersion !== SW_VERSION) {
            console.log('[PWA] Обнаружена старая версия или отсутствие версии, сбрасываем SW...');
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                const unregisterPromises = registrations.map(r => r.unregister());
                return Promise.all(unregisterPromises);
            }).then(function() {
                if ('caches' in window) {
                    return caches.keys().then(function(names) {
                        return Promise.all(names.map(name => caches.delete(name)));
                    });
                }
            }).then(function() {
                localStorage.setItem('sw_version', SW_VERSION);
                console.log('[PWA] SW и кэш очищены, регистрируем новый...');
                registerSW();
            });
        } else {
            registerSW();
        }

        function registerSW() {
            navigator.serviceWorker.register('sw.js')
                .then(function(registration) {
                    console.log('[PWA] ServiceWorker зарегистрирован: ', registration.scope);
                })
                .catch(function(error) {
                    console.error('[PWA] Ошибка регистрации SW: ', error);
                });
        }
    });
}
