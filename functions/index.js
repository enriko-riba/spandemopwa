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

  var noteOwnerDisplayName = event.data.data();
  // console.info(docNote.displayname);
 
  const getTokens = admin.firestore.document('users/{user}/subdata').once('value');
  console.info(getTokens);
});