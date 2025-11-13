import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'; // habilita o Storage

const firebaseConfig = {
  apiKey: "AIzaSyDyOtWefbJcphcqnjhX9ssQ63Dk01LmX8c",
  authDomain: "agendae-35275.firebaseapp.com",
  projectId: "agendae-35275",
  storageBucket: "agendae-35275.appspot.com",
  messagingSenderId: "992182086867",
  appId: "1:992182086867:web:90c65d3822e300400cb826",
  measurementId: "G-H10L7C7NX5"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

try {
  db.settings({
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch (_) {
  // ignora erro caso o Firestore já esteja configurado
}

export { auth, db, firebase };
