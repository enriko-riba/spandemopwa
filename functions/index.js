const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.sendPushNotification = functions.firestore.document('notes/{note}').onWrite((event) => {
  if (!event.data.val()){
    console.info('One note is removed');
    return; 
  }
  
  var noteSnapShot = event.data;

  const payload = {
    notification:{
      body: `${noteSnapShot.data().displayname} posted new story.`,
    }
  }


  return admin.firestore.document('users/{user}').once('value').then((data) => {
    
    if ( !data.val() ) return;

    const snapshot = data.data();
    const tokens = [];

    for (let key in snapshot) {
      tokens.push( snapshot[key].registrationtoken );
    }

    return admin.messaging().sendToDevice(tokens, payload)
      .then(()=>{
        console.info("success");
      });
  });
  
});