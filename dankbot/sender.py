import json
import re

from dankbot import bot, db
from dankbot import utils
from dankbot.models import Subreddit, Subscriber


def send_meme(recipient_id, meme, fix=True):
    print("Sending " + meme + " to " + str(recipient_id))
    image_regex = "(https?://.*\.(?:png|jpe?g|gif))"
    reddit_regex = "(https?://i\.reddituploads\.com/(.*))"

    video_regex = "(https?://.*\.(?:mp4))"

    if fix:
        meme = utils.fix_imgur_url(meme)

    if re.search(image_regex, meme) or re.search(reddit_regex, meme):
        bot.send_image_url(recipient_id, meme)
    elif re.search(video_regex, meme):
        bot.send_video_url(recipient_id, meme)
    else:
        bot.send_text_message(recipient_id, meme)


def send_quick_subreddit(recipient_id):
    quick_subs = []
    subs = db.session.query(Subreddit).order_by(Subreddit.order).all()

    for sub in subs:
        quick_subs.append({
            "content_type": "text",
            "title": sub.name,
            "payload": "SUB_" + sub.name.upper()
        })

    payload = {
        "text": "Pick a quick subdank",
        "quick_replies": quick_subs
    }
    print(json.dumps(payload))

    bot.send_message(recipient_id, payload)


def send_subscribe_menu(recipient_id, text=None):
    times = []
    subscriber = db.session.query(Subscriber).filter_by(recipient_id=recipient_id).first()
    if not subscriber:
        subscriber = Subscriber(recipient_id)

    for time in ["Morning", "Noon", "Afternoon"]:
        value = getattr(subscriber, time.lower())
        subbed = False if value is None or value is False else True
        print(subbed, time)
        times.append({
            "content_type": "text",
            "title": "{}".format(time),
            "payload": ("UN" if subbed else "") + "SUBSCRIBE_" + time.upper(),
            "image_url": "http://litbimg.rightinthebox.com/images/wholesale/201407/green.jpg" if subbed else
            "https://upload.wikimedia.org/wikipedia/commons/1/1f/Red_vovinam_16x16.png"
        })

    times.append({
        "content_type": "text",
        "title": "Done",
        "payload": "NOOP",
    })

    payload = {
        "quick_replies": times,
        "text": "Toggle times to receive dank memes " +
                "(Morning: jokes, Noon: me_irl, Afternoon: WholesomeMemes)" if text is None else text
    }

    print(json.dumps(payload))

    bot.send_message(recipient_id, payload)
