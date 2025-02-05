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

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dn5qjgaio/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'memepage-generator';
const BASE_URL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

const generateBtn = document.getElementById("generateBtn");
const buyMeACoffeeProductID = '364445'; // Replace with the actual product ID

// Function to show the modal with redirect button
function showUpgradeModal(redirectURL, shortURL) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Upgrade Your Account</h2>
            <p>To generate your meme coin landing page, please purchase the product below.</p>
             <a href="https://www.buymeacoffee.com/memepage/e/${buyMeACoffeeProductID}" target="_blank" class="publish-button">Redirect to Buy Me a Coffee</a>
        </div>
    `;
    document.body.appendChild(modal);
        localStorage.setItem('redirectURL', shortURL);

}


generateBtn.addEventListener("click", async () => {
    // Disable the button and add a loading class
    generateBtn.disabled = true;
    generateBtn.classList.add("loading");
    generateBtn.innerHTML = "Generating...";


    const tokenName = document.getElementById("tokenName").value.trim();
    const ticker = document.getElementById("ticker").value.trim();
    const twitter = document.getElementById("twitter").value.trim();
    const telegram = document.getElementById("telegram").value.trim();
    const website = document.getElementById("website").value.trim();
    const background = document.getElementById("background").value.trim();
    const logoInput = document.getElementById("logo");

    if (!tokenName || !ticker) {
        alert("Please fill out both Token Name and Ticker.");
        generateBtn.disabled = false; // enable the generate button
        generateBtn.classList.remove("loading");
        generateBtn.innerHTML = "Generate Page";
        return;
    }

    if (ticker.length > 5) {
        alert("Ticker should not exceed 5 characters.");
        generateBtn.disabled = false; // enable the generate button
        generateBtn.classList.remove("loading");
         generateBtn.innerHTML = "Generate Page";
        return;
    }

    let logoURL = null;
    if (logoInput.files && logoInput.files[0]) {
        const file = logoInput.files[0];
        logoURL = await uploadImageToCloudinary(file);
        if (!logoURL) {
            alert("Failed to upload image to Cloudinary.");
            generateBtn.disabled = false; // enable the generate button
            generateBtn.classList.remove("loading");
            generateBtn.innerHTML = "Generate Page";
            return;
        }
    }

      const formData = {
          tokenName,
          ticker,
          twitter,
          telegram,
          website,
          background,
          logo: logoURL
      }

    try {
        // *** AI INTEGRATION STARTS HERE ***
        const generatedHTML = await generateLandingPageHTML(formData);

        if (!generatedHTML) {
            throw new Error("Failed to generate landing page HTML from AI.");
        }

        const docRef = await db.collection("memePages").add({ html: generatedHTML }); // Store the complete HTML
        const shortId = docRef.id;
        const shortURL = `${BASE_URL}generated.html#${shortId}`;

        // Remove loading state
        generateBtn.disabled = false; // enable the generate button
        generateBtn.classList.remove("loading");
        generateBtn.innerHTML = "Generate Page";

        //show the redirect modal
        showUpgradeModal(shortId, shortURL);

    } catch (error) {
        console.error("Error generating page:", error);
        alert("Failed to generate page. Please try again later.");
        generateBtn.disabled = false;
        generateBtn.classList.remove("loading");
        generateBtn.innerHTML = "Generate Page";
    }
});

async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            return data.secure_url;
        } else {
            console.error("Cloudinary upload failed:", response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
}


// Check for payment success
document.addEventListener('DOMContentLoaded', function() {
    const redirectURL = localStorage.getItem('redirectURL');
   if (redirectURL && document.referrer.includes('buymeacoffee')) {
       window.location.href = redirectURL;
        localStorage.removeItem('redirectURL');
    }
});


// ********** AI FUNCTION **************
async function generateLandingPageHTML(formData) {
  // Replace with your actual AI API endpoint and API key
  const AI_API_ENDPOINT = "YOUR_AI_API_ENDPOINT";
  const AI_API_KEY = "YOUR_AI_API_KEY";

  try {
      const response = await fetch(AI_API_ENDPOINT, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AI_API_KEY}` // If your API requires authorization
          },
          body: JSON.stringify({
              prompt: `Generate a high-quality, Tailwind CSS based meme coin landing page similar to test1.html, but tailored to these details: ${JSON.stringify(formData)}.  
                       The landing page should be visually appealing, persuasive, and mobile-responsive. Use the logo URL if provided, and the background color or image if provided. Focus on a clean, modern design. The generated output must be complete HTML page.`,
              // You can add more parameters based on your API's requirements, like model, temperature, max_tokens, etc.
          }),
      });

      if (!response.ok) {
          console.error("AI API Error:", response.status, await response.text());
          return null;
      }

      const data = await response.json();

      // Assuming the AI returns the HTML in a field called "html" or "content"
      const generatedHTML = data.html || data.content;
      return generatedHTML;

  } catch (error) {
      console.error("Error calling AI API:", error);
      return null;
  }
}
