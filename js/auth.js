// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Login function
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                loginError.textContent = error.message;
            });
    });
}

// Register function
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match';
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Add user to Firestore with default 'viewer' role
                return db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    role: 'viewer',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                registerError.textContent = error.message;
            });
    });
}

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    }
});