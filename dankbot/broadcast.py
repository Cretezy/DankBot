import random
import re

from imgurpython.helpers.error import ImgurClientError

from dankbot import db, bot, reddit
from dankbot import sender
from dankbot import utils
from dankbot.models import Subscriber, Subreddit, Post


def broadcast(time_name):
    lpt = "LifeProTips" if random.random() > 0.1 else "ShittyLifeProTips"
    times = {
        "morning": {"subreddit": "jokes", "text": True},
        "noon": {"subreddit": "me_irl", "text": False},
        "afternoon": {"subreddit": lpt, "text": True}
    }

    time = times[time_name]
    post = next(reddit.get_subreddit(time['subreddit']).get_top(time='24h', limit=5))

    url = post.url
    if not time['text']:
        url = utils.fix_imgur_url(post.url)

    for subscriber in db.session.query(Subscriber).filter(getattr(Subscriber, time_name)):
        bot.send_text_message(subscriber.recipient_id,
                              "Here's your {} ({}) dose of Dank!".format(time_name, time['subreddit']))
        if time['text']:
            bot.send_text_message(subscriber.recipient_id, post.title)
            if post.selftext != "":
                bot.send_text_message(subscriber.recipient_id, post.selftext)
            bot.send_text_message(subscriber.recipient_id, "Score: {} | http://redd.it/{}".format(post.score, post.id))
        else:
            sender.send_meme(subscriber.recipient_id, url, False)

    update_memes()


def update_memes():
    image_regex = "(https?://.*\.(?:png|jpe?g|gif|mp4))"
    reddit_regex = "(https?://i\.reddituploads\.com/(.*))"
    db.session.query(Post).delete()
    for subreddit in db.session.query(Subreddit):
        request = reddit.get_subreddit(subreddit.name).get_top(time=subreddit.fetch_time, limit=150)
        for reddit_post in request:
            data = reddit_post.selftext
            media = False
            if data == "" and hasattr(reddit_post, "url"):
                data = reddit_post.url
                try:
                    url = utils.fix_imgur_url(data)
                    if url != "":
                        data = url
                        if re.search(image_regex, data) or re.search(reddit_regex, data):
                            media = True
                except ImgurClientError:
                    print("Error parsing {}".format(reddit_post.url))

            post = Post(reddit_post.title, data, reddit_post.score, media, subreddit)
            db.session.add(post)
            db.session.commit()
