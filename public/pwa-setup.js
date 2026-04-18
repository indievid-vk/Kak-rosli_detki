// Регистрация Service Worker с явным указанием базового пути для GitHub Pages
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/Kak-rosli_detki/sw.js', { scope: '/Kak-rosli_detki/' })
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован успешно:', registration.scope);
            })
            .catch(function(error) {
                console.log('Ошибка регистрации ServiceWorker:', error);
            });
    });
}
