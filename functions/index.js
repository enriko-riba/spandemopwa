const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const Vision = require('@google-cloud/vision');

admin.initializeApp(functions.config().firebase);

const visionClient = Vision({
	projectId: 'spandemopwa'
});
const bucket = 'spandemopwa.appspot.com';

exports.detectLabels = functions.firestore.document('images/{imageId}').onCreate((event) => {
	// Get the file
	const filePath = event.data.data().filePath;
	const file = gcs.bucket(bucket).file(filePath);

	// Use the Vision API to detect labels
	return visionClient.detectLabels(file)
					.then(data => {
						// data returns [labels, apiResponse], we only care about the labels
						return data[0];
					}).then(labels => {
						return event.data.ref.set({ labels: labels }, {merge: true});						   
					});
});

exports.sendPushNotification = functions.firestore.document('notes/{note}').onWrite((event) => {
	if (!event.data.val()) {
		console.info('One note is removed');
		return;
	}

	var noteOwnerDisplayName = event.data.data();
	// console.info(docNote.displayname);

	const getTokens = admin.firestore.document('users/{user}/subdata').once('value');
	console.info(getTokens);
});