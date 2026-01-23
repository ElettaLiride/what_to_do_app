if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/what_to_do_app/sw.js')
      .then((reg) => console.log('SW registered:', reg))
      .catch((err) => console.log('SW registration failed:', err));
  });
}
