// DOM elements
const usersList = document.getElementById('usersList');

let currentUser = null;

// Check auth state and role
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists && doc.data().role === 'admin') {
                    loadUsers();
                } else {
                    // Redirect if not admin
                    window.location.href = 'dashboard.html';
                }
            });
    } else {
        window.location.href = 'index.html';
    }
});

// Load all users
function loadUsers() {
    usersList.innerHTML = '';
    
    db.collection('users').get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <h3>${user.email}</h3>
                    <p>Role: ${user.role}</p>
                    <p>Joined: ${new Date(user.createdAt?.toDate()).toLocaleDateString()}</p>
                    <div class="user-actions">
                        <select class="role-select" data-id="${doc.id}">
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Editor</option>
                            <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                        </select>
                    </div>
                `;
                usersList.appendChild(userCard);
            });
            
            // Add event listeners for role changes
            document.querySelectorAll('.role-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const userId = e.target.getAttribute('data-id');
                    const newRole = e.target.value;
                    
                    db.collection('users').doc(userId).update({
                        role: newRole
                    })
                    .then(() => {
                        alert('User role updated successfully');
                    })
                    .catch((error) => {
                        console.error("Error updating user role: ", error);
                        alert('Error updating user role');
                    });
                });
            });
        })
        .catch((error) => {
            console.error("Error getting users: ", error);
        });
}