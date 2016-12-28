import os

import praw
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from imgurpython import ImgurClient
from pymessenger import Bot

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
db = SQLAlchemy(app)
bot = Bot(os.environ.get("MESSENGER_TOKEN"))
reddit = praw.Reddit(user_agent='dank-420',
                     client_id=os.environ.get("REDDIT_ID"),
                     client_secret=os.environ.get("REDDIT_SECRET"))
imgur = ImgurClient(os.environ.get("IMGUR_ID"), os.environ.get("IMGUR_SECRET"))

from dankbot import models
