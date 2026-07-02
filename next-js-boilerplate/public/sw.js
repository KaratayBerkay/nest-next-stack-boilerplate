self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  var data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (_) {
    // ignore invalid payload
  }

  var title = data.title || "Notification";
  var options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: data.data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  var data = event.notification.data;
  var postId = data && data.postId;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Derive lang from an open client's URL (e.g. /v1/en/feed → en)
        var lang = "en";
        for (var i = 0; i < clientList.length; i++) {
          var match = clientList[i].url.match(/\/v1\/([a-z]{2})\//);
          if (match) {
            lang = match[1];
            break;
          }
        }

        var url = postId
          ? "/v1/" + lang + "/feed#post-" + postId
          : "/v1/" + lang + "/notification";

        // Focus an existing client on /v1/ if possible
        for (var j = 0; j < clientList.length; j++) {
          var client = clientList[j];
          if (client.url.indexOf("/v1/") !== -1 && "focus" in client) {
            // If there's a post and the client is already on the feed, navigate via postMessage
            if (postId && client.url.indexOf("/feed") !== -1) {
              client.postMessage({ type: "navigate-post", postId: postId });
              return client.focus();
            }
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});
