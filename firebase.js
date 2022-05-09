const firebaseConfig = require('firebase')

firebaseConfig = {
  apiKey: "AIzaSyB7QEcieFiwXXG-DdWZ4pReNatWu7AelkE",
  authDomain: "groupy-uploadfile.firebaseapp.com",
  projectId: "groupy-uploadfile",
  storageBucket: "groupy-uploadfile.appspot.com",
  messagingSenderId: "560742381578",
  appId: "1:560742381578:web:bf0488dba422fe0ac047f3"
};

firebaseConfig.initializeApp(firebaseConfig)

const db = firebase.firestore()
const User = db.collection('Users')

module.exports = Users;