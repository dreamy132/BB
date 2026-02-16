self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("blockblast").then(cache=>{
      return cache.addAll(["./","index.html","style.css","game.js"]);
    })
  );
});
