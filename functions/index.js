const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')({keyFilename:'spandemopwa-d9c98170a99d.json'});
const Vision = require('@google-cloud/vision');

admin.initializeApp(functions.config().firebase);

const visionClient = Vision({
	projectId: 'spandemopwa'
});
const bucket = 'spandemopwa.appspot.com';

//exports.annotateImage = functions.firestore.document('images/{imageId}').onCreate((event) => {
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

	// Exit if file exists but is not new and is only being triggered
	// because of a metadata change.
	if (resourceState === 'exists' && metageneration > 1) {
		console.log('This is a metadata change event.');
		return;
	}
	
	const gcsUrl = "gs://" + bucket + "/" + filePath;
	const imgResultsRef = admin.firestore().collection('imageresults');
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
			{"type": "DOCUMENT_TEXT_DETECTION"},
			{"type": "CROP_HINTS"},
			{"type": "SAFE_SEARCH_DETECTION"}
		]
	};
	// gcs.bucket(bucket).file(filePath).getMetadata()
	// .then(md => { 
	// 	console.log('meta.metadata: ', md[0].metadata);
	// 	let downloadURL = `https://firebasestorage.googleapis.com/v0/b/spandemopwa.appspot.com/o/${filePath}?alt=media&token=${md[0].metadata.firebaseStorageDownloadTokens}`;
	// 	console.log('downloadURL: ', downloadURL);
	// });
	return generateSignedUrl(bucket, filePath)
		.then( downloadURL => {
			//console.log('generateSignedUrl: ', downloadURL);
		
			return visionClient.annotate(visionReq)
				.then(([visionData]) => {
					let imgMetadata = visionData[0];
					console.log('got vision data: ', imgMetadata);
					return imgResultsRef.add({
						imgMetadata: imgMetadata,
						created: admin.firestore.FieldValue.serverTimestamp(),
						downloadURL: downloadURL,
						filePath: filePath
					});
				});
			});
});

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

/*
exports.detectLabels = functions.firestore.document('images/{imageId}').onCreate((event) => {
	// Get the file
	const filePath = event.data.data().filePath;
	const file = gcs.bucket(bucket).file(filePath);

	// Use the Vision API to detect labels
	return visionClient.detectLabels(file)
		.then(data  => {			
			var labels = data[0];
			var responses = data[1].responses;
			
			return event.data.ref.set({ labels: labels, responses: responses, error: null }, { merge: true });
		}).catch(e => {
			console.error(e);
			var errors = "";
			var responses = "";
			if(e.errors && e.errors.errors){
				errors = JSON.stringify(e.errors.errors);
				console.warn(errors);
			}
			if(e.response && e.response.responses){
				responses = JSON.stringify(e.response.responses);
				console.warn(responses);
			}
			return event.data.ref.set(
				{ 
					labels: null, 
					responses: null, 
					error: {
							errors: errors, 
							responses: responses 
						} 
				}, 
				{ merge: true }
			);
		});
});
*/
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