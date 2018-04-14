import {config, firestore, https} from "firebase-functions";
import admin from "firebase-admin";
import snoowrap from "snoowrap";

admin.initializeApp();

const times = {
  morning: { title: "Morning", subreddit: "jokes" },
  noon: { title: "Noon", subreddit: "me_irl" },
  afternoon: { title: "Afternoon", subreddit: "dankmemes" }
};

// Reddit client
const r = new snoowrap({
  userAgent: config().reddit.useragent,
  clientId: config().reddit.clientid,
  clientSecret: config().reddit.clientsecret,
  refreshToken: config().reddit.refreshtoken
});

// When a user toggles a subscription
export const subscriptions = firestore
  .document("users/{uid}")
  .onWrite(async event => {
    const document = event.data.exists ? event.data.data() : null;
    const oldDocument = event.data.previous.exists
      ? event.data.previous.data()
      : null;

    // If token is changed
    const newToken =
      oldDocument &&
      document &&
      oldDocument.token &&
      document.token &&
      oldDocument.token !== document.token;

    // Batch all changes
    const changes = [];

    function unsub(topic, token = document.token) {
      changes.push(admin.messaging().unsubscribeFromTopic(token, topic));
    }

    function sub(topic, token = document.token) {
      changes.push(admin.messaging().subscribeToTopic(token, topic));
    }

    ["morning", "noon", "afternoon"].map(time => {
      if (!document || newToken) {
        // Unsub if deleting user, or changing token
        unsub(time, oldDocument.token);
      }

      if (newToken) {
        // Re-sub if needed if new token
        if (document[time]) {
          sub(time);
        }
      } else if (document && oldDocument) {
        // Sub status change
        if (document[time] !== oldDocument[time]) {
          if (document[time]) {
            sub(time);
          } else {
            unsub(time);
          }
        }
      }
    });

    // Run changes
    await Promise.all(changes);
  });

// Triggered by cron
export const time = https.onRequest(async (req, res) => {
  // Auth
  if (req.headers.authorization !== "Bearer " + config().dankbot.cron) {
    return res.json({ error: "Invalid auth" });
  }

  // Time
  const time = req.headers.time;
  if (!Object.keys(times).includes(time)) {
    return res.json({ error: "Invalid time" });
  }

  const { subreddit } = times[time];

  const [tops, previousQuery] = await Promise.all([
    // Get reddit top
    r.getSubreddit(subreddit).getTop({ time: "week", limit: 10 }),
    // Get previous tops
    admin
      .firestore()
      .collection("posts")
      .where("time", "=", time)
      .get()
  ]);

  const { docs: previous } = previousQuery;

  // Get new top
  const top = tops.find(
    top => !previous.some(previous => top.id === previous.data().id)
  );

  const { thumbnail, ups, id } = top;
  const permalink = `https://redd.it/${id}`;

  const title = `Get your ${time} dank!`;
  const body = `⬆️ ${ups} (${subreddit})`;
  // Format notification
  const message = {
      data: {
        title,
        body,
        url: permalink,
        thumbnail
      },
      android: {
        notification: {
          title,
          body,
          clickAction: "FLUTTER_NOTIFICATION_CLICK"
        },
      },
      topic: time
    }
  ;

  console.log(message);
  // Keep only latest 9 (+1 from today)
  previous.sort((a, b) => b.data().date - a.data().date);
  const deletes = previous
    .splice(9)
    .map(previousDoc => previousDoc.ref.delete());

  await Promise.all([
    // Send
    admin.messaging().send(message),
    // Add to DB
    admin
      .firestore()
      .collection("posts")
      .add({
        id,
        date: new Date().getTime(),
        time,
        permalink,
        thumbnail
      }),
    // Delete stale
    deletes
  ]);

  res.json({ ok: true });
});
