"serviceWorker" in navigator && navigator.serviceWorker.register("assets/js/sw.js?v=1.0.0.3").then((function() {})).catch((function(e) {
    console.log("SW registration notice:", e);
}));