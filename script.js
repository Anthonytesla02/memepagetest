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

const mistralApiKey = 'YOUR_MISTRAL_API_KEY'; // Replace with your actual Mistral API key

async function generateLandingPageContent(formData) {
    const prompt = `Generate HTML content for a meme coin landing page with the following details:\n\n
    Token Name: ${formData.tokenName}\n
    Ticker: ${formData.ticker}\n
    Twitter URL: ${formData.twitter || 'N/A'}\n
    Telegram URL: ${formData.telegram || 'N/A'}\n
    Website URL: ${formData.website || 'N/A'}\n
    Background: ${formData.background || '#f9f9f9'}\n
    Logo URL: ${formData.logo || 'default-logo.png'}\n\n

    Include a header with the token name and ticker, social media links, and a brief description. The HTML should be styled with inline CSS for basic layout and appearance. Ensure the response is a complete, valid HTML snippet that can be inserted into the body of an HTML document.`;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralApiKey}`
            },
            body: JSON.stringify({
                model: "mistral-medium",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            console.error("Mistral API error:", response.status, await response.text());
            return null;
        }

        const data = await response.json();
        console.log("Mistral API response:", data);

        // Extract the generated HTML content from the Mistral API response
        const generatedHTML = data.choices[0].message.content;
        return generatedHTML;

    } catch (error) {
        console.error("Error generating content with Mistral API:", error);
        return null;
    }
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

    const generatedHTML = await generateLandingPageContent(formData);

    if (!generatedHTML) {
        alert("Failed to generate landing page content.");
        generateBtn.disabled = false;
        generateBtn.classList.remove("loading");
        generateBtn.innerHTML = "Generate Page";
        return;
    }

    // Save the generated HTML to Firestore
     const docRef = await db.collection("memePages").add({ htmlContent: generatedHTML });
      const shortId = docRef.id;
     const shortURL = `${BASE_URL}generated.html#${shortId}`;

    // Remove loading state
    generateBtn.disabled = false; // enable the generate button
    generateBtn.classList.remove("loading");
    generateBtn.innerHTML = "Generate Page";

   //show the redirect modal
     showUpgradeModal(shortId, shortURL);
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
