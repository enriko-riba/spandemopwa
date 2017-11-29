const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const Vision = require('@google-cloud/vision');

admin.initializeApp(functions.config().firebase);

const visionClient = Vision({
	projectId: 'spandemopwa'
});
const bucket = 'spandemopwa.appspot.com';

exports.detectLabels = functions.firestore.document('images/{imageId}').onWrite((event) => {
	// Get the file
	const filePath = event.data.val().filePath;
	const file = gcs.bucket(bucket).file(filePath);

	// Use the Vision API to detect labels
	return visionClient.detectLabels(file)
					.then(data => {
						// data returns [labels, apiResponse], we only care about the labels
						return data[0];
					}).then(labels => {
						return admin.firestore().collection('images')							
							.child(event.params.imageId)
							.set({ labels: labels });
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