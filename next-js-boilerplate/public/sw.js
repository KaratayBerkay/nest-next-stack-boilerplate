/* eslint-disable */
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

  var data = event.notification.data || {};
  var kind = data.kind;
  var senderId = data.senderId;
  var postId = data.postId;

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

        // Build target URL matching the frontend's notificationTarget map
        var url;
        if (kind === "direct-message" && senderId) {
          url = "/v1/" + lang + "/messages?user=" + senderId;
        } else if (kind === "friend-request" || kind === "friend-accepted") {
          url = "/v1/" + lang + "/find-friends";
        } else if (postId) {
          url = "/v1/" + lang + "/feed#post-" + postId;
        } else {
          url = "/v1/" + lang + "/notification";
        }

        // Focus an existing /v1/ client and navigate via postMessage
        for (var j = 0; j < clientList.length; j++) {
          var client = clientList[j];
          if (client.url.indexOf("/v1/") !== -1 && "focus" in client) {
            client.postMessage({ type: "navigate", url: url });
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});
