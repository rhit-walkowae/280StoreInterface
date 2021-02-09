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
// !----------------------Store Page Controller ------------------------
rhit.StorePageController = class {
	constructor() {
		document.querySelector("#signInBtn").addEventListener("click", (event) => {

			window.location.href = `/signin.html`;
		});

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
