from sqlalchemy import func

from dankbot import db


class Subscriber(db.Model):
    __tablename__ = 'subscriber'
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.String(), unique=True)
    morning = db.Column(db.Boolean(), default=False)
    noon = db.Column(db.Boolean(), default=True)
    afternoon = db.Column(db.Boolean(), default=False)

    def __init__(self, recipient_id):
        self.recipient_id = recipient_id

    def __repr__(self):
        return '<Subscriber %r>' % self.recipient_id


class Subreddit(db.Model):
    __tablename__ = 'subreddit'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), unique=True)
    fetch_time = db.Column(db.String())
    order = db.Column(db.Integer())

    def __init__(self, name, fetch_time, order):
        self.name = name
        self.fetch_time = fetch_time
        self.order = order

    def __repr__(self):
        return '<Subreddit %r>' % self.name


class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String())
    data = db.Column(db.String())
    score = db.Column(db.Integer())
    media = db.Column(db.Boolean())
    subreddit_name = db.Column(db.String(), db.ForeignKey('subreddit.name'))
    subreddit = db.relationship("Subreddit", backref="post")

    def __init__(self, title, data, score, media, subreddit):
        self.title = title
        self.data = data
        self.score = score
        self.media = media
        self.subreddit = subreddit

    def __repr__(self):
        return '<Post %r>' % self.id


class History(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.String())
    command = db.Column(db.String())
    ran_at = db.Column(db.DateTime(), default=func.now())

    def __init__(self, recipient_id, command):
        self.recipient_id = recipient_id
        self.command = command

    def __repr__(self):
        return '<History %r %r>' % self.recipient_id, self.command


class Meme(db.Model):
    __tablename__ = 'meme'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(), unique=True)
    name = db.Column(db.String())
    order = db.Column(db.Integer())

    def __init__(self, key, name, order):
        self.key = key
        self.name = name
        self.order = order

    def __repr__(self):
        return '<Meme %r>' % self.key


class MemeResult(db.Model):
    __tablename__ = 'meme_result'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String())
    meme_id = db.Column(db.Integer, db.ForeignKey('meme.id'))
    meme = db.relationship("Meme", backref="meme_result")

    def __init__(self, meme, data):
        self.meme = meme
        self.data = data

    def __repr__(self):
        return '<MemeResult %r>' % self.data
