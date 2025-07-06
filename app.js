if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error al registrar el Service Worker', err));
}
