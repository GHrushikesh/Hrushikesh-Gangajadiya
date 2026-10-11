"serviceWorker" in navigator && navigator.serviceWorker.register("assets/js/sw.js?v=1.0.0.6").then((function() {})).catch((function(e) {
    console.log("SW registration notice:", e);
}));