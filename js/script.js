// script.js

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
const API_KEY = ""; // Leave this empty. Canvas will provide it at runtime.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Helper function to get the base URL for redirection
function getBaseUrl() {
    const path = window.location.pathname;
    const lastSlashIndex = path.lastIndexOf('/');
    // If the path ends with a filename (e.g., /repo/index.html), get the directory part
    // Otherwise (e.g., /repo/), the path itself is the base
    if (lastSlashIndex > path.lastIndexOf('.')) {
        return window.location.origin + path.substring(0, lastSlashIndex + 1);
    } else {
        return window.location.origin + path;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // --- Common Elements & Logic Across Pages ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser'); // Clear logged-in state
            localStorage.removeItem('registeredEmail'); // Clear mock registered email
            localStorage.removeItem('registeredFullName'); // Clear mock registered full name
            localStorage.removeItem('authToken'); // Clear Firebase dummy token
            localStorage.removeItem('username'); // Clear Firebase dummy username
            window.location.href = getBaseUrl() + 'index.html'; // Redirect to home/registration page
        });
    }

    // --- Logic for index.html (Main Landing, Registration & Login) ---
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

    // User Registration Elements (these are only on index.html, but the script is shared)
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
    const passwordStrength = document.getElementById('passwordStrength'); 

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

    // Elements for page switching and account dashboard
    const mainContentSection = document.getElementById('mainContent'); // The main marketing content
    const userRegistrationPage = document.getElementById('user-registration-page'); // This is the separate registration page section

    // Header Login/Register buttons (present on both index.html and plans.html)
    const headerLoginBtn = document.getElementById('loginBtnHeader');
    const headerRegisterBtn = document.getElementById('registerBtnHeader');

    const myAccountDashboard = document.getElementById('myAccountDashboard');
    const loggedInUsernameSpan = document.getElementById('loggedInUsername');
    const signOutBtn = document.getElementById('signOutBtn');
    const authFormsContainer = document.getElementById('authFormsContainer'); 

    // Navigation links from index.html header
    const navHomeLinkIndex = document.getElementById('navHomeLinkIndex');
    const navPlansLinkIndex = document.getElementById('navPlansLinkIndex');
    const navAIAssistantLinkIndex = document.getElementById('navAIAssistantLinkIndex');
    const navWhyChooseUsLinkIndex = document.getElementById('navWhyChooseUsLinkIndex');
    const navAboutLinkIndex = document.getElementById('navAboutLinkIndex');
    const navContactLinkIndex = document.getElementById('navContactLinkIndex');

    // Button in index.html hero section
    const heroGetQuoteLink = document.getElementById('heroGetQuoteLink'); // This is an <a> tag
    const explorePlansBtn = document.getElementById('explorePlansBtn'); // This is a <button>

    // Navigation links from plans.html header
    const navHomeLinkPlans = document.getElementById('navHomeLinkPlans');
    const navPlansLinkPlans = document.getElementById('navPlansLinkPlans'); // The 'Plans' link on plans.html itself
    
    // "Back to Main Website" button on plans.html footer
    const backToMainWebsiteBtnPlans = document.getElementById('backToMainWebsiteBtnPlans');
    
    // "Back to Main Website" button on index.html auth page
    const backToMainWebsiteBtnAuthPage = document.getElementById('backToMainWebsiteBtnAuthPage');

    // "Learn More" buttons on plans.html that link to sections on index.html
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    // "Back to Plans Overview" buttons on index.html (for detailed sections)
    const backToPlansPageBtns = document.querySelectorAll('.back-to-plans-page-btn');


    /**
     * Hides all main content sections on index.html.
     * This is used when navigating to a detail page.
     */
    function hideAllMainContentSections() {
        const sectionsToHide = [
            document.querySelector('.bg-gradient-to-r.from-blue-600'), // Hero
            document.querySelector('.py-12.bg-gray-100.rounded-lg.mx-4.mt-8.shadow-md.text-center'), // Trust Bar
            document.getElementById('why-choose-us'),
            document.getElementById('ai-assistant'),
            document.querySelector('.py-16.bg-blue-700'), // Testimonials
            document.getElementById('about'),
            document.getElementById('contact')
        ];
        sectionsToHide.forEach(section => {
            if (section) {
                section.classList.add('hidden');
            }
        });
    }

    /**
     * Shows all primary main content sections on index.html.
     * Used when returning from a detail page or starting on index.html.
     */
    function showAllMainContentSections() {
        const sectionsToShow = [
            document.querySelector('.bg-gradient-to-r.from-blue-600'), // Hero
            document.querySelector('.py-12.bg-gray-100.rounded-lg.mx-4.mt-8.shadow-md.text-center'), // Trust Bar
            document.getElementById('why-choose-us'),
            document.getElementById('ai-assistant'),
            document.querySelector('.py-16.bg-blue-700'), // Testimonials
            document.getElementById('about'),
            document.getElementById('contact')
        ];
        sectionsToShow.forEach(section => {
            if (section) {
                section.classList.remove('hidden');
            }
        });
        // Ensure detail sections are hidden when showing main content
        const detailSections = document.querySelectorAll('[id$="-details"]');
        detailSections.forEach(section => section.classList.add('hidden'));
    }


    /**
     * Clears all authentication-related error messages.
     */
    function clearAuthErrors() {
        if (authMessage) authMessage.classList.add('hidden');
        if (regUsernameError) regUsernameError.classList.add('hidden');
        if (regEmailError) regEmailError.classList.add('hidden');
        if (regPasswordError) regPasswordError.classList.add('hidden');
        if (regConfirmPasswordError) regConfirmPasswordError.classList.add('hidden');
        if (guestUsernameError) guestUsernameError.classList.add('hidden');
        if (loginUsernameEmailError) loginUsernameEmailError.classList.add('hidden');
        if (loginPasswordError) loginPasswordError.classList.add('hidden');
        if (forgotPasswordError) forgotPasswordError.classList.add('hidden');
        if (passwordStrength) {
            passwordStrength.textContent = ''; // Clear password strength message
            passwordStrength.className = 'text-xs mt-1 text-gray-500'; // Reset class
        }
    }

    /**
     * Clears all input fields in the authentication module.
     */
    function clearAuthFields() {
        if (regUsername) regUsername.value = '';
        if (regEmail) regEmail.value = '';
        if (regPassword) regPassword.value = '';
        if (regConfirmPassword) regConfirmPassword.value = '';
        if (guestUsername) guestUsername.value = '';
        if (loginUsernameEmail) loginUsernameEmail.value = '';
        if (loginPassword) loginPassword.value = '';
        if (forgotPasswordEmail) forgotPasswordEmail.value = '';
    }

    /**
     * Shows the user registration page and hides the main content sections.
     * This function is designed to work whether it's called from index.html or plans.html.
     * It always assumes the user registration page is on index.html.
     */
    function showUserRegistrationPage() {
        console.log("showUserRegistrationPage called.");
        // If we are not on index.html, navigate there first
        if (window.location.pathname.includes('/plans.html') || window.location.pathname.includes('/dashboard.html')) {
            window.location.href = getBaseUrl() + 'index.html#user-registration-page';
            return; // Exit to let the new page load and handle the display
        }

        // If we are on index.html, proceed with showing/hiding sections
        if (mainContentSection) mainContentSection.classList.add('hidden');
        if (userRegistrationPage) userRegistrationPage.classList.remove('hidden');
        
        console.log("mainContentSection classes after showUserRegistrationPage:", mainContentSection ? mainContentSection.classList : 'N/A');
        console.log("userRegistrationPage classes after showUserRegistrationPage:", userRegistrationPage ? userRegistrationPage.classList : 'N/A');
        
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of registration page
        clearAuthErrors(); // Clear any auth messages when navigating to it
        clearAuthFields(); // Clear any input fields

        // Show auth forms and hide dashboard initially
        if (authFormsContainer) authFormsContainer.classList.remove('hidden');
        if (myAccountDashboard) myAccountDashboard.classList.add('hidden');

        // Ensure register form is active by default when showing auth page
        if (radioRegister) radioRegister.checked = true;
        if (registerFields) registerFields.classList.remove('hidden');
        if (loginFields) loginFields.classList.add('hidden');
        if (guestFields) guestFields.classList.add('hidden');
        if (forgotPasswordFields) forgotPasswordFields.classList.add('hidden');
    }


    /**
     * Updates the UI based on the user's authentication status.
     * This function runs on both index.html and plans.html
     */
    function checkUserStatus() {
        console.log("checkUserStatus called.");
        const authToken = localStorage.getItem('authToken');
        const username = localStorage.getItem('username');

        // Select the correct header buttons based on the current page
        const currentHeaderLoginBtn = document.getElementById('loginBtnHeader');
        const currentHeaderRegisterBtn = document.getElementById('registerBtnHeader');

        if (currentHeaderLoginBtn && currentHeaderRegisterBtn) { 
            if (authToken && username) {
                // User is logged in
                currentHeaderLoginBtn.classList.add('hidden');
                currentHeaderRegisterBtn.textContent = 'My Account';
                currentHeaderRegisterBtn.onclick = (event) => {
                    event.preventDefault(); // Prevent default button action
                    window.location.href = getBaseUrl() + 'dashboard.html'; // Direct to dashboard if logged in
                };
                
                if (loggedInUsernameSpan) loggedInUsernameSpan.textContent = username;
                // If currently on the auth page (which is on index.html), ensure dashboard is visible
                if (userRegistrationPage && !userRegistrationPage.classList.contains('hidden')) {
                    if (authFormsContainer) authFormsContainer.classList.add('hidden');
                    if (myAccountDashboard) myAccountDashboard.classList.remove('hidden');
                    console.log("Currently on auth page, ensuring dashboard is visible.");
                }

            } else {
                // User is logged out or guest
                currentHeaderLoginBtn.classList.remove('hidden');
                currentHeaderRegisterBtn.textContent = 'Register';
                currentHeaderRegisterBtn.onclick = (event) => {
                    event.preventDefault(); // Prevent default button action
                    showUserRegistrationPage(); // Show auth forms on index.html
                    // Ensure register form is active by default when not logged in (only applies if on index.html)
                    if (radioRegister && registerFields && loginFields && guestFields && forgotPasswordFields) {
                        radioRegister.checked = true;
                        registerFields.classList.remove('hidden');
                        loginFields.classList.add('hidden');
                        guestFields.classList.add('hidden');
                        forgotPasswordFields.classList.add('hidden');
                    }
                };
                
                // If currently on the auth page (which is on index.html), ensure forms are visible
                if (userRegistrationPage && !userRegistrationPage.classList.contains('hidden')) {
                    if (authFormsContainer) authFormsContainer.classList.remove('hidden');
                    if (myAccountDashboard) myAccountDashboard.classList.add('hidden');
                    console.log("Currently on auth page, ensuring forms are visible.");
                }
            }
        }
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
    // Only attach if elements exist (i.e., on index.html)
    if (getRecommendationBtn) {
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
    }

    // --- AI Assistant Feature: Coverage Term Explainer ---
    // Only attach if elements exist (i.e., on index.html)
    if (explainTermBtn) {
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
    }

    // --- NEW AI Assistant Feature: What If Scenario Planner ---
    // Only attach if elements exist (i.e., on index.html)
    if (getScenarioAnalysisBtn) {
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
    }


    // --- User Registration Module Logic (only attach if elements exist on the current page) ---
    if (radioRegister) {
        radioRegister.addEventListener('change', () => {
            clearAuthErrors();
            clearAuthFields();
            registerFields.classList.remove('hidden');
            loginFields.classList.add('hidden');
            guestFields.classList.add('hidden');
            forgotPasswordFields.classList.add('hidden'); // Hide forgot password
        });
    }
    if (radioLogin) {
        radioLogin.addEventListener('change', () => {
            clearAuthErrors();
            clearAuthFields();
            registerFields.classList.add('hidden');
            loginFields.classList.remove('hidden');
            guestFields.classList.add('hidden');
            forgotPasswordFields.classList.add('hidden'); // Hide forgot password
        });
    }
    if (radioGuest) {
        radioGuest.addEventListener('change', () => {
            clearAuthErrors();
            clearAuthFields();
            registerFields.classList.add('hidden');
            loginFields.classList.add('hidden');
            guestFields.classList.remove('hidden');
            forgotPasswordFields.classList.add('hidden'); // Hide forgot password
        });
    }

    if (guestOkBtn) {
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
                // Simulate guest login success
                localStorage.setItem('authToken', 'guest_token_' + Date.now());
                localStorage.setItem('username', username);
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
                authMessage.innerHTML = `Welcome, ${username}! You are logged in as a Guest.`;
                clearAuthFields();
                checkUserStatus(); // Update UI to show dashboard
            }
        });
    }

    // Password strength indicator logic
    if (regPassword) {
        regPassword.addEventListener('input', () => {
            const password = regPassword.value;
            let strength = 0;
            let message = '';
            let color = 'text-gray-500';

            if (password.length > 0) {
                // Criteria for strength
                if (password.length >= 8) strength++;
                if (/[A-Z]/.test(password)) strength++; // Uppercase
                if (/[a-z]/.test(password)) strength++; // Lowercase
                if (/\d/.test(password)) strength++; // Number
                if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++; // Special character

                if (strength <= 2) {
                    message = 'Weak';
                    color = 'text-red-500';
                } else if (strength <= 4) {
                    message = 'Medium';
                    color = 'text-yellow-500';
                } else {
                    message = 'Strong';
                    color = 'text-green-500';
                }
            }

            passwordStrength.textContent = message;
            passwordStrength.className = `text-xs mt-1 ${color}`;
        });
    }

    if (registerBtn) {
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
                // Simulate successful registration
                localStorage.setItem('authToken', 'reg_token_' + Date.now()); // Dummy token
                localStorage.setItem('username', username); // Store username
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
                authMessage.innerHTML = `Registration successful for ${username}! You are now logged in.`;
                clearAuthFields();
                checkUserStatus(); // Update UI to show dashboard
            } else {
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
                authMessage.innerHTML = 'Please fix the errors above to register.';
            }
        });
    }

    if (registerGmailBtn) {
        registerGmailBtn.addEventListener('click', () => {
            clearAuthErrors();
            authMessage.classList.remove('hidden');
            authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-blue-100 text-blue-800 border border-blue-300';
            authMessage.innerHTML = 'Redirecting to Gmail for registration... (Feature under development)';
            clearAuthFields();
        });
    }

    // Login button logic (basic validation)
    if (loginBtn) {
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
                // Simulate successful login
                // In a real app, you'd verify credentials with a backend
                const dummyUsers = {
                    'testuser': 'Password123!',
                    'test@example.com': 'Password123!'
                };

                if (dummyUsers[usernameEmail] === password) {
                    localStorage.setItem('authToken', 'dummy_auth_token_' + Date.now());
                    localStorage.setItem('username', usernameEmail.split('@')[0]); // Use username part of email or full username
                    authMessage.classList.remove('hidden');
                    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
                    authMessage.innerHTML = `Login successful for ${usernameEmail}!`;
                    clearAuthFields();
                    checkUserStatus(); // Update UI to show dashboard
                } else {
                    authMessage.classList.remove('hidden');
                    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
                    authMessage.innerHTML = 'Invalid username/email or password.';
                    isValid = false; // Mark as invalid for message consistency
                }
            } else {
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
                authMessage.innerHTML = 'Please fill in both fields to log in.';
            }
        });
    }

    // Forgot Password Link functionality - Now shows a new frame
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            clearAuthErrors();
            clearAuthFields(); // Clear all fields
            
            // Hide all other forms and show forgot password form
            if (registerFields) registerFields.classList.add('hidden');
            if (loginFields) loginFields.classList.add('hidden');
            if (guestFields) guestFields.classList.add('hidden');
            if (forgotPasswordFields) forgotPasswordFields.classList.remove('hidden');
            
            if (authMessage) {
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-blue-100 text-blue-800 border border-blue-300';
                authMessage.innerHTML = 'Please enter your registered email to reset your password.';
            }
        });
    }

    // Forgot Password OK button logic
    if (forgotPasswordOkBtn) {
        forgotPasswordOkBtn.addEventListener('click', () => {
            const email = forgotPasswordEmail.value.trim();
            clearAuthErrors(); // Clear errors

            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (email === "") {
                if (forgotPasswordError) forgotPasswordError.classList.remove('hidden');
                if (forgotPasswordError) forgotPasswordError.textContent = 'Please Enter Registered Valid Email';
                if (authMessage) {
                    authMessage.classList.remove('hidden');
                    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
                    authMessage.innerHTML = 'Password reset failed: Email is mandatory.';
                }
            } else if (!emailPattern.test(email)) {
                if (forgotPasswordError) forgotPasswordError.classList.remove('hidden');
                if (forgotPasswordError) forgotPasswordError.textContent = 'Please Enter Valid Email (e.g., user@domain.com)';
                if (authMessage) {
                    authMessage.classList.remove('hidden');
                    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300';
                    authMessage.innerHTML = 'Password reset failed: Invalid email format.';
                }
            } else {
                // In a real app, send email to backend for password reset
                if (authMessage) {
                    authMessage.classList.remove('hidden');
                    authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
                    authMessage.innerHTML = `If ${email} is a registered email, a password reset link has been sent.`;
                }
                if (forgotPasswordEmail) forgotPasswordEmail.value = ''; // Clear email field after submission
            }
        });
    }

    // Back to Login button from Forgot Password frame
    if (backToLoginFromForgot) {
        backToLoginFromForgot.addEventListener('click', () => {
            clearAuthErrors();
            clearAuthFields();
            if (forgotPasswordFields) forgotPasswordFields.classList.add('hidden');
            if (loginFields) loginFields.classList.remove('hidden'); // Go back to login form
            if (radioLogin) radioLogin.checked = true; // Set login radio button as checked
        });
    }

    // Event listener for the "Back to Main Website" button on Auth page (on index.html)
    if (backToMainWebsiteBtnAuthPage) { 
        backToMainWebsiteBtnAuthPage.addEventListener('click', () => {
            console.log("Back to Main Website button clicked from Auth Page.");
            showAllMainContentSections(); // Show all primary homepage sections
            if (userRegistrationPage) userRegistrationPage.classList.add('hidden'); // Hide the auth page
            clearAuthErrors(); // Clear any auth messages when going back
            clearAuthFields();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        });
    }

    // Sign Out button logic (on dashboard.html)
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            console.log("Sign Out button clicked.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('loggedInUser'); // Also clear this for consistency
            localStorage.removeItem('registeredEmail'); // Also clear this for consistency
            localStorage.removeItem('registeredFullName'); // Also clear this for consistency

            clearAuthErrors();
            clearAuthFields();
            if (authMessage) {
                authMessage.classList.remove('hidden');
                authMessage.className = 'mt-6 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-300';
                authMessage.innerHTML = 'You have been signed out.';
            }
            // After sign out, redirect to index.html and show main content
            window.location.href = getBaseUrl() + 'index.html';
        });
    }


    // Event listeners for "Learn More" buttons on the plans.html page
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const targetHref = event.target.getAttribute('href'); // Get the full href (e.g., index.html#life-insurance-details)
            window.location.href = targetHref; // Navigate to index.html and let the hash handle scrolling
        });
    });

    // Event listeners for "Back to Plans Overview" buttons on detail pages (on index.html)
    backToPlansPageBtns.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = getBaseUrl() + 'plans.html'; // Navigate back to the plans.html page
        });
    });

    // Event listeners for main navigation links (on both index.html and plans.html)
    if (document.querySelectorAll('nav .nav-link')) {
        document.querySelectorAll('nav .nav-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const href = event.target.getAttribute('href');
                // Check if the link is an internal anchor on index.html
                if (href.startsWith('#') || href.startsWith('index.html#')) { 
                    event.preventDefault(); // Prevent default anchor behavior
                    if (window.location.pathname.includes('/plans.html') || window.location.pathname.includes('/dashboard.html')) {
                        // If currently on plans.html or dashboard.html, navigate to index.html and then scroll
                        window.location.href = getBaseUrl() + 'index.html' + href.substring(href.indexOf('#'));
                    } else {
                        // If already on index.html, just scroll
                        showAllMainContentSections(); // Ensure all main sections are visible
                        const targetElement = document.querySelector(href.substring(href.indexOf('#')));
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                } else if (href === 'plans.html') { // Direct link to plans.html
                    event.preventDefault();
                    window.location.href = getBaseUrl() + 'plans.html';
                } else if (href === 'index.html') { // Direct link to index.html (Home)
                    event.preventDefault();
                    window.location.href = getBaseUrl() + 'index.html';
                }
                // For other external links or unhandled internal links, let default behavior apply
            });
        });
    }

    // Event listeners for specific header buttons that might be present on either page
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = getBaseUrl() + 'index.html?form=login';
        });
    }
    if (headerRegisterBtn) {
        headerRegisterBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = getBaseUrl() + 'index.html?form=register';
        });
    }

    // Initial state setup based on the current page
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded fired.");
        checkUserStatus(); // Check user status to set up header links correctly

        const hash = window.location.hash;
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // This is index.html
            const urlParams = new URLSearchParams(window.location.search);
            const formParam = urlParams.get('form');
            const sectionParam = urlParams.get('section'); // New param for scrolling to section

            if (hash === '#user-registration-page' || formParam === 'register') {
                showUserRegistrationPage();
                if (formParam === 'login' && radioLogin) radioLogin.checked = true; // Ensure login is checked if coming via login param
            } else if (formParam === 'login') {
                showUserRegistrationPage(); // Show auth page
                if (radioLogin) radioLogin.checked = true; // Set login radio button as checked
                if (registerFields) registerFields.classList.add('hidden'); // Hide register form
                if (loginFields) loginFields.classList.remove('hidden'); // Show login form
            } else if (sectionParam) { // If a section is specified, hide forms and scroll to section
                showMainContent(); // Ensure main content is visible
                setTimeout(() => { // Give browser a moment to render content
                    const targetSection = document.getElementById(sectionParam);
                    if (targetSection) {
                        targetSection.classList.remove('hidden'); // Make sure the specific section is visible
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            } else if (hash.endsWith('-details')) { // If it's a detail section hash (e.g., #life-insurance-details)
                hideAllMainContentSections();
                const targetSection = document.getElementById(hash.substring(1)); // Remove '#'
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                showMainContent(); // Default for index.html (show main marketing content)
            }
        } else if (window.location.pathname.includes('plans.html')) {
            // This is plans.html, no special section hiding is needed here as it's the only content
            // But ensure header buttons are correctly set up
            console.log("On plans.html");
        } else if (window.location.pathname.includes('dashboard.html')) {
            // This is dashboard.html, ensure user is logged in
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (!loggedInUser) {
                window.location.href = getBaseUrl() + 'index.html'; // Redirect to login if not logged in
            }
        }
    });
});
