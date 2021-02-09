/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";
rhit.ITEMS_COLLECTION = "Items"
rhit.STORE_INFO = "StoreInfo"
//?---------Store info Keys-----------------------------
rhit.STORE_KEY_BUSINESS_NAME = "businessName";
rhit.STORE_KEY_GENERAL_INFO = "generalInfo";
rhit.STORE_KEY_LOGO = "logo";
rhit.STORE_KEY_SLIDE_SHOW = "generalInfo";
rhit.STORE_KEY_ANNOUNCEMENT_IMG = "announcementImg";
rhit.STORE_KEY_ANNOUNCEMENT = "announcement";
rhit.STORE_KEY_TAGLINE = "tagline";
//?------------------------------------------------------
rhit.spManager = null;


// * ------ Store Info Object contains all information for Store Main Page -------------------------------
rhit.StoreInfoObject = class {
	constructor(businessName, generalInfo, logo, slideShow, announcementImg, announcement, tagline) {
		this.businessName = businessName;
		this.generalInfo = generalInfo;
		this.logo = logo;
		this.slideShow = slideShow;
		this.announcementImg = announcementImg;
		this.announcement = announcement;
		this.tagline = tagline;
	}
}
// !----------------------Store Page Controller ------------------------
rhit.StorePageController = class {
	constructor() {
		document.querySelector("#signInBtn").addEventListener("click", (event) => {

			window.location.href = `/signin.html`;
		});
		rhit.spManager.beginListening(this.updateStoreInfo.bind(this));
	}
	updateStoreInfo() {
		const store_info = rhit.spManager.setStoreInfo();
		console.log('typeof store_info :>> ', store_info.businessName);
		document.getElementById("businessNameFillerTitle").innerHTML = store_info.businessName;
		document.getElementById("businessNameFillerA").innerHTML = `   ${store_info.businessName}`;
		document.getElementById("businessNameFillerAbout").innerHTML = `ABOUT ${store_info.businessName}`;
		document.getElementById("generalInfo").innerHTML = store_info.generalInfo;

	}

}
// !--------------------Store Page Manager -------------------------------------
rhit.SPManager = class {
	constructor(uid) {
		////console.log("list manager created");
		// this._uid = rhit.fbAuthManager._user;
		this._uid = uid;
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection(rhit.STORE_INFO);
		this._unsubscribe = null;
	}
	stopListening() {
		this._unsubscribe();
	}

	beginListening(changeListener) {
		/*
	
		var query = this._ref;
		////console.log('typeof :>> ', typeof this._ref);
		if (this._uid) {
			var query = this._ref.where(rhit.IMG_KEY_AUTHOR, "==", this._uid);
		}
		query.onSnapshot((querySnapshot) => {
			this._documentSnapshot = querySnapshot.docs;
			changeListener();
		});
		*/
		this._ref.onSnapshot((querySnapshot) => {
			this._documentSnapshot = querySnapshot.docs;
			changeListener();
		});

	}

	get length() {
		return this._documentSnapshot.length;
	}
	setStoreInfo() {
		console.log('typeof docSnapshot :>> ', this._documentSnapshot);
		const docSnapshot = this._documentSnapshot[0];

		const StoreInfo = new rhit.StoreInfoObject(
			docSnapshot.get(rhit.STORE_KEY_BUSINESS_NAME),
			docSnapshot.get(rhit.STORE_KEY_GENERAL_INFO),
			docSnapshot.get(rhit.STORE_KEY_LOGO),
			docSnapshot.get(rhit.STORE_KEY_SLIDE_SHOW),
			docSnapshot.get(rhit.STORE_KEY_ANNOUNCEMENT_IMG),
			docSnapshot.get(rhit.STORE_KEY_ANNOUNCEMENT),
			docSnapshot.get(rhit.STORE_KEY_TAGLINE),

		);
		////console.log("images loaded");
		return StoreInfo;
	}
};
// !-----------------------------Firebase Auth Manager ------------------------
rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			if (user) {

				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/firebase.User
				//console.log(`ID :>>`, user.uid);

				// ...
			} else {
				//console.log(`there is no user signed in`);
				// User is signed out
				// ...
			}


			changeListener();
		});
	}
	signOut() {
		firebase.auth().signOut();
	}
	get uid() {
		return this._user.uid;
	}
	get isSignedIn() {
		return !!this._user;
	}
}



// ! ----------------------Intializing pages function-------------------------------------------
rhit.initializePage = function () {
	//console.log("-----intializing-------");
	if (document.querySelector("#signInPage")) {
		//console.log("On the login page");
		rhit.startFirebaseUI();
		new rhit.signInPageController();
	}
	if (document.querySelector("#storePage")) {
		//console.log("On the login page");
		rhit.spManager = new rhit.SPManager();
		new rhit.StorePageController();
	}


}
//! ------------------Main -----------------/
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready4");
	rhit.initializePage();

};

rhit.startFirebaseUI = function () {
	console.log("firebaseUI building");
	//if (!this.fbAuthManager.isSignedIn) {

	var uiConfig = {
		signInSuccessUrl: '/',
		//signInSuccessUrl: function () {this.fbAuthManager.signIn();},
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
		// tosUrl and privacyPolicyUrl accept either url string or a callback
		// function.
		// Terms of service url/callback.
		tosUrl: '<your-tos-url>',
		// Privacy policy url/callback.

	};
	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
	//}
};

rhit.main();
