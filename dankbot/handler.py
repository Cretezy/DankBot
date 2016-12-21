from dankbot import dispatcher
from dankbot import bot


def handle(event):
    if event.get('message'):
        if event['message'].get('sticker_id'):
            receive_sticker(event)
        elif event['message'].get('quick_reply') and event['message']['quick_reply'].get('payload'):
            recipient_id = event['sender']['id']
            payload = event['message']['quick_reply']['payload']
            dispatcher.dispatch(dispatcher.Action(recipient_id, payload))
        elif event['message'].get('text'):
            receive_message(event)

    if event.get('postback'):
        if event['postback'].get('payload'):
            recipient_id = event['sender']['id']
            payload = event['postback']['payload']
            dispatcher.dispatch(dispatcher.Action(recipient_id, payload))


def receive_message(event):
    recipient_id = event['sender']['id']
    text = event['message']['text'].lower()

    if text == "help":
        dispatcher.dispatch(dispatcher.Action(recipient_id, "HELP"))
    else:
        bot.send_text_message(recipient_id, "Please use the quick menu papi (or say \"help\")! 🍄")


def receive_sticker(event):
    recipient_id = event['sender']['id']
    dispatcher.dispatch(dispatcher.Action(recipient_id, "REPEAT"))
