import json
import os

from dankbot import handler, app
from flask import request, send_from_directory


@app.route("/webhook", methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        if request.args.get("hub.verify_token") == os.environ.get("MESSENGER_VERIFY_TOKEN"):
            return request.args.get("hub.challenge")

    if request.method == 'POST':
        print(json.dumps(request.json, indent=4))
        output = request.json
        if output['object'] == "page":
            for entry in output['entry']:
                messaging = entry['messaging']
                for event in messaging:
                    handler.handle(event)

    return ""


# Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/privacy')
def privacy():
    return app.send_static_file('privacy.html')


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    print("Starting app")
    app.run(host='0.0.0.0', port=port, debug=True)
