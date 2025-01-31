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
const storage = firebase.storage();


const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dn5qjgaio/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'memepage-generator';
const BASE_URL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

const generateBtn = document.getElementById("generateBtn");
const buyMeACoffeeProductID = '364445'; // Replace with the actual product ID
const geminiAPIKey = 'AIzaSyArUInov5_tbl5dudWfnAvPoswDHxH7gws';  //Replace with your Gemini API key

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
    };
     try {
         const generatedHTML = await generateLandingPageHTML(formData);
          if(!generatedHTML)
          {
              alert("Failed to generate landing page.");
             generateBtn.disabled = false;
             generateBtn.classList.remove("loading");
             generateBtn.innerHTML = "Generate Page";
             return;

          }
           const docRef = await db.collection("memePages").add(formData);
           const shortId = docRef.id;
           const shortURL = `${BASE_URL}generated.html#${shortId}`;

           // Save the generated HTML to Firebase Storage
           await saveHTMLToStorage(generatedHTML, shortId);
            // Remove loading state
           generateBtn.disabled = false;
           generateBtn.classList.remove("loading");
           generateBtn.innerHTML = "Generate Page";

          //show the redirect modal
           showUpgradeModal(shortId, shortURL);

     } catch (error) {
        console.error("Error:", error);
        alert("Failed to generate page. Please try again.");
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


// --- Gemini Functionality ---
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateLandingPageHTML(formData) {
  const genAI = new GoogleGenerativeAI(geminiAPIKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = `
        Generate a modern, beautiful, high-quality HTML landing page for a meme coin based on the following data. Use Tailwind CSS for styling and ensure the page is responsive.
        The landing page should have a hero section, a features section, a tokenomics section, and a how-to-buy section.
        Make use of a countdown timer on the header
        Ensure the page contains appropriate image tags.
        Here's the meme coin data:
        Token Name: ${formData.tokenName}
        Ticker: ${formData.ticker}
        Twitter: ${formData.twitter}
        Telegram: ${formData.telegram}
        Website: ${formData.website}
        Background: ${formData.background}
        Logo URL: ${formData.logo || 'default-logo.png'}

        Here is an example html page:
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DogeInu - The Next Big Meme Coin</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                .hero-bg { background: linear-gradient(45deg, #667eea, #764ba2); }
                .coin-symbol { text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .bouncing { animation: bounce 2s infinite; }
            </style>
        </head>
        <body class="bg-gray-100">
            <!-- Hero Section -->
            <header class="hero-bg text-white py-20 px-4">
                <div class="container mx-auto text-center">
                    <img src="https://abc.com" alt="DogeInu Logo"
                         class="bouncing h-32 w-32 mx-auto mb-6 rounded-full border-4 border-white shadow-lg">
                    <h1 class="text-5xl font-bold mb-4 coin-symbol">DOGE</h1>
                    <p class="text-xl mb-8">Decentralized network
    Low network fees
    High volatility </p>
                    <div class="flex justify-center space-x-4 mb-8">
                        <a href="#buy" class="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition">
                            Buy Now 🚀
                        </a>
                        <a href="#whitepaper" class="border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-indigo-600 transition">
                            Whitepaper 📄
                        </a>
                    </div>
                    <div id="countdown" class="text-2xl font-mono"></div>
                </div>
            </header>

            <!-- Features Section -->
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                    <div class="text-center p-6 hover:bg-gray-50 rounded-lg transition">
                        <div class="text-4xl mb-4">🔥</div>
                        <h3 class="text-xl font-bold mb-2">Deflationary Mechanism</h3>
                        <p>Automatic burns with every transaction</p>
                    </div>
                    <div class="text-center p-6 hover:bg-gray-50 rounded-lg transition">
                        <div class="text-4xl mb-4">🛡️</div>
                        <h3 class="text-xl font-bold mb-2">100% Safe</h3>
                        <p>Liquidity locked for 1 year</p>
                    </div>
                    <div class="text-center p-6 hover:bg-gray-50 rounded-lg transition">
                        <div class="text-4xl mb-4">🌐</div>
                        <h3 class="text-xl font-bold mb-2">Community Driven</h3>
                        <p>Fully decentralized governance</p>
                    </div>
                </div>
            </section>

            <!-- Tokenomics Section -->
            <section class="py-16 bg-gray-50">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-center mb-8">Tokenomics 💰</h2>
                    <div class="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-md">
                        <div class="flex justify-between mb-4">
                            <span>Total Supply:</span>
                            <span class="font-semibold">1000000000 DOGE</span>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Presale</span>
                                <span>40%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Liquidity</span>
                                <span>30%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Marketing</span>
                                <span>20%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Team</span>
                                <span>10%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How to Buy Section -->
            <section class="py-16 bg-white" id="buy">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-center mb-8">How to Buy 📈</h2>
                    <div class="max-w-3xl mx-auto space-y-6">
                        <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div class="text-2xl mr-4">1</div>
                            <div>
                                <h3 class="font-bold mb-2">Create Wallet</h3>
                                <p>Download MetaMask or Trust Wallet</p>
                            </div>
                        </div>
                        <!-- Add more steps here -->
                    </div>
                </div>
            </section>

            <script>
                // Countdown Timer
                const countDownDate = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                const timer = setInterval(() => {
                    const now = new Date().getTime();
                    const distance = countDownDate - now;

                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    document.getElementById('countdown').innerHTML = `⏳ Launch in: ${days}d ${hours}h ${minutes}m ${seconds}s`;

                    if (distance < 0) {
                        clearInterval(timer);
                        document.getElementById('countdown').innerHTML = "🚀 LAUNCHED!";
                    }
                }, 1000);
            </script>
        </body>
        </html>
    `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const htmlContent = response.text();
    return htmlContent;
  } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
  }
}

async function saveHTMLToStorage(htmlContent, documentId) {
    const storageRef = storage.ref();
     const htmlFileRef = storageRef.child(`memePages/${documentId}.html`); // Use documentId to name HTML file.
     try {
        await htmlFileRef.putString(htmlContent, 'text/html');
        console.log("HTML saved to Firebase Storage")
     } catch (error) {
       console.error("Error saving html file to firebase", error);
     }
}
