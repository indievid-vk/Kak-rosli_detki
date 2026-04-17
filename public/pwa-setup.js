// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/Kak-rosli_detki/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker зарегистрирован:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Ошибка регистрации Service Worker:', error);
      });
  });
}
