// Регистрация Service Worker (из примера)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован успешно: ', registration.scope);
            })
            .catch(function(error) {
                console.log('Ошибка регистрации ServiceWorker: ', error);
            });
    });
}
