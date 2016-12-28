import random
import re

from pymessenger import Button

from dankbot import db
from dankbot import sender
from dankbot.models import History, Post, Subscriber

actions = {
    "START": "start",
    "REPEAT": "repeat",
    "QUICK_SUB": "quick_subreddit",
    "SUB_(.*)": "subreddit",
    "SUBSCRIBBLES": "subscribe_menu",
    "SUBSCRIBE_(.*)": "subscribe",
    "UNSUBSCRIBE_(.*)": "unsubscribe",
    "HELP": "help_menu"
}


def dispatch(action):
    if action.payload == "NOOP":
        return

    for action_regex in actions:
        if re.match(action_regex, action.payload):
            globals()[actions[action_regex]](action)
            if action.payload != "REPEAT" and action.payload != "HELP":
                db.session.add(History(action.recipient_id, action.payload))
                db.session.commit()
            return

    sender.bot.send_text_message(action.recipient_id, "Couldn't find command :(")


def help_menu(action):
    buttons = []
    button = Button(title='Subscribble', type='postback', payload='SUBSCRIBBLES')
    buttons.append(button)
    button = Button(title='Quick Sub', type='postback', payload='QUICK_SUB')
    buttons.append(button)
    sender.bot.send_button_message(action.recipient_id, "Here is the help menu! 🍄", buttons)


def start(action):
    start_messages = [
        "Harambe died for this 💙",
        "Bush did 9/11 ✈️",
        "You like it in your butt you cheeky cunt? 🍑",
        "Suck a dick a day 🍆"
    ]
    sender.bot.send_text_message(action.recipient_id, "Welcome to Dank Bot! " + random.choice(start_messages))
    sender.bot.send_text_message(action.recipient_id,
                                 "We send you stuff (memes, jokes, etc) everyday. " +
                                 "Our content is based off Reddit's top posts. <3")
    subscribe_menu(action)


def repeat(action):
    history = History.query.filter_by(recipient_id=action.recipient_id).order_by(History.ran_at.desc()).first()
    if history:
        dispatch(Action(history.recipient_id, history.command))


def quick_subreddit(action):
    sender.send_quick_subreddit(action.recipient_id)


def subreddit(action):
    sub_match = re.match("SUB_(.*)", action.payload)
    sub = sub_match.group(1).lower()
    posts = db.session.query(Post).filter_by(subreddit_name=sub).all()
    if posts:
        sender.send_meme(action.recipient_id, random.choice(posts).data)


def subscribe_menu(action):
    get_subscriber(action.recipient_id)
    sender.send_subscribe_menu(action.recipient_id)


def subscribe(action):
    time_match = re.match("SUBSCRIBE_(.*)", action.payload)
    time = time_match.group(1).lower()

    subscriber = get_subscriber(action.recipient_id)

    if time.lower() in ["morning", "noon", "afternoon", "night"]:
        setattr(subscriber, time.lower(), True)
        db.session.commit()

    sender.send_subscribe_menu(action.recipient_id, text="Subbed for {}! :)".format(time.lower()))


def unsubscribe(action):
    time_match = re.match("UNSUBSCRIBE_(.*)", action.payload)
    time = time_match.group(1).lower()

    subscriber = get_subscriber(action.recipient_id)

    if time.lower() in ["morning", "noon", "afternoon", "night"]:
        setattr(subscriber, time.lower(), False)
        db.session.commit()

    sender.send_subscribe_menu(action.recipient_id, text="Unsubbed for {}! :(".format(time.lower()))


def get_subscriber(recipient_id):
    subscriber = db.session.query(Subscriber).filter_by(recipient_id=recipient_id).first()
    if subscriber is None:
        subscriber = Subscriber(recipient_id)
        subscriber.noon = True
        db.session.add(subscriber)

    return subscriber


class Action:
    def __init__(self, recipient_id, payload):
        self.recipient_id = recipient_id
        self.payload = payload
