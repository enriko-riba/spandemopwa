const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const Vision = require('@google-cloud/vision');

admin.initializeApp(functions.config().firebase);

const visionClient = Vision({
	projectId: 'spandemopwa'
});
const bucket = 'spandemopwa.appspot.com';

exports.annotateImage = functions.firestore.document('images/{imageId}').onCreate((event) => {
	// Get the file
	const filePath = event.data.data().filePath;
	//const file = gcs.bucket(bucket).file(filePath);
	const gcsUrl = "gs://" + bucket + "/" + filePath;
	let visionReq = {
        "image": {
			"source": {
			  "imageUri": gcsUrl
			}
		},
        "features": [
          {
            "type": "FACE_DETECTION"
          },
          {
            "type": "LABEL_DETECTION"
          },
          {
            "type": "LANDMARK_DETECTION"
		  },
		  {
            "type": "DOCUMENT_TEXT_DETECTION"
		  },
		  {
            "type": "CROP_HINTS"
          },
        //   {
        //     "type": "WEB_DETECTION"
        //   },
        //   {
        //     "type": "IMAGE_PROPERTIES"
        //   },
          {
            "type": "SAFE_SEARCH_DETECTION"
          }
        ]
	  };

	  return visionClient.annotate(visionReq)
						.then( ([visionData])=> {
							let imgMetadata = visionData[0];
							console.log('got vision data: ', imgMetadata);
							return event.data.ref.set({ imgMetadata: imgMetadata, error: null }, { merge: true });
						});	
});

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
			click_action:`https://${functions.config().firebase.authDomain}/#/dbupdate`
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