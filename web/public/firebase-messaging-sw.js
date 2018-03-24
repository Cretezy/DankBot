importScripts("https://www.gstatic.com/firebasejs/4.12.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/4.12.0/firebase-messaging.js"
);

firebase.initializeApp({
  messagingSenderId: "593740228443"
});

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  var data = payload.data;

  return self.registration.showNotification(
    "Get your " + data.time + " dank!",
    {
      body: "⬆️ " + data.ups + " (" + data.subreddit + ")",
      icon: "https://dankbot.cretezy.com/assets/pepe-medium.png",
      badge: "https://dankbot.cretezy.com/assets/pepe-small.png",
      image: data.thumbnail,
      vibrate: [200, 50, 200, 50, 400],
      actions: [
        {
          action: "reddit",
          title: "Reddit"
        },
        {
          action: "dankbot",
          title: "Dank Bot"
        }
      ],
      data: {
        url: data.permalink
      }
    }
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  var url = event.notification.data.url;

  if (event.action === "dankbot") {
    url = "https://dankbot.cretezy.com/";
  }

  event.waitUntil(clients.matchAll().then(function(windowClients) {
    var client = windowClients.find(function(client){
      return client.url === url;
    });

    // Focus if already opened in tab, else open new tab
    if(client){
      return client.focus()
    }else{
      return clients.openWindow(url)
    }
  }));
});
