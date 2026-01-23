// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/what_to_do_app/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
