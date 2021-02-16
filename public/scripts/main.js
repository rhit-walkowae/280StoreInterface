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
rhit.USERS = "Users"
//?---------User fields--------------------------------
rhit.USERS_IS_ADMIN = "isAdmin";
rhit.USERS_CART = "cart";
rhit.USER_ADDRESS = "address";
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
rhit.fbAuthManager = null;
rhit.userManager = null;
rhit.fbItemsManager = null;

function htmlToElement(html) { 
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
   }


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
		document.querySelector("#editBtn").addEventListener("click", (event) => {
			console.log("hello going to adminpage");
			window.location.href = `/adminpage.html`;
		});
		document.querySelector("#shoppingCartBtn").addEventListener("click", (event) => {
			console.log("hello going to adminpage");
			window.location.href = `/cart.html`;
		});
		
		rhit.spManager.beginListening(this.updateStoreInfo.bind(this));
		rhit.fbItemsManager.beginListening(this.updateItems.bind(this));
	}
	updateStoreInfo() {
		if (rhit.fbAuthManager.isAdmin == true) {
			console.log("set edit button to visible");
			document.getElementById("editBtn").style.display = "block";
		} else {
			document.getElementById("editBtn").style.display = "none";
		}
		const store_info = rhit.spManager.setStoreInfo();
		console.log('typeof store_info :>> ', store_info.businessName);
		document.getElementById("businessNameFillerTitle").innerHTML = store_info.businessName;
		document.getElementById("businessNameFillerA").innerHTML = `   ${store_info.businessName}`;
		document.getElementById("businessNameFillerAbout").innerHTML = `ABOUT ${store_info.businessName}`;
		document.getElementById("generalInfo").innerHTML = store_info.generalInfo;

	}

	_createCard(item){
		return htmlToElement(`<div class="col-md-4">
		<div class="card" style="width: 18rem;">
		  <img class="card-img-top" src=${item.image} alt="item name">
		  <div class="card-body">
			<h5 class="card-title">${item.name}</h5>
			<p class="card-text">${item.price}</p>
			<a href="#" class="btn btn-primary">Add to cart</a>
		  </div>
		</div>
	  </div>`);
	}

	updateItems(){
		console.log("update items called");
		const newItems = htmlToElement('<div id="productSelection"></div>');
		console.log("items collection length: ", rhit.fbItemsManager.length);
		for(let i = 0; i < rhit.fbItemsManager.length; i++){
			const item = rhit.fbItemManager.getItemAtIndex(i);
			const newCard = this._createCard(item);
			newCard.onclick = (event) => {
				console.log("To do: add to cart");
			}
			newItems.appendChild(newCard);
		}
		const oldItems = document.querySelector("#productSelection");
		console.log(newItems);
		oldItems.removeAttribute("id");
		oldItems.hidden = true;
		oldItems.parentElement.appendChild(newItems);
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
// ! ------------------------------Sign In Page Controller-------------------
rhit.SignInPageController = class {
	constructor() {
		rhit.spManager.beginListening(this.updateSignPageInfo.bind(this));
	}
	updateSignPageInfo(){
		const store_info = rhit.spManager.setStoreInfo();
		console.log('typeof store_info :>> ', store_info.businessName);
		document.getElementById("businessNameFillerTitle").innerHTML = store_info.businessName;
		document.getElementById("businessNameFillerA").innerHTML = `   ${store_info.businessName}`;
	}

}
// !-----------------------------Firebase Auth Manager ------------------------
rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		this._email = null;
		this._ref = firebase.firestore().collection(rhit.USERS);
		this._unsubscribe = null;
		this._Admin = false;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;

			if (user) {
				this._email = user.email;
				console.log('user :>> ', this._email);
				if (this._email) {
					let documentRef = this._ref.doc(this._email);

					documentRef.onSnapshot((doc) => {
						if (doc.exists) {
							console.log("document Exsists!");
							this._Admin = doc.data().isAdmin;
							//console.log('imageOwner :>> ', this.imageOwner);
						} else {
							console.log("user is not yet created");
							this.addUser(this._email);
							console.log("user created")
						}
					});
				} else {
					console.log("User is anonymous");
				}

				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/firebase.User
				//console.log(`ID :>>`, user.uid);

				// ...
			} else {
				console.log(`there is no user signed in`);
				// User is signed out
				// ...
			}


			changeListener();
		});
	}
	addUser(email) {
		this._ref.doc(email).set({
			[rhit.USERS_IS_ADMIN]: false,
			[rhit.USER_ADDRESS]: null,
			[rhit.USERS_CART]: new Array(),
		}).catch((error) => {
			console.log(`error writing document:`, error);
		});
	}
	get isAdmin() {
		return this._Admin;
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

// !-----------------------------Item ------------------------
rhit.Item = class {
	constructor(id, available, image, name, handmade, price, description){
		this.id = id;
		this.available = available;
		this.image = image;
		this.name = name;
		this.handmade = handmade;
		this.price = price;
		this.description = description;
	}
}

// !-----------------------------Firebase Items ------------------------
rhit.FbItemsManager = class {
	constructor() {
		// this.uid = uid;
		this._documentSnapshots = [];
		this.ref = firebase.firestore().collection("Items");
		this._unsubscribe = null;
	}
	add(image, name, handmade, price, description){
		this.ref.add({
			["price"]: price,
			["image"]: image,
			["name"]: name,
			["handmade"]: handmade,
			["available"]: true,
			["numSales"]: 0,
			["numGifted"]: 0,
			["description"]: description,
			["addedDate"]: firebase.firestore.Timestamp.now(),
		});
	}

	beginListening(changeListener) {
		let query = this.ref.orderBy("addedDate", "desc")
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening(){
		this._unsubscribe();
	}

	getItemAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const item = new rhit.Item(docSnapshot.id, docSnapshot.get("available"), docSnapshot.get("image"), docSnapshot.get("name"), docSnapshot.get("handmade"), docSnapshot.get("price"), docSnapshot.get("description"));
		return item;
	}

}

// !-----------------------------Cart Page Controller ------------------------
rhit.CartPageController = class {
    constructor() {

        // document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
        //     console.log("Show all quotes");
        //     window.location.href = "/list.html";
        // });

        // document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
        //     console.log("Show my quotes");
        //     window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
        // });

        document.querySelector("#menuBack").addEventListener("click", (event) => {
            window.location.href = "/";
        });

        document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
            const quote = document.querySelector("#inputQuote").value;
            const movie = document.querySelector("#inputMovie").value;
            rhit.fbMovieQuotesManager.add(quote, movie);
        });

        $("#addQuoteDialog").on("show.bs.modal", (event) => {
            document.querySelector("#inputQuote").value = "";
            document.querySelector("#inputMovie").value = "";
        });
    
        $("#addQuoteDialog").on("shown.bs.modal", (event) => {
            document.querySelector("#inputQuote").focus();
        });

        //start listening
        rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
    }

    _createCard(movieQuote) {
        return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${movieQuote.quote}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
        </div>
      </div>`);
    }

    updateList() {
        console.log("i need to update");
        console.log("num quotes = ", rhit.fbMovieQuotesManager.length);
        console.log("ex quote: ", rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

        //make a new quoteListContainer
        const newList = htmlToElement('<div id="quoteListContainer"></div>');
        //fill with cards
        for (let i = 0; i < rhit.fbMovieQuotesManager.length; i++) {
            const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
            const newCard = this._createCard(mq);

            newCard.onclick = (event) => {
                // console.log(`You clicked on ${mq.id}`);
                // rhit.storage.setMovieQuoteID(mq.id);

                window.location.href = `/moviequote.html?id=${mq.id}`;
            }

            newList.appendChild(newCard);
        }
        //remove old container
        const oldList = document.querySelector("#quoteListContainer");
        oldList.removeAttribute("id");
        oldList.hidden = true;
        //put in new container
        oldList.parentElement.appendChild(newList);
    }
}


// ! ----------------------Intializing pages function-------------------------------------------
rhit.initializePage = function () {
	console.log("-----intializing-------");
	if (document.querySelector("#signInPage")) {
		//console.log("On the login page");
		rhit.startFirebaseUI();
		rhit.spManager = new rhit.SPManager();
		new rhit.SignInPageController();
	}
	if (document.querySelector("#storePage")) {
		//console.log("On the login page");
		rhit.spManager = new rhit.SPManager();
		rhit.fbItemsManager = new rhit.FbItemsManager();
		new rhit.StorePageController();
	}

	// if (document.querySelector("#cartPage")) {
	// 	rhit.spManager = new rhit.SPManager();
	// 	new rhit.StorePageController();
	// }


}
//! ------------------Main -----------------/
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready4");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log(`The auth state has changed.   isSignedIn = ${rhit.fbAuthManager.isSignedIn}`);
		rhit.initializePage()
	})


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
