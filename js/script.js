// Firebase Imports (Keep these at the top of your JS file if you need them)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let app;
let db;
let auth;
let userId = 'anonymous';

// Firebase configuration and initialization (from environment variables)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; 

if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            console.log("Firebase user signed in:", userId);
        } else {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase authentication error:", error);
            }
        }
    });
} else {
    console.warn("Firebase config not found. Firebase services will not be initialized.");
}

// Gemini API Configuration
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// AI Assistant Elements
const recommendationInput = document.getElementById('recommendationInput');
const getRecommendationBtn = document.getElementById('getRecommendationBtn');
const recommendationOutput = document.getElementById('recommendationOutput');

const termInput = document.getElementById('termInput');
const explainTermBtn = document.getElementById('explainTermBtn');
const explanationOutput = document.getElementById('explanationOutput');

const scenarioInput = document.getElementById('scenarioInput');
const getScenarioAnalysisBtn = document.getElementById('getScenarioAnalysisBtn');
const scenarioOutput = document.getElementById('scenarioOutput');

// User Registration Elements
const radioRegister = document.getElementById('radioRegister');
const radioLogin = document.getElementById('radioLogin');
const radioGuest = document.getElementById('radioGuest');

const registerFields = document.getElementById('registerFields');
const loginFields = document.getElementById('loginFields');
const guestFields = document.getElementById('guestFields');
const forgotPasswordFields = document.getElementById('forgotPasswordFields');
const authMessage = document.getElementById('authMessage');

const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const registerBtn = document.getElementById('registerBtn');
const registerGmailBtn = document.getElementById('registerGmailBtn');

const loginUsernameEmail = document.getElementById('loginUsernameEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

const guestUsername = document.getElementById('guestUsername');
const guestOkBtn = document.getElementById('guestOkBtn');

const forgotPasswordEmail = document.getElementById('forgotPasswordEmail');
const forgotPasswordOkBtn = document.getElementById('forgotPasswordOkBtn');
const backToLoginFromForgot = document.getElementById('backToLoginFromForgot');

// Error Spans
const regUsernameError = document.getElementById('regUsernameError');
const regEmailError = document.getElementById('regEmailError');
const regPasswordError = document.getElementById('regPasswordError');
const regConfirmPasswordError = document.getElementById('regConfirmPasswordError');
const guestUsernameError = document.getElementById('guestUsernameError');
const loginUsernameEmailError = document.getElementById('loginUsernameEmailError');
const loginPasswordError = document.getElementById('loginPasswordError');
const forgotPasswordError = document.getElementById('forgotPasswordError');

/**
 * Clears all authentication-related error messages.
 */
function clearAuthErrors() {
    authMessage.classList.add('hidden');
    regUsernameError.classList.add('hidden');
    regEmailError.classList.add('hidden');
    regPasswordError.classList.add('hidden');
    regConfirmPasswordError.classList.add('hidden');
    guestUsernameError.classList.add('hidden');
    loginUsernameEmailError.classList.add('hidden');
    loginPasswordError.classList.add('hidden');
    forgotPasswordError.classList.add('hidden');
}

/**
 * Clears all input fields in the authentication module.
 */
function clearAuthFields() {
    regUsername.value = '';
    regEmail.value = '';
    regPassword.value = '';
    regConfirmPassword.value = '';
    guestUsername.value = '';
    loginUsernameEmail.value = '';
    loginPassword.value = '';
    forgotPasswordEmail.value = '';
}

/**
 * Calls the Gemini API with a given prompt and returns the response.
 * @param {string} promptText The text prompt to send to the LLM.
 * @returns {Promise<string>} The generated text from the LLM.
 */
async function callGeminiAPI(promptText) {
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: promptText }] });

    const payload = {
        contents: chatHistory
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", result);
            return "Sorry, I couldn't generate a response. Please try again.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while connecting to the AI. Please try again later.";
    }
}

// --- AI Assistant Feature: Personalized Plan Recommendation ---
getRecommendationBtn.addEventListener('click', async () => {
    const userNeeds = recommendationInput.value.trim();
    if (userNeeds === "") {
        recommendationOutput.classList.remove('hidden');
        recommendationOutput.className = 'mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-left text-red-800';
        recommendationOutput.innerHTML = '<p>Please describe your insurance needs.</p>';
        return;
    }

    recommendationOutput.classList.remove('hidden');
    recommendationOutput.className = 'mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg text-left text-gray-800';
    recommendationOutput.innerHTML = '<p class="text-gray-600 italic">Thinking...</p>'; // Show loading indicator

    const prompt = `Based on the following needs, suggest suitable insurance plan types (e.g., Health, Life, Auto, Home) and briefly explain why each is relevant. Also, suggest one or two common features to look for in such plans.
    User needs: "${userNeeds}"
    Format your response as a clear, concise recommendation.`;

    const responseText = await callGeminiAPI(prompt);
    recommendationOutput.innerHTML = `<p>${responseText}</p>`;
});

// --- AI Assistant Feature: Coverage Term Explainer ---
explainTermBtn.addEventListener('click', async () => {
    const termToExplain = termInput.value.trim();
    if (termToExplain === "") {
        explanationOutput.classList.remove('hidden');
        explanationOutput.className = 'mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-left text-red-800';
        explanationOutput.innerHTML = '<p>Please enter an insurance term to explain.</p>';
        return;
    }

    explanationOutput.classList.remove('hidden');
    explanationOutput.className = 'mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-left text-gray-800';
    explanationOutput.innerHTML = '<p class="text-gray-600 italic">Thinking...</p>'; // Show loading indicator

    const prompt = `Explain the insurance term "${termToExplain}" in simple, easy-to-understand language, avoiding jargon as much as possible. Provide a brief example if applicable.`;

    const responseText = await callGeminiAPI(prompt);
    explanationOutput.innerHTML = `<p>${responseText}</p>`;
});

// --- NEW AI Assistant Feature: What If Scenario Planner ---
getScenarioAnalysisBtn.addEventListener('click', async () => {
    const userScenario = scenarioInput.value.trim();
    if (userScenario === "") {
        scenarioOutput.classList.remove('hidden');
        scenarioOutput.className = 'mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-left text-red-800';
        scenarioOutput.innerHTML = '<p>Please describe a "what if" scenario.</p>';
        return;
    }

    scenarioOutput.classList.remove('hidden');
    scenarioOutput.className = 'mt-6 p-4 bg-purple-100 border border-purple-300 rounded-lg text-left text-gray-800';
    scenarioOutput.innerHTML = '<p class="text-gray-600 italic">Thinking...</p>'; // Show loading indicator

    const prompt = `Consider the following hypothetical situation related to insurance: "${userScenario}". Describe the potential financial consequences for an individual or entity if they are *not* adequately insured for this scenario. Then, briefly suggest the type(s) of insurance that *would* mitigate these risks. Keep the explanation concise and clear.`;

    const responseText = await callGeminiAPI(prompt);
    scenarioOutput.innerHTML = `<p>${responseText}</p>`;
});


// --- User Registration Module Logic ---
// Event listeners for radio buttons to switch forms
radioRegister.addEventListener('change', () => {
    clearAuthErrors();
    clearAuthFields();
    registerFields.classList.remove('hidden');
    loginFields.classList.add('hidden');
    guestFields.classList.add('hidden');
    forgotPasswordFields.classList.add('hidden'); // Hide forgot password
});

radioLogin.addEventListener('change', () => {
    clearAuthErrors();
    clearAuthFields();
    registerFields.classList.add('hidden');
    loginFields.classList.remove('hidden');
    guestFields.classList.add('hidden');
    forgotPasswordFields.classList.add('hidden'); // Hide forgot password
});

radioGuest.addEventListener('change', () => {
    clearAuthErrors();
    clearAuthFields();
    registerFields.classList.add('hidden');
    loginFields.classList.add('hidden');
    guestFields.classList.remove('hidden');
    forgotPasswordFields.classList.add('hidden'); // Hide forgot password
});

guestOkBtn.addEventListener('click', () => {
    const username = guestUsername.value.trim();
    clearAuthErrors(); // Clear all errors before displaying a new one

    if (username === "") {
        guestUsernameError.classList.remove('hidden');
        guestUsernameError.textContent = 'Please Enter User Name';
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
        authMessage.innerHTML = 'Guest login failed: Username is mandatory.';
    } else {
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
        authMessage.innerHTML = `Welcome, ${username}! You are logged in as a Guest.`;
        guestUsername.value = '';
    }
});

registerBtn.addEventListener('click', () => {
    let isValid = true;
    clearAuthErrors(); // Clear all errors before re-validating
    
    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const confirmPassword = regConfirmPassword.value.trim();

    if (username === "") {
        regUsernameError.classList.remove('hidden');
        regUsernameError.textContent = 'Please Enter User Name';
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email === "") {
        regEmailError.classList.remove('hidden');
        regEmailError.textContent = 'Please Enter Valid Email';
        isValid = false;
    } else if (!emailPattern.test(email)) {
        regEmailError.classList.remove('hidden');
        regEmailError.textContent = 'Please Enter Valid Email (e.g., user@domain.com)';
        isValid = false;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
    if (password === "") {
        regPasswordError.classList.remove('hidden');
        regPasswordError.textContent = 'Please Enter Password';
        isValid = false;
    } else if (!passwordPattern.test(password)) {
        regPasswordError.classList.remove('hidden');
        regPasswordError.textContent = 'Password must be 8-16 chars, include an uppercase letter, a number, and a special symbol.';
        isValid = false;
    }

    if (confirmPassword === "") {
        regConfirmPasswordError.classList.remove('hidden');
        regConfirmPasswordError.textContent = 'Please confirm your password.';
        isValid = false;
    } else if (password !== confirmPassword) {
        regConfirmPasswordError.classList.remove('hidden');
        regConfirmPasswordError.textContent = 'Confirm Password should match with Password field.';
        isValid = false;
    }

    if (isValid) {
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
        authMessage.innerHTML = `Registration successful for ${username}!`;
        clearAuthFields();
    } else {
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
        authMessage.innerHTML = 'Please fix the errors above to register.';
    }
});

registerGmailBtn.addEventListener('click', () => {
    clearAuthErrors();
    authMessage.classList.remove('hidden');
    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-blue-100 text-blue-800 border border-blue-300';
    authMessage.innerHTML = 'Redirecting to Gmail for registration... (Feature under development)';
    clearAuthFields();
});

// Login button logic (basic validation)
loginBtn.addEventListener('click', () => {
    let isValid = true;
    clearAuthErrors();

    const usernameEmail = loginUsernameEmail.value.trim();
    const password = loginPassword.value.trim();

    if (usernameEmail === "") {
        loginUsernameEmailError.classList.remove('hidden');
        loginUsernameEmailError.textContent = 'Please enter your username or email.';
        isValid = false;
    }
    if (password === "") {
        loginPasswordError.classList.remove('hidden');
        loginPasswordError.textContent = 'Please enter your password.';
        isValid = false;
    }

    if (isValid) {
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
        authMessage.innerHTML = `Login attempt for ${usernameEmail}... (Authentication logic would go here)`;
        clearAuthFields();
    } else {
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
        authMessage.innerHTML = 'Please fill in both fields to log in.';
    }
});

// Forgot Password Link functionality - Now shows a new frame
forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    clearAuthErrors();
    clearAuthFields(); // Clear all fields
    
    // Hide all other forms and show forgot password form
    registerFields.classList.add('hidden');
    loginFields.classList.add('hidden');
    guestFields.classList.add('hidden');
    forgotPasswordFields.classList.remove('hidden');
    
    authMessage.classList.remove('hidden');
    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-blue-100 text-blue-800 border border-blue-300';
    authMessage.innerHTML = 'Please enter your registered email to reset your password.';
});

// Forgot Password OK button logic
forgotPasswordOkBtn.addEventListener('click', () => {
    const email = forgotPasswordEmail.value.trim();
    clearAuthErrors(); // Clear errors

    if (email === "") {
        forgotPasswordError.classList.remove('hidden');
        forgotPasswordError.textContent = 'Please Enter Registered Valid Email';
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
        authMessage.innerHTML = 'Password reset failed: Email is mandatory.';
    } else {
        // In a real app, send email to backend for password reset
        authMessage.classList.remove('hidden');
        authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
        authMessage.innerHTML = `If ${email} is a registered email, a password reset link has been sent.`;
        forgotPasswordEmail.value = ''; // Clear email field after submission
    }
});

// Back to Login button from Forgot Password frame
backToLoginFromForgot.addEventListener('click', () => {
    clearAuthErrors();
    clearAuthFields();
    forgotPasswordFields.classList.add('hidden');
    loginFields.classList.remove('hidden'); // Go back to login form
    radioLogin.checked = true; // Set login radio button as checked
});

// Initial state setup for the module
document.addEventListener('DOMContentLoaded', () => {
    // Ensure only register fields are shown on initial load, and others are hidden
    radioRegister.checked = true;
    registerFields.classList.remove('hidden');
    loginFields.classList.add('hidden');
    guestFields.classList.add('hidden');
    forgotPasswordFields.classList.add('hidden'); // Ensure this is hidden initially
});
