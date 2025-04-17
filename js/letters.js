const { jsPDF } = window.jspdf;
const docx = window.docx;

// DOM elements
const lettersListContainer = document.getElementById('lettersListContainer');
const letterEditorContainer = document.getElementById('letterEditorContainer');
const lettersList = document.getElementById('lettersList');
const newLetterBtn = document.getElementById('newLetterBtn');
const editor = document.getElementById('editor');
const saveLetterBtn = document.getElementById('saveLetterBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadDocxBtn = document.getElementById('downloadDocxBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const deleteLetterBtn = document.getElementById('deleteLetterBtn');
const letterTitle = document.getElementById('letterTitle');
const letterType = document.getElementById('letterType');
const editorTitle = document.getElementById('editorTitle');

let currentUser = null;
let currentLetterId = null;
let userRole = 'viewer';

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    userRole = doc.data().role;
                    loadLetters();
                }
            });
    } else {
        window.location.href = 'index.html';
    }
});

// Load all letters
function loadLetters() {
    lettersList.innerHTML = '';
    
    let query = db.collection('letters');
    
    // If user is not admin, only show their own letters
    if (userRole !== 'admin') {
        query = query.where('createdBy', '==', currentUser.uid);
    }
    
    query.orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                lettersList.innerHTML = '<p>No letters found. Create your first letter!</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const letter = doc.data();
                const letterCard = document.createElement('div');
                letterCard.className = 'letter-card';
                letterCard.innerHTML = `
                    <h3>${letter.title}</h3>
                    <p>Type: ${letter.type}</p>
                    <p>Created: ${new Date(letter.createdAt?.toDate()).toLocaleDateString()}</p>
                    <div class="letter-actions">
                        <button class="btn-view" data-id="${doc.id}">View</button>
                        ${userRole !== 'viewer' ? `<button class="btn-edit" data-id="${doc.id}">Edit</button>` : ''}
                    </div>
                `;
                lettersList.appendChild(letterCard);
            });
            
            // Add event listeners
            document.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    viewLetter(e.target.getAttribute('data-id'));
                });
            });
            
            if (userRole !== 'viewer') {
                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        editLetter(e.target.getAttribute('data-id'));
                    });
                });
            }
        })
        .catch((error) => {
            console.error("Error getting letters: ", error);
        });
}

// View letter (read-only)
function viewLetter(letterId) {
    db.collection('letters').doc(letterId).get()
        .then((doc) => {
            if (doc.exists) {
                const letter = doc.data();
                currentLetterId = letterId;
                letterTitle.value = letter.title;
                letterType.value = letter.type;
                editor.innerHTML = letter.content;
                editorTitle.textContent = letter.title;
                
                // Make editor read-only for viewers
                if (userRole === 'viewer') {
                    editor.setAttribute('contenteditable', 'false');
                    saveLetterBtn.style.display = 'none';
                    deleteLetterBtn.style.display = 'none';
                } else {
                    editor.setAttribute('contenteditable', 'true');
                    saveLetterBtn.style.display = 'inline-block';
                    if (letter.createdBy === currentUser.uid || userRole === 'admin') {
                        deleteLetterBtn.style.display = 'inline-block';
                    }
                }
                
                lettersListContainer.style.display = 'none';
                letterEditorContainer.style.display = 'block';
            }
        });
}

// Edit letter
function editLetter(letterId) {
    viewLetter(letterId);
}

// New letter
newLetterBtn.addEventListener('click', () => {
    currentLetterId = null;
    letterTitle.value = '';
    letterType.value = 'letter';
    editor.innerHTML = '<p>Start writing your letter here...</p>';
    editorTitle.textContent = 'New Letter';
    editor.setAttribute('contenteditable', 'true');
    saveLetterBtn.style.display = 'inline-block';
    deleteLetterBtn.style.display = 'none';
    
    lettersListContainer.style.display = 'none';
    letterEditorContainer.style.display = 'block';
});

// Save letter
saveLetterBtn.addEventListener('click', () => {
    if (!letterTitle.value.trim()) {
        alert('Please enter a title for your letter');
        return;
    }
    
    const letterData = {
        title: letterTitle.value,
        content: editor.innerHTML,
        type: letterType.value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (currentLetterId) {
        // Update existing letter
        db.collection('letters').doc(currentLetterId).update(letterData)
            .then(() => {
                alert('Letter updated successfully');
                loadLetters();
                cancelEdit();
            });
    } else {
        // Create new letter
        letterData.createdBy = currentUser.uid;
        letterData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('letters').add(letterData)
            .then(() => {
                alert('Letter created successfully');
                loadLetters();
                cancelEdit();
            });
    }
});

// Cancel editing
cancelEditBtn.addEventListener('click', cancelEdit);

function cancelEdit() {
    lettersListContainer.style.display = 'block';
    letterEditorContainer.style.display = 'none';
}

// Delete letter
deleteLetterBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this letter?')) {
        db.collection('letters').doc(currentLetterId).delete()
            .then(() => {
                alert('Letter deleted successfully');
                loadLetters();
                cancelEdit();
            });
    }
});

// Download as PDF
downloadPdfBtn.addEventListener('click', () => {
    const doc = new jsPDF();
    const title = letterTitle.value;
    const content = editor.textContent;
    
    doc.text(title, 10, 10);
    doc.text(content, 10, 20);
    doc.save(`${title}.pdf`);
});

// Download as DOCX
downloadDocxBtn.addEventListener('click', () => {
    const { Document, Paragraph, TextRun, Packer } = docx;
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: letterTitle.value,
                            bold: true,
                            size: 28
                        })
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: editor.textContent,
                            size: 22
                        })
                    ]
                })
            ]
        }]
    });
    
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${letterTitle.value}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});