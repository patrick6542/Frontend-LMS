const baseApiUrl = 'http://127.0.0.1:8000/api';  
async function register() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    if (!username || !password) {
        alert('Please provide a username and password.');
        return;
    }

    const response = await fetch(`${baseApiUrl}/signup/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) {
        document.getElementById('signup').style.display = 'none';
        document.getElementById('signin').style.display = 'block';
}
}
async function login() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    if (!username || !password) {
        alert('Please provide a username and password.');
        return;
    }

    console.log('Request Data:', { username, password });
    const response = await fetch(`${baseApiUrl}/signin/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('Response Data:', data); 
    
    if (response.ok) {
        const accessToken = data.access_token;
        localStorage.setItem('access_token', accessToken);  

        const userRole = data.role;
        localStorage.setItem('user_role', userRole);  

        const userId = data.user_id;  
        localStorage.setItem('user_id', userId); 

        if (userRole === 'LIBRARIAN') {
            showLibrarianActions();
        } else if (userRole === 'MEMBER') {
            showMemberActions();
            fetchBooks();
        }

        alert('Login successful!');
    } else {
        alert(data.message);
    }
}

function showLibrarianActions() {
    hideAllSections(); 
    const librarianActionsSection = document.getElementById('librarian-actions');
    if (librarianActionsSection) {
        librarianActionsSection.style.display = 'block';
    }
}

function showMemberActions() {
    hideAllSections(); 

    const memberActionsSection = document.getElementById('member-actions');
    if (memberActionsSection) {
        memberActionsSection.style.display = 'block';
    }
}

function hideAllSections() {
    const sections = ['signup', 'signin', 'librarian-actions', 'member-actions', 'actions', 'delete'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}
   
async function borrow() {
    const bookId = document.getElementById('borrow-book-id').value;

    const response = await fetch(`${baseApiUrl}/borrow/${bookId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    });

    const data = await response.json();
    alert(data.message);
    fetchBooks();
}

async function returnBook() {
    const bookId = document.getElementById('return-book-id').value;

    const response = await fetch(`${baseApiUrl}/return/${bookId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    });

    const data = await response.json();
    alert(data.message);
    fetchBooks();
}

async function deleteOwnAccount() {
    const userId = getCurrentUserId();

    const response = await fetch(`${baseApiUrl}/delete-user/${userId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        alert('Account deleted successfully.');
        localStorage.removeItem('access_token'); // Log out the user
        // Hide member actions section after account deletion
        document.getElementById('member-actions').style.display = 'none';
    } else {
        const data = await response.json();
        alert(data.message);
    }
}

async function addBook(title, author) {
    try {
        const accessToken = localStorage.getItem('access_token');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };

        const response = await fetch(`${baseApiUrl}/books/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ title, author }),
        });

        if (!response.ok) {
            throw new Error('Error adding book: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
}

async function updateBook() {
    const bookId = document.getElementById('update-book-id').value;
    const newTitle = document.getElementById('update-book-title').value;
    const newAuthor = document.getElementById('update-book-author').value;
    
    
    const response = await fetch(`${baseApiUrl}/books/${bookId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title: newTitle, author: newAuthor }),
    });

    const data = await response.json();
    alert(data.message);
    fetchBooks();
}

async function removeBook() {
    const bookId = document.getElementById('remove-book-id').value;

    const response = await fetch(`${baseApiUrl}/books/${bookId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    });

    if (response.ok) {
        alert('Book removed successfully.');
        fetchBooks();
    } else {
        const data = await response.json();
        alert(data.message);
    }
}

async function addMember() {
    const username = document.getElementById('member-username').value;
    const password = document.getElementById('member-password').value;
    const role = 'MEMBER';

    const response = await fetch(`${baseApiUrl}/signup/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();
    alert(data.message);
}

async function updateMember() {
    const memberId = document.getElementById('update-member-id').value;
    const newUsername = document.getElementById('update-member-username').value;
    const newPassword = document.getElementById('update-member-password').value;

    const response = await fetch(`${baseApiUrl}/update-member/${memberId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
    });

    const data = await response.json();
    alert(data.message);
}

async function removeMember() {
    const memberId = document.getElementById('remove-member-id').value;

    const response = await fetch(`${baseApiUrl}/delete-member/${memberId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    });

    if (response.ok) {
        alert('Member removed successfully.');
    } else {
        const data = await response.json();
        alert(data.message);
    }
}

function getCurrentUserId() {
    const token = localStorage.getItem('access_token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
    }
    return null;
}

function loadUserContent() {
    const userId = getCurrentUserId();

    if (userId) {
        const actionsSection = document.getElementById('actions');
        const deleteSection = document.getElementById('delete');
        actionsSection.style.display = 'block';
        deleteSection.style.display = 'block';
        
        if (getCurrentUserRole() === 'LIBRARIAN') {
            const librarianActionsSection = document.getElementById('librarian-actions');
            librarianActionsSection.style.display = 'block';
        } else if (getCurrentUserRole() === 'MEMBER') {
            const memberActionsSection = document.getElementById('member-actions');
            memberActionsSection.style.display = 'block';
        }
    }
}

function getCurrentUserRole() {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload); 
            return payload.role; // Return the role from the JWT payload
        } catch (error) {
            console.error('Error parsing JWT token:', error);
        }
    }
    return null;
}
function showSignUpForm() {
    document.getElementById('signup').style.display = 'block';
    document.getElementById('signin').style.display = 'none';
}

function showSignInForm() {
    document.getElementById('signup').style.display = 'none';
    document.getElementById('signin').style.display = 'block';
}


window.onload = function () {
    loadUserContent();
    fetchBooks();
};

