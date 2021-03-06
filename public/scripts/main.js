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
rhit.STORE_KEY_SLIDE_SHOW = "slideShow";
rhit.STORE_KEY_ANNOUNCEMENT_IMG = "announcementImg";
rhit.STORE_KEY_ANNOUNCEMENT = "announcement";
rhit.STORE_KEY_TAGLINE = "tagline";
rhit.STORE_KEY_EMAIL_LIST = "emailList";
rhit.STORE_SOCIAL_MEDIA = "socialMedia";
rhit.STORE_EVENTS = "Events";
//?------------------------------------------------------
rhit.spManager = null;
rhit.fbAuthManager = null;
rhit.userManager = null;
rhit.fbItemsManager = null;
rhit.storeNavUpdate = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}
// * ------ Store Info Object contains all information for Store Main Page -------------------------------
rhit.StoreInfoObject = class {
	constructor(businessName, generalInfo, logo, slideShow, announcementImg, announcement, tagline, emailList, socialMedia, events) {
		this.businessName = businessName;
		this.generalInfo = generalInfo;
		this.logo = logo;
		this.slideShow = slideShow;
		this.announcementImg = announcementImg;
		this.announcement = announcement;
		this.tagline = tagline;
		this.emailList = emailList;
		this.socialMedia = socialMedia;
		this.events = events;
	}
}
rhit.StoreEventObject = class {
	constructor(id, name, location, date) {
		this.id = id;
		this.name = name;
		this.location = location;
		this.date = date;
	}

}
rhit.StoreNavUpdate = class {
	constructor() {
		//console.log("update title");
		const store_info = rhit.spManager.getStoreInfo();
		const title = document.querySelector('#businessNameFillerTitle');
		if (title) {
			title.innerHTML = store_info.businessName;
		}
		const navA = document.querySelector('#businessNameFillerA');
		if (navA) {
			navA.innerHTML = `&nbsp;&nbsp;${store_info.businessName}`;
		}
		const logo = document.querySelector('#businessLOGO');
		//console.log(logo);
		if (logo) {

			logo.src = store_info.logo;
		}

	}
}
// !----------------------Store Page Controller ------------------------
rhit.StorePageController = class {
	constructor() {

		document.querySelector("#signInBtn").addEventListener("click", (event) => {

			window.location.href = `/signin.html`;
		});

		document.querySelector("#editBtn").addEventListener("click", (event) => {
			//console.log("hello going to adminpage");
			window.location.href = `/adminpage.html`;
		});
		// document.querySelector("#addToCart").addEventListener("click", (event) => {
		// 	//console.log("hello going to adminpage");
		// 	const itemId = parseInt(document.dataset.dataId);
		// 	console.log(itemId);
		// });

		rhit.spManager.beginListening(this.updateStoreInfo.bind(this));
		rhit.fbItemsManager.beginListening(this.updateItems.bind(this));
		rhit.fbAuthManager.beginListening(this.updateCart.bind(this));
	}

	updateStoreInfo() {
		console.log(rhit.spManager);
		if (rhit.fbAuthManager.isAdmin == true) {
			//console.log("set edit button to visible");
			document.getElementById("editBtn").style.display = "block";
		} else {
			document.getElementById("editBtn").style.display = "none";
		}
		const store_info = rhit.spManager.getStoreInfo();
		//console.log('typeof store_info :>> ', store_info.events);
		document.getElementById("tagLine").innerHTML = store_info.tagline;
		document.getElementById("businessNameFillerAbout").innerHTML = `ABOUT ${store_info.businessName}`;
		document.getElementById("generalInfo").innerHTML = store_info.generalInfo;
		document.getElementById("announcementImg").src = store_info.announcementImg;
		document.getElementById("announcementText").innerHTML = store_info.announcement




		//?-----------------slideShow----------------------------------------------------------
		const newSlideList = htmlToElement('<div id="slideShowContainer" class="carousel-inner"><div>')
		for (let i = 0; i < store_info.slideShow.length; i++) {
			////console.log(store_info.slideShow[i]);
			if (i == 0) {
				////console.log("here with active");
				const newSlide = this._createSlideIMGActive(store_info.slideShow[i]);
				newSlideList.appendChild(newSlide);
			} else {
				const newSlide = this._createSlideIMG(store_info.slideShow[i]);
				newSlideList.appendChild(newSlide);

			}
		}
		const oldList = document.querySelector(`#slideShowContainer`);
		oldList.removeAttribute("id");

		oldList.parentElement.appendChild(newSlideList);
		oldList.remove();
		//? -----------------events -------------------------------------
		const newEventList = htmlToElement(`<div id="eventContainer"></div>`);
		//console.log(rhit.spManager._eventDocSnapshot.docs);
		for (let i = 0; i < rhit.spManager.eventLength; i++) {
			const eventC = rhit.spManager.getEventAtIndex(i);
			const newEvent = this._createEventRow(eventC);
			newEventList.appendChild(newEvent);
		}
		const oldEventList = document.querySelector(`#eventContainer`);
		oldEventList.removeAttribute("id");
		oldEventList.hidden = true;
		oldEventList.parentElement.appendChild(newEventList);

	}


	updateItems() {
		$("#cartDialog").on("show.bs.modal", (event) => {
			const cart = rhit.fbAuthManager.getCart();
			console.log(cart);
			console.log(rhit.fbItemsManager.getItemAtId(cart[0]));
			console.log("update items called");
			const newcItemsList = htmlToElement(' <div id="cartItemContainer"></div>');
			for (let i = 0; i < cart.length; i++) {

				const item = rhit.fbItemsManager.getItemAtId(cart[i]);
				console.log(item);
				const newCard = this._createItem(item);
				const deleteCard = htmlToElement(`<a href="#" class="btn btn-primary">Delete</a>`);
				deleteCard.onclick = (event) => {
					rhit.fbAuthManager.removeCartArray(item.id)
					console.log("Delete item");
					this.updateCart();
					//document.querySelector("#cartDialogCancel").click();
					//document.querySelector("#shoppingCartBtn").click();
				}
				newcItemsList.appendChild(newCard);
				newcItemsList.appendChild(deleteCard);
				newcItemsList.appendChild(htmlToElement(`<hr>`));

			}
			const oldcItemsList = document.querySelector("#cartItemContainer");
			console.log(newcItemsList);
			oldcItemsList.removeAttribute("id");
			oldcItemsList.hidden = true;
			oldcItemsList.parentElement.appendChild(newcItemsList);
			document.querySelector("#shoppingCartBtn").click();

		});

		console.log(rhit.fbItemsManager.getItemAtIndex(0));
		console.log("update items called");
		const newItemsList = htmlToElement('<div id="productItems" class="row" style="padding-right: 10px;"></div>');

		console.log("items collection length: ", rhit.fbItemsManager.length);
		for (let i = 0; i < rhit.fbItemsManager.length; i++) {
			const item = rhit.fbItemsManager.getItemAtIndex(i);
			const cardAddBtn = htmlToElement(`<div class="card-footer text-muted">
			<div>
			<a id="${item.id}" class="btn btn-primary">Add to cart</a>
		  </div>
		  </div>`);
			const newCard = this._createCard(item, cardAddBtn);
		
			cardAddBtn.onclick = (event) => {
				console.log(item.id);
				rhit.fbAuthManager.addCartArray(item.id);
			}
			newCard.appendChild(cardAddBtn);
			const newCardCol = htmlToElement('<div class="col-md-4" style="margin-bottom: 10px;"></div>');
			newCardCol.appendChild(newCard);
			newItemsList.appendChild(newCardCol);
		}
		const oldItemsList = document.querySelector("#productItems");
		console.log(newItemsList);
		oldItemsList.removeAttribute("id");
		oldItemsList.hidden = true;
		oldItemsList.parentElement.appendChild(newItemsList);
	}
	updateCart() {
		const cart = rhit.fbAuthManager.getCart();
		console.log(cart);
		console.log(rhit.fbItemsManager.getItemAtId(cart[0]));
		console.log("update items called");
		const newcItemsList = htmlToElement(' <div id="cartItemContainer"></div>');
		for (let i = 0; i < cart.length; i++) {

			const item = rhit.fbItemsManager.getItemAtId(cart[i]);
			console.log(item);
			const newCard = this._createItem(item);
			const deleteCard = htmlToElement(`<a href="#" class="btn btn-primary">Delete</a>`);
			deleteCard.onclick = (event) => {
				rhit.fbAuthManager.removeCartArray(item.id)
				console.log("Delete item");
				this.updateCart();
				//document.querySelector("#cartDialogCancel").click();
				//document.querySelector("#shoppingCartBtn").click();
			}
			newcItemsList.appendChild(newCard);
			newcItemsList.appendChild(deleteCard);
			newcItemsList.appendChild(htmlToElement(`<hr>`));

		}
		const oldcItemsList = document.querySelector("#cartItemContainer");
		console.log(newcItemsList);
		oldcItemsList.removeAttribute("id");
		oldcItemsList.hidden = true;
		oldcItemsList.parentElement.appendChild(newcItemsList);





	}



	_createSlideIMG(image) {
		return htmlToElement(`<div class="carousel-item">
		<img class="d-block w-100"  style="max-height: 40vh; object-fit:cover;" src="${image}" alt="First slide">
	  </div>`)
	}
	_createSlideIMGActive(image) {
		return htmlToElement(`<div class="carousel-item active">
		<img class="d-block w-100" style="max-height: 40vh; object-fit:cover;" src="${image}" alt="First slide">
	  </div>`)
	}


	_createCard(item, addBtn) {
		//console.log("button html: ", addBtn);
		return htmlToElement(`
		<div class="card h-100">
		 
		  <div class="card-body">
			<h5 class="card-title">${item.name}</h5>
			<img class="card-img-top" src="${item.image}" alt="item image not currently available" style="max-height: 40vh;">
			<p class="card-text">${item.description}</p>
	 	  <p class="card-text">${item.price}</p>
		   <p><small class="text-muted"> Available = ${item.available}</small></p>
			
		  </div>
		  
		</div>
	  `);

	}
	_createEventRow(eventItem) {
		return htmlToElement(`<div class ="row">
		<div class="col">
		${eventItem.name}
	  </div>
	  <div class="col-6">
		${eventItem.location}
	  </div>
	  <div class="col">
		${eventItem.date}
		
	  </div>
	  </div>`)
	}
	_createItem(item) {
		//console.log("HEREEEEEEEEEEEEEEEE");
		return htmlToElement(`<div class="row">
              <div class="col">
                <img src="${item.image}" alt="product has no image" style="max-width: 10vw;">
              </div>
              <div class="col-5">
                <h5>${item.name}</h5>
              </div>
              <div class="col">
                <h5>${item.price}</h5>
              </div>
            </div>`);
	}


}
// !--------------------Store Page Manager -------------------------------------
rhit.SPManager = class {
	constructor(uid) {
		//////console.log("list manager created");
		// this._uid = rhit.fbAuthManager._user;
		this._uid = uid;
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection(rhit.STORE_INFO);
		this._events = firebase.firestore().collection(rhit.STORE_INFO).doc("singleton").collection("Events");
		this._eventDocSnapshot = {};
		this._unsubscribe = null;
	}
	stopListening() {
		this._unsubscribe();
	}


	beginListening(changeListener) {
		/*
	
		var query = this._ref;
		//////console.log('typeof :>> ', typeof this._ref);
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

			this._events.onSnapshot((querySnapshote) => {
				this._eventDocSnapshot = querySnapshote.docs;
				//console.log(this._eventDocSnapshot[0].data());
				changeListener();
			});

		});



	}

	get length() {
		return this._documentSnapshot.length;
	}
	get eventLength() {
		return this._eventDocSnapshot.length;
	}
	updateLogoUrl(url) {
		this._ref.doc("singleton").update({
			[rhit.STORE_KEY_LOGO]: url
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});
	}
	updateString(field, name) {
		//console.log('field :>> ', field);
		this._ref.doc("singleton").update({
			[field]: name
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});
	}
	removeArray(field, remove) {
		//console.log("removing email List");
		//console.log(remove);
		this._ref.doc("singleton").update({
			[field]: firebase.firestore.FieldValue.arrayRemove(remove)
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});


	}
	addArray(field, email) {
		this._ref.doc("singleton").update({
			[field]: firebase.firestore.FieldValue.arrayUnion(email)
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});

	}
	getStoreInfo() {

		const docSnapshot = this._documentSnapshot[0];
		//console.log(docSnapshot);
		const StoreInfo = new rhit.StoreInfoObject(
			docSnapshot.get(rhit.STORE_KEY_BUSINESS_NAME),
			docSnapshot.get(rhit.STORE_KEY_GENERAL_INFO),
			docSnapshot.get(rhit.STORE_KEY_LOGO),
			docSnapshot.get(rhit.STORE_KEY_SLIDE_SHOW),
			docSnapshot.get(rhit.STORE_KEY_ANNOUNCEMENT_IMG),
			docSnapshot.get(rhit.STORE_KEY_ANNOUNCEMENT),
			docSnapshot.get(rhit.STORE_KEY_TAGLINE),
			docSnapshot.get(rhit.STORE_KEY_EMAIL_LIST),
			docSnapshot.get(rhit.STORE_SOCIAL_MEDIA),
		);
		//////console.log("images loaded");
		return StoreInfo;
	}
	singleField(field) {
		this._ref.doc("singleton").get().then((doc) => {
			//console.log(doc.get(field));
			return doc.get(field);
		});

	}
	getEventAtIndex(index) {
		const eventDoc = this._eventDocSnapshot[index];
		//console.log(eventDoc.id);
		const event = new rhit.StoreEventObject(
			eventDoc.id,
			eventDoc.get("Name"),
			eventDoc.get("Location"),
			eventDoc.get("Date")
		)
		return event;
	}
	_deleteEvent(index) {
		this._events.doc(index).delete()
			.then(function () {
				//console.log("doc deleted");
				//window.location.href = "/list.html";
			})
			.catch(function (error) {});

	}
	addEvent(name, location, date) {
		//////console.log("adding picture");
		this._events

			.add({

				["Name"]: name,
				["Location"]: location,
				["Date"]: date,
			})
			.then(function (docref) {
				////console.log(`document written with ID`);
			})
			.catch(function (error) {
				////console.error("Error adding document:", error);
			});
	}


};

//!-------------------------------Admin Page Controller -----------------
//TODO: ADD function that uploads firebase slideshow images into slideshow modal, 
//TODO: add buttons to pins for deleting, and add an add button that uploads new files to be added to the array
rhit.AdminPageController = class {
	constructor() {
		this._slideShowLength = 0;
		// !--------- submit photo 4 logo-----------------------------------
		document.querySelector("#submitPhoto").onclick = (event) => {
			//console.log("you pressed upload photo");
			document.querySelector("#inputFile").click();
		};
		document.querySelector("#inputFile").addEventListener('change', (event) => {
			const file = event.target.files[0];
			//console.log(`recieved ${file.name}`);
			const storageREF = firebase.storage().ref().child("LOGO");

			storageREF.put(file).then((uploadTaskSnapshot) => {
				//console.log("the file has been uploaded");
				storageREF.getDownloadURL().then((downloadURL) => {
					//console.log(downloadURL);
					rhit.spManager.updateLogoUrl(downloadURL);

				})
			});
			//result.textContent = `You like ${event.target.value}`;
		});
		//!------------ submit announcement image -----------------------
		document.querySelector("#submitAnnouncementPhoto").onclick = (event) => {
			//console.log("you pressed upload announcement photo");
			document.querySelector("#inputAnnouncementFile").click();
		};
		document.querySelector("#inputAnnouncementFile").addEventListener('change', (event) => {
			const file = event.target.files[0];
			//console.log(`recieved ${file.name}`);
			const storageREF = firebase.storage().ref().child("AnnouncementIMG");

			storageREF.put(file).then((uploadTaskSnapshot) => {
				//console.log("the file has been uploaded");
				storageREF.getDownloadURL().then((downloadURL) => {
					//console.log(downloadURL);
					rhit.spManager.updateString(rhit.STORE_KEY_ANNOUNCEMENT_IMG, downloadURL);

				})
			});
			//result.textContent = `You like ${event.target.value}`;
		});
		document.querySelector("#submitAddEmail").onclick = (event) => {
			//console.log("you pressed add email");
			const newAdminEmail = document.querySelector(`#newAdminEmail`).value;
			rhit.spManager.addAdminEmail(newAdminEmail);

		};
		$("#addEmailsModal").on("show.bs.modal", (event) => {
			document.querySelector("#newAdminEmail").value = "";

		});
		//!Adding Slide Show Images------------------------------------------------------
		document.querySelector("#addSlideImage").onclick = (event) => {
			//console.log("you pressed upload slide photo");
			document.querySelector("#inputSlideImage").click();
		};
		document.querySelector("#inputSlideImage").addEventListener('change', (event) => {
			const file = event.target.files[0];
			//console.log(`recieved ${file.name}`);
			//console.log(this._slideShowLength);
			const storageREF = firebase.storage().ref().child(`${file.name}`);

			storageREF.put(file).then((uploadTaskSnapshot) => {
				//console.log("the file has been uploaded");
				storageREF.getDownloadURL().then((downloadURL) => {
					//console.log(downloadURL);
					rhit.spManager.addArray(rhit.STORE_KEY_SLIDE_SHOW, downloadURL);

				})
			});
			//result.textContent = `You like ${event.target.value}`;
		});
		//*-----------------------------------------------------------------------------------------
		//!Adding Item Images------------------------------------------------------
		document.querySelector("#addItemImage").onclick = (event) => {
			//console.log("you pressed upload slide photo");
			document.querySelector("#inputItemImage").click();
		};
		document.querySelector("#inputItemImage").addEventListener('change', (event) => {
			const file = event.target.files[0];
			//console.log(`recieved ${file.name}`);
			//console.log(this._slideShowLength);
			const storageREF = firebase.storage().ref().child(`Temporary`);
			storageREF.put(file).then((uploadTaskSnapshot) => {
				//console.log("the file has been uploaded");
				console.log(rhit.fbItemsManager);
				rhit.fbItemsManager._setTempImage(file);
				storageREF.getDownloadURL().then((downloadURL) => {
					//console.log(downloadURL);
					const tempImg = document.querySelector(`#tempItemImage`);
					tempImg.src = downloadURL;
					tempImg.hidden = false;
					//rhit.spManager.addArray(rhit.STORE_KEY_SLIDE_SHOW, downloadURL);

				})
			});
			//result.textContent = `You like ${event.target.value}`;
		});
		//*-----------------------------------------------------------------------------------------

		document.querySelector(`#inputBusinessName`).addEventListener('change', (event) => {
			//console.log(event.target.value);
			rhit.spManager.updateString(rhit.STORE_KEY_BUSINESS_NAME, event.target.value);
		});
		document.querySelector(`#inputTagLine`).addEventListener('change', (event) => {
			//console.log(event.target.value);
			rhit.spManager.updateString(rhit.STORE_KEY_TAGLINE, event.target.value);
		});
		document.querySelector(`#inputGeneralInfo`).addEventListener('change', (event) => {
			//console.log(event.target.value);
			rhit.spManager.updateString(rhit.STORE_KEY_GENERAL_INFO, event.target.value);
		});
		document.querySelector(`#inputAnnouncement`).addEventListener('change', (event) => {
			//console.log(event.target.value);
			rhit.spManager.updateString(rhit.STORE_KEY_ANNOUNCEMENT, event.target.value);
		});
		document.querySelector(`#submitAddEvent`).onclick = (event) => {
			const eName = document.querySelector(`#newEventName`).value;
			const eLocation = document.querySelector(`#newEventLocation`).value;
			const eDate = document.querySelector(`#newEventDate`).value;
			if (eName.length > 0) {
				rhit.spManager.addEvent(eName, eLocation, eDate);
			}
		};
		$("#addEventListContainer").on("show.bs.modal", (event) => {
			document.querySelector(`#newEventName`).value = "";
			document.querySelector(`#newEventLocation`).value = "";
			document.querySelector(`#newEventDate`).value = "";
		});
		document.querySelector(`#submitAddItem`).onclick = (event) => {
			const iTitle = document.querySelector(`#newItemTitle`).value;
			const iPrice = document.querySelector(`#newItemPrice`).value;
			const iDescription = document.querySelector(`#newItemDescription`).value;
			if (iTitle.length > 0) {
				rhit.fbItemsManager.add(iTitle, true, iPrice, iDescription);
			}
		};
		$("#addPost").on("show.bs.modal", (event) => {
			document.querySelector(`#newItemTitle`).value = "";
			document.querySelector(`#newItemPrice`).value = "$";
			document.querySelector(`#newItemDescription`).value = "";
			document.querySelector(`#tempItemImage`).hidden = true;
		});






		rhit.spManager.beginListening(this.updateView.bind(this));
		rhit.fbItemsManager.beginListening(this.updateItemView.bind(this));
	}

	updateView() {
		const store_info = rhit.spManager.getStoreInfo();
		document.getElementById("inputBusinessName").value = store_info.businessName;
		document.getElementById("businessLOGOEdit").src = store_info.logo;
		document.getElementById("inputTagLine").value = store_info.tagline;
		document.getElementById("inputGeneralInfo").value = store_info.generalInfo;
		document.getElementById("inputAnnouncement").value = store_info.announcement;
		document.getElementById("announcementIMG").src = store_info.announcementImg;
		//*This uploads SLIDE show images from FB----------------------------------------------------------------------
		const newSlideList = htmlToElement(' <div id="slideShowIMGContainer"></div>');
		//console.log(store_info.slideShow.length);
		this._slideShowLength = store_info.slideShow.length + 1;
		for (let i = 0; i < store_info.slideShow.length; i++) {

			const newSlide = this._createSlidePin(store_info.slideShow[i]);
			newSlide.onclick = (event) => {
				rhit.spManager.removeArray(rhit.STORE_KEY_SLIDE_SHOW, store_info.slideShow[i]);
			}
			newSlideList.appendChild(newSlide);
		}
		const oldSlideList = document.querySelector(`#slideShowIMGContainer`);
		oldSlideList.removeAttribute("id");
		oldSlideList.hidden = true;
		oldSlideList.parentElement.appendChild(newSlideList);
		//*----------------------------------------------------------------------------


		//* this uploads events from firebase---------------------------
		const newEventList = htmlToElement(`<div id="eventContainer"></div>`);
		//console.log(rhit.spManager._eventDocSnapshot);
		for (let i = 0; i < rhit.spManager.eventLength; i++) {
			const eventC = rhit.spManager.getEventAtIndex(i);
			const newEvent = this._createEventRow(eventC);
			const newEventBtn = htmlToElement(`<button type="button" class="btn btn-danger">Delete</button>`);
			newEventBtn.onclick = (event) => {
				rhit.spManager._deleteEvent(eventC.id);
				//console.log("Deleting event");
			}
			newEventList.appendChild(newEvent);
			newEventList.appendChild(newEventBtn);
			newEventList.appendChild(htmlToElement('<hr>'))
		}
		const oldEventList = document.querySelector(`#eventContainer`);
		oldEventList.removeAttribute("id");
		oldEventList.hidden = true;
		oldEventList.parentElement.appendChild(newEventList);
		//*----------------------------------



		//*This uploads emails----------------------------------------------------------------------
		const newEmailList = htmlToElement(' <div id="emailListContainer"></div>');
		//console.log(store_info.emailList.length);
		for (let i = 0; i < store_info.emailList.length; i++) {

			const newEmail = this._createEmail(store_info.emailList[i]);
			newEmail.onclick = (event) => {
				rhit.spManager.removeArray(rhit.STORE_KEY_EMAIL_LIST, store_info.emailList[i]);
			}
			newEmailList.appendChild(newEmail);

		}
		const oldList = document.querySelector(`#emailListContainer`);
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newEmailList);
		//*----------------------------------------------------------------------------



	}
	updateItemView() {
		//* this uploads items from firebase-------------------------------
		console.log(rhit.fbItemsManager.getItemAtIndex(0));
		console.log("update items called");
		const newItemsList = htmlToElement('<div id="itemContainer"></div>');
		console.log("items collection length: ", rhit.fbItemsManager.length);
		for (let i = 0; i < rhit.fbItemsManager.length; i++) {
			const item = rhit.fbItemsManager.getItemAtIndex(i);
			const newCard = this._createItem(item);
			const deleteCard = htmlToElement(`<a href="#" class="btn btn-primary">Delete</a>`);
			deleteCard.onclick = (event) => {
				rhit.fbItemsManager._deleteItem(item.id);
				console.log("Delete item");
			}
			newItemsList.appendChild(newCard);
			newItemsList.appendChild(deleteCard);
			newItemsList.appendChild(htmlToElement(`<hr>`));

		}
		const oldItemsList = document.querySelector("#itemContainer");
		console.log(newItemsList);
		oldItemsList.removeAttribute("id");
		oldItemsList.hidden = true;
		oldItemsList.parentElement.appendChild(newItemsList);
	}
	_createEmail(email) {

		return htmlToElement(
			`<div><button id="delete${email}" type="button" class="btn btn-dark">${email} - delete</button></div>`
		)
	}
	_createSlidePin(img) {

		return htmlToElement(
			`<div class="pin" style="width: 30%;">
			<img class="img-fluid" src="${img}" />
			<p style="text-align:center"> DELETE </p>
		  </div>`
		)
	}
	_createEventRow(eventItem) {
		return htmlToElement(`
		<div class ="row" style="margin-top: 10px;">
		<div class="col">
		${eventItem.name}
	  	</div>
	 	 <div class="col-5">
		${eventItem.location}
	 	 </div>
	  	<div class="col">
		${eventItem.date}
		 </div>
	 	 </div>
		 `)
	}
	_createItem(item) {
		//console.log("HEREEEEEEEEEEEEEEEE");
		return htmlToElement(`<div class="row">
              <div class="col">
                <img src="${item.image}" alt="product has no image" style="max-width: 10vw;">
              </div>
              <div class="col-5">
                <h5>${item.name}</h5>
              </div>
              <div class="col">
                <h5>${item.price}</h5>
              </div>
            </div>`);
	}
}
// ! ------------------------------Sign In Page Controller-------------------
rhit.SignInPageController = class {
	constructor() {
		rhit.spManager.beginListening(this.updateSignPageInfo.bind(this));
	}
	updateSignPageInfo() {
		const store_info = rhit.spManager.setStoreInfo();
		//console.log('typeof store_info :>> ', store_info.businessName);
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
		this._cart = new Array();
	}
	beginListening(changeListener) {
		console.log("listening ");
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;

			if (user) {
				this._email = user.email;
				console.log('user :>> ', this._email);
				if (this._email) {
					let documentRef = this._ref.doc(this._email);

					documentRef.onSnapshot((doc) => {
						if (doc.exists) {
							//console.log("document Exsists!");
							this._Admin = doc.data().isAdmin;
							console.log(doc.data());
							this._cart = doc.data().cart;
							////console.log('imageOwner :>> ', this.imageOwner);
						} else {
							//console.log("user is not yet created");
							this.addUser(this._email);
							//console.log("user created")
						}
					});
				} else {
					//console.log("User is anonymous");
				}

				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/firebase.User
				////console.log(`ID :>>`, user.uid);

				// ...
			} else {
				//console.log(`there is no user signed in`);
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
			[rhit.USERS_CART]: this._cart,
		}).catch((error) => {
			//console.log(`error writing document:`, error);
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
	removeCartArray(remove) {
		var ind = this._cart.indexOf(remove);
		this._cart.splice(ind, 1);
		//console.log("removing email List");
		//console.log(remove);
		this._ref.doc(this._email).update({
			["cart"]: firebase.firestore.FieldValue.arrayRemove(remove)
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});


	}
	addCartArray(item) {
		if (this._cart.indexOf(item) == -1) {
			this._cart.push(item);
		}

		console.log(item, "Being added to", this._user);
		this._ref.doc(this._email).update({
			["cart"]: firebase.firestore.FieldValue.arrayUnion(item)
		}).catch((error) => {
			//console.log(`error writing document:`, error);
		});

	}
	getCart() {
		console.log(this._cart);
		return this._cart;



	}
}
// !-----------------------------Item ------------------------
rhit.Item = class {
	constructor(id, available, image, name, handmade, price, description) {
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
		this._tempImage = null;
	}
	add(name, handmade, price, description) {
		var image = "";
		if (this._tempImage != null) {

			const storageREF = firebase.storage().ref().child(`${this._tempImage.name}Item`);
			storageREF.put(this._tempImage).then((uploadTaskSnapshot) => {
				//console.log("the file has been uploaded");
				storageREF.getDownloadURL().then((downloadURL) => {
					//console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
					image = downloadURL;
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
					console.log(downloadURL);
					console.log(image);
					//rhit.spManager.updateString(rhit.STORE_KEY_ANNOUNCEMENT_IMG, downloadURL);

				})
			});

		} else {
			this.ref.add({
				["price"]: price,
				["image"]: "",
				["name"]: name,
				["handmade"]: handmade,
				["available"]: true,
				["numSales"]: 0,
				["numGifted"]: 0,
				["description"]: description,
				["addedDate"]: firebase.firestore.Timestamp.now(),
			});

		};

		this._tempImage = null;
	}
	_setTempImage(pointer) {
		console.log("hereeeeeeeeeeeeee");
		this._tempImage = pointer;
	}

	beginListening(changeListener) {
		//console.log("listening to items manager");
		let query = this.ref.orderBy("addedDate", "desc")
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log(this._documentSnapshots);
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	_deleteItem(id) {
		this.ref.doc(id).delete()
			.then(function () {
				//console.log("doc deleted");
				//window.location.href = "/list.html";
			})
			.catch(function (error) {});

	}

	getItemAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const item = new rhit.Item(docSnapshot.id, docSnapshot.get("available"), docSnapshot.get("image"), docSnapshot.get("name"), docSnapshot.get("handmade"), docSnapshot.get("price"), docSnapshot.get("description"));
		return item;
	}
	getItemAtId(identification) {
		console.log(this._documentSnapshots);
		for (let i = 0; i < this._documentSnapshots.length; i++) {
			var doc = this._documentSnapshots[i];
			if (doc.id == identification) {
				return new rhit.Item(doc.id, doc.get("available"), doc.get("image"), doc.get("name"), doc.get("handmade"), doc.get("price"), doc.get("description"));

			}
		}
	}

}
// !-----------------------------Cart Page Controller ------------------------
rhit.CartPageController = class {
	constructor() {

		// document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
		//     //console.log("Show all quotes");
		//     window.location.href = "/list.html";
		// });

		// document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
		//     //console.log("Show my quotes");
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
		//console.log("i need to update");
		//console.log("num quotes = ", rhit.fbMovieQuotesManager.length);
		//console.log("ex quote: ", rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

		//make a new quoteListContainer
		const newList = htmlToElement('<div id="quoteListContainer"></div>');
		//fill with cards
		for (let i = 0; i < rhit.fbMovieQuotesManager.length; i++) {
			const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
			const newCard = this._createCard(mq);

			newCard.onclick = (event) => {
				// //console.log(`You clicked on ${mq.id}`);
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
	//console.log("-----intializing-------");
	rhit.spManager = new rhit.SPManager();
	rhit.spManager.beginListening(() => {
		//console.log("updating store info on all pages");
		rhit.storeNavUpdate = new rhit.StoreNavUpdate();

	});
	rhit.fbItemsManager = new rhit.FbItemsManager();
	rhit.fbItemsManager.beginListening(() => {
		//console.log("updating store items");
		//rhit.storeNavUpdate = new rhit.StoreNavUpdate();

	});
	if (document.querySelector("#signInPage")) {
		////console.log("On the login page");
		rhit.startFirebaseUI();

		new rhit.SignInPageController();
	}
	if (document.querySelector("#storePage")) {
		////console.log("On the login page");
		rhit.fbItemsManager = new rhit.FbItemsManager();
		new rhit.StorePageController();
	}
	if (document.querySelector("#adminPage")) {
		////console.log("On the login page");
		new rhit.AdminPageController();
	}

	// if (document.querySelector("#cartPage")) {
	// 	rhit.spManager = new rhit.SPManager();
	// 	new rhit.StorePageController();
	// }


}
//! ------------------Main -----------------/
/** function and class syntax examples */
rhit.main = function () {
	//console.log("Ready4");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		//console.log(`The auth state has changed.   isSignedIn = ${rhit.fbAuthManager.isSignedIn}`);
		rhit.initializePage()
	})


};

rhit.startFirebaseUI = function () {
	//console.log("firebaseUI building");
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
