// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8P10npnYxArqIVBKRgnhWQ1r58PxzTmo",
  authDomain: "letteragenda.firebaseapp.com",
  projectId: "letteragenda",
  storageBucket: "letteragenda.firebasestorage.app",
  messagingSenderId: "504998774900",
  appId: "1:504998774900:web:b92f35b5c9186817732921",
  measurementId: "G-TG6M7L1V54"
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