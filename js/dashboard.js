// DOM elements
const userNameElement = document.getElementById('userName');
const userRoleElement = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');
const createLetterBtn = document.getElementById('createLetterBtn');
const viewLettersBtn = document.getElementById('viewLettersBtn');

// Check user role and update UI
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    userNameElement.textContent = user.email;
                    userRoleElement.textContent = userData.role;
                    
                    // Show admin link if user is admin
                    if (userData.role === 'admin') {
                        adminLink.style.display = 'block';
                    }
                }
            })
            .catch((error) => {
                console.error("Error getting user data:", error);
            });
    }
});

// Logout function
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
});

// Navigation buttons
if (createLetterBtn) {
    createLetterBtn.addEventListener('click', () => {
        window.location.href = 'letters.html?action=create';
    });
}

if (viewLettersBtn) {
    viewLettersBtn.addEventListener('click', () => {
        window.location.href = 'letters.html';
    });
}