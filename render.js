--- START OF FILE render.js ---

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7aI4WnfBagNk_PBg9LA49s79WzMQ7N8g",
  authDomain: "memepage-3d626.firebaseapp.com",
  projectId: "memepage-3d626",
  storageBucket: "memepage-3d626.firebasestorage.app",
  messagingSenderId: "1034023281600",
  appId: "1:1034023281600:web:eb34e7bc2089c62d665e25",
  measurementId: "G-K8VTWD9EXV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", async () => {
    const landingPage = document.getElementById("landingPage");
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (!hash) {
        landingPage.innerHTML = `<div class="content"><h1>Error: Invalid URL. Please generate a new page from the index page.</h1></div>`;
        return;
    }

    try {
        const doc = await db.collection("memePages").doc(hash).get();
        if (!doc.exists) {
            landingPage.innerHTML = `<div class="content"><h1>Error: Page not found. Please generate a new page from the index page.</h1></div>`;
             return;
        }
        const data = doc.data();
        const htmlContent = data.htmlContent;

        landingPage.innerHTML = htmlContent;


    } catch(error){
        console.error("Error fetching document:", error);
        landingPage.innerHTML = `<div class="content"><h1>Error: Failed to load the page data. Please try again or generate a new page.</h1></div>`;
    }
});
