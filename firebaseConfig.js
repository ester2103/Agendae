import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxLnesrVryb80EHlCiSKnsW1LnzvGQdZQ",
  authDomain: "loginagendae.firebaseapp.com",
  projectId: "loginagendae",
  storageBucket: "loginagendae.firebasestorage.app",
  messagingSenderId: "545930068799",
  appId: "1:545930068799:web:6360161b1a029a7147098a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
