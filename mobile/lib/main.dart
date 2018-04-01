import 'dart:async';

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:url_launcher/url_launcher.dart';

final Firestore _firestore = Firestore.instance;
final FirebaseMessaging _firebaseMessaging = new FirebaseMessaging();

final FirebaseAuth _auth = FirebaseAuth.instance;

final Map<String, String> times = {
  "morning": "Morning",
  "noon": "Noon",
  "afternoon": "Afternoon"
};

void main() => runApp(new DankBot());

class DankBot extends StatefulWidget {
  @override
  _DankBotState createState() => new _DankBotState();
}

class _DankBotState extends State<DankBot> {
  bool _loaded = false;
  FirebaseUser _user;

  @override
  void initState() {
    super.initState();

    MessageHandler messageHandler = (message) async {
      if (message.containsKey("url")) {
        String url = message["url"];
        await open(url);
      }
    };

    _firebaseMessaging.configure(
      onMessage: messageHandler,
      onLaunch: messageHandler,
      onResume: messageHandler,
    );

    _firebaseMessaging.onTokenRefresh.listen((token) => print("GOT $token"));

    _auth.onAuthStateChanged.listen((user) {
      setState(() {
        _loaded = true;
        _user = user;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return new Container();
    }

    return new MaterialApp(
      title: 'Dank Bot',
      theme: new ThemeData(
        primarySwatch: Colors.green,
      ),
      routes: {
        "/": (_) => new Login(),
        "settings": (_) => new Settings(),
      },
      initialRoute: _user != null ? "settings" : "/",
    );
  }
}

class Login extends StatefulWidget {
  @override
  _LoginState createState() => new _LoginState();
}

class _LoginState extends State<Login> {
  bool _loading = false;

  Future<void> _login(BuildContext context) async {
    setState(() {
      _loading = true;
    });

    try {
      // iOS
      _firebaseMessaging.requestNotificationPermissions();

      String token = await _firebaseMessaging.getToken();

      FirebaseUser user = await _auth.signInAnonymously();

      await _firestore.collection("users").document(user.uid).setData({
        "token": token,
        "morning": false,
        "noon": false,
        "afternoon": false,
      });

      Navigator.of(context).pushReplacementNamed("settings");
    } catch (error) {
      print("Login error: $error");
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text("Dank Bot"),
      ),
      body: new Padding(
        padding: new EdgeInsets.only(top: 25.0),
        child: new Column(
//          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            new Text(
              'Welcome to Dank Bot!',
            ),
            new Container(height: 25.0),
            new RaisedButton(
              child: new Text("Get Started"),
              onPressed: () => _login(context),
              color: Colors.red,
              textColor: Colors.white,
            ),
            _loading
                ? new Padding(
                    padding: new EdgeInsets.all(15.0),
                    child: new CircularProgressIndicator(),
                  )
                : new Container(),
            new Padding(
              padding: new EdgeInsets.only(top: 8.0),
              child: new Divider(height: 0.0),
            ),
            new _Feed(),
          ],
        ),
      ),
    );
  }
}

class Settings extends StatefulWidget {
  @override
  _SettingsState createState() => new _SettingsState();
}

class _SettingsState extends State<Settings> {
  bool _loading = true;

  FirebaseUser _user;
  DocumentReference _settings;

  Future<void> _logout(BuildContext context) async {
    final DocumentReference settings = _settings;

    setState(() {
      _loading = true;
      _settings = null;
    });

    try {
      settings?.delete();

      await Future.delayed(new Duration(milliseconds: 200));
      // TODO: Delete user
      await _auth.signOut();

      await Navigator.of(context).pushReplacementNamed("/");
    } catch (error) {
      print("Logout error: $error");
      setState(() {
        _loading = false;
      });
    }
  }

  _SettingsState() {
    _auth.currentUser().then((user) {
      setState(() {
        _loading = false;
        _user = user;
        _settings = _firestore.collection("users").document(user.uid);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text("Settings"),
      ),
      body: new Padding(
        padding: new EdgeInsets.only(top: 25.0),
        child: new Column(
//        mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            _settings != null
                ? new StreamBuilder<DocumentSnapshot>(
                    stream: _settings.snapshots,
                    builder: (context, settingsSnapshot) {
                      if (settingsSnapshot.data?.data == null) {
                        return new Padding(
                          padding: new EdgeInsets.only(bottom: 15.0),
                          child: new CircularProgressIndicator(),
                        );
                      }
                      final settings = settingsSnapshot.data.data;

                      List<Widget> switches = [];
                      times.forEach((time, displayTime) =>
                          switches.add(new Column(children: [
                            new Text(times[time]),
                            new Switch(
                                value: settings[time],
                                onChanged: (value) {
                                  _settings.updateData({time: value});
                                })
                          ])));

                      return new Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: switches,
                      );
                    },
                  )
                : new Container(),
            new FlatButton(
              child: new Text("Logout"),
              onPressed: () => _logout(context),
            ),
            new Padding(
              padding: new EdgeInsets.only(top: 8.0),
              child: new Divider(height: 0.0),
            ),
            _settings != null
                ? new StreamBuilder<DocumentSnapshot>(
                    stream: _settings.snapshots,
                    builder: (context, settingsSnapshot) {
                      if (settingsSnapshot.data?.data == null) {
                        return new Container();
                      }

                      return new _Feed(getSettings(settingsSnapshot.data.data));
                    },
                  )
                : new Container(),
          ],
        ),
      ),
    );
  }
}

class _Feed extends StatefulWidget {
  final Map<String, bool> settings;

  _Feed([this.settings]);

  CollectionReference _feed = _firestore.collection("posts");

  @override
  _FeedState createState() => new _FeedState();
}

class _FeedState extends State<_Feed> {
  bool _all = false;

  @override
  Widget build(BuildContext context) {
    return new Flexible(
      child: new StreamBuilder<QuerySnapshot>(
        stream: widget._feed.snapshots,
        builder: (context, postsSnapshot) {
          if (postsSnapshot.data?.documents == null) {
            return new Padding(
              padding: new EdgeInsets.only(top: 35.0),
              child: new CircularProgressIndicator(),
            );
          }

          List<DocumentSnapshot> posts = postsSnapshot.data.documents
              .where(
                (post) => _all
                    ? true
                    : (widget.settings != null
                        ? widget.settings[post.data["time"]]
                        : true),
              )
              .toList();

          posts.sort(
              (a, b) => (b.data["date"] as int) - (a.data["date"] as int));

          final bool allDisabled =
              widget.settings?.values?.every((setting) => setting);

          return new ListView(
            children: [
              widget.settings != null
                  ? new ListTile(
                      leading: new Center(child: new Icon(Icons.star)),
                      title: new Text("All Posts"),
                      trailing: new Switch(
                        value: _all,
                        onChanged: !allDisabled
                            ? (value) => setState(() => _all = value)
                            : null,
                      ),
                    )
                  : new Container()
            ]..addAll(
                posts
                    .map((post) => new ListTile(
                          leading: post.data["thumbnail"] != ""
                              ? new Image.network(post.data["thumbnail"])
                              : new Center(child: new Icon(Icons.list)),
                          title: new Text(formatDate(post.data["date"] as int) +
                              " (${post.data["time"]})"),
                          onTap: () => open(post.data["permalink"]),
                        ))
                    .toList(),
              ),
          );
        },
      ),
    );
  }
}

Future<void> open(String url) async {
  if (await canLaunch(url)) {
    await launch(url);
  } else {
    throw 'Could not launch $url';
  }
}

String formatDate(int unix) {
  final List<String> months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  final DateTime date = new DateTime.fromMillisecondsSinceEpoch(unix);

  return "${months[date.month]} ${date.day}";
}

Map<String, bool> getSettings(Map<String, dynamic> settings) {
  return times.map((time, _) => new MapEntry(time, settings[time]));
}
