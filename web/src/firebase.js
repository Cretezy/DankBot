import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/messaging';

const config = {
  apiKey: "AIzaSyD_-KXX0fXSHwaEnAaIYe3DI93b952gHX8",
  authDomain: "dank-bot-42069.firebaseapp.com",
  databaseURL: "https://dank-bot-42069.firebaseio.com",
  projectId: "dank-bot-42069",
  storageBucket: "",
  messagingSenderId: "593740228443"
};

export default firebase.initializeApp(config);

firebase.messaging().usePublicVapidKey("BEjpXdeb1ZrHD5bYP-PRfP1g6YIHJQy6i6OJ1EjA8d6ij-_V0y7WxlJpAGiRZb6IzO0W3cvavLgISf4He_dCzgE");
