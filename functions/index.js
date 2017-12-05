const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')({keyFilename:'spandemopwa-d9c98170a99d.json'});
const Vision = require('@google-cloud/vision');

admin.initializeApp(functions.config().firebase);

const visionClient = Vision({
	projectId: 'spandemopwa'
});
const bucket = 'spandemopwa.appspot.com';

exports.annotateImg = functions.storage.bucket(bucket).object().onChange(event => {

	const object = event.data; 						// The Storage object.
	const filePath = object.name; 					// File path in the bucket.
	const contentType = object.contentType; 		// File content type.
	const resourceState = object.resourceState;		// The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
	const metageneration = object.metageneration; 	// Number of times metadata has been generated. New objects have a value of 1.
	
	// Exit if this is triggered on a file that is not an image.
	if (!contentType.startsWith('image/')) {
		console.log('This is not an image.');
		return;
	}

	// Exit if this is a move or deletion event.
	if (resourceState === 'not_exists') {
		console.log('This is a deletion event.');
		return;
	}

	// Exit if file exists but is not new and is only being triggeredbecause of a metadata change.
	if (resourceState === 'exists' && metageneration > 1) {
		console.log('This is a metadata change event.');
		return;
	}
	
	//	prepare request
	const gcsUrl = "gs://" + bucket + "/" + filePath;
	let visionReq = {
		"image": {
			"source": {
				"imageUri": gcsUrl
			}
		},
		"features": [
			{"type": "FACE_DETECTION"},
			{"type": "LABEL_DETECTION"},
			{"type": "LANDMARK_DETECTION"},
			{"type": "TEXT_DETECTION"},
			{"type": "SAFE_SEARCH_DETECTION"}
		]
	};
	
	return generateSignedUrl(bucket, filePath)
	.then( downloadURL => {
		return visionClient.annotate(visionReq)
			.then(([visionData]) => {
				let imgMetadata = visionData[0];
				let meta = {} = visionData[0]
				console.log('got vision data: ', imgMetadata);
				
				//	store result in imageresults collection
				const imgResultsRef = admin.firestore().collection('imageresults');
				return imgResultsRef.add({
					imgMetadata: imgMetadata,
					created: admin.firestore.FieldValue.serverTimestamp(),
					downloadURL: downloadURL,
					filePath: filePath
				})
				.then( docRef => {	//	push notification					
					getAllDevices(). then(tokens=>{
						const payload = {
							notification: {
								title: "New image",
								body: "Image was processed",
								click_action: downloadURL
							}
						}
						sendPushMessage(tokens, payload);
					});
				});
			});
		});
});

/**
 * Generates signed file url for downloading.
 * @param {*} bucketName 
 * @param {*} filename 
 */
function generateSignedUrl(bucketName, filename) {
	// These options will allow temporary read access to the file
	const options = {
	  action: 'read',
	  expires: '01-01-2125',
	};

	return gcs
			.bucket(bucketName)
			.file(filename)
			.getSignedUrl(options)
			.then(results => {
				const url = results[0];  
				console.log('signedurl: ', url);
				return url;
			})
			.catch(err => {
				console.error('ERROR:', err);
			});
}

/**
 * Returns push endpoints of all devices that have a registered push subscription.
 */
function getAllDevices(){
	return admin.firestore().collection('users').get()
			.then((users) => {
				if (!users.docs) return;
				let tokens = users.docs.map(doc => doc.data().registrationtoken);
				return tokens;
			});
}

/**
 * Sends push notification to all devices for the given tokens.
 * @param {*} tokens 
 * @param {*} payload 
 */
function sendPushMessage(tokens, payload){
	return admin.messaging().sendToDevice(tokens, payload)
	.then(() => {
		console.info("sent push to: " + tokens.length + " devices." );
	});
}

exports.sendPushNotification = functions.firestore.document('notes/{note}').onCreate((event) => {
	if (!event.data.data()) {
		console.info('One note is removed');
		return;
	}

	var noteSnapShot = event.data;
	const payload = {
		notification: {
			title: `New story`,
			body: `${noteSnapShot.data().displayname} posted new story.`,
			click_action: `https://${functions.config().firebase.authDomain}/#/dbupdate`
		}
	}
	return admin.firestore().collection('users').get().then((collection) => {

		if (!collection.docs) return;

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