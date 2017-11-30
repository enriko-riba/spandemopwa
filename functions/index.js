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
		.then(data  => {			
			var labels = data[0];
			var responses = data[1].responses;
			
			return event.data.ref.set({ labels: labels, responses: responses }, { merge: true });
		}).catch(e => {
			console.error(e);
		});
});

exports.sendPushNotification = functions.firestore.document('notes/{note}').onCreate((event) => {
	if (!event.data.data()) {
		console.info('One note is removed');
		return;
	}

	var noteSnapShot = event.data;

	const payload = {
		notification: {
			body: `${noteSnapShot.data().displayname} posted new story.`,
		}
	}

	
	return admin.firestore().collection('users').get().then((collection) => {
		
		// if (!data.data()) return;

		// const snapshot = data.data();
	
		const tokens = [];

		for (let key in collection.docs) {
		 tokens.push(collection.docs[key].data().registrationtoken);
		}
		console.info(tokens);
		return admin.messaging().sendToDevice(tokens, payload)
			.then(() => {
				console.info("success");
			});
	});

});