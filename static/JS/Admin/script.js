document.addEventListener("DOMContentLoaded", () => {


    // Fetch the username from sessionStorage
    const username = sessionStorage.getItem("username");

    // Check if the username is available
    if (username) {
        // Set the username in the span with the id 'username'
        document.getElementById("username").textContent = username;
    } else {
        // If username is not in sessionStorage, you can set a default value or redirect
        document.getElementById("username").textContent = "Guest";
    }
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');

    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Tab functionality
    const tabs = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function setActiveTab(tabId) {
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-content`).style.display = 'block';
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            setActiveTab(tabId);
        });
    });

    setActiveTab('pending'); // Default active tab

    // Fetch users on load
    fetchUsers();
});


function fetchUsers() {

    fetch('/get-users')
        .then(response => {
            if (!response.ok) {
                //console.error('Failed to fetch users: ', response.statusText);  // Log failure details
                throw new Error('Failed to fetch users');
            }
            return response.json();  // Return the JSON response
        })
        .then(users => {
            //console.log('Users fetched successfully:', users);  // Log the fetched users
            populateUsers(users);  // Pass the fetched users to populateUsers
        })
        .catch(error => {
            //console.error('Error fetching users:', error);  // Log any error that occurs during the fetch or processing
        });
}


// Subject modal handling
const createSubjectBtn = document.getElementById('create-subject-btn');
const subjectModal = document.getElementById('subject-modal');
const closeSubjectModalAdmin = document.getElementById('close-subject-modal');
const cancelSubject = document.getElementById('cancel-subject');
const saveSubject = document.getElementById('save-subject');

function openSubjectModal() {
    subjectModal.style.display = 'flex';
    setTimeout(() => {
        subjectModal.classList.add('active');
        sidebar.classList.remove('open');
    }, 10);
}

function closeSubjectModal() {
    subjectModal.classList.remove('active');
    setTimeout(() => {
        subjectModal.style.display = 'none';
    }, 300);
}


// Function to validate and create subject
function createSubject() {
    const subjectName = document.getElementById('subject-name').value;
    const branch = document.getElementById('branch').value;
    const semester = document.getElementById('semester').value;

    // Check if any field is empty
    if (!subjectName || !branch || !semester) {
        // If any field is empty, show SweetAlert error
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Missing Information',
            text: 'Please fill in all the fields.',
            showConfirmButton: false,
            toast: true,
            timer: 2000
        });
    } else if (semester < 1 || semester > 8) {
        // Check if semester is between 1 and 8
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Invalid Semester',
            text: 'Uh-oh! Semesters go from 1 to 8, not beyond! 😆 Try again!',
            showConfirmButton: false,
            toast: true,
            timer: 2000
        });
    } else {
        // If all fields are filled, send the data to the server (Python endpoint)
        const subjectData = {
            subject_name: subjectName,
            branch: branch,
            semester: semester
        };

        fetch('/create_subject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subjectData)
        })
            .then(response => response.json())
            .then(data => {
                // If the server responds successfully
                console.log(data);

                if (data.success) {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Subject Created',
                        text: 'The subject has been created successfully.',
                        showConfirmButton: false,
                        toast: true,
                        timer: 2000
                    });

                    // Reset the form and close the modal
                    document.getElementById('subject-form').reset();
                    closeSubjectModal();
                } else {
                    // If there's an error in the response from the server
                    Swal.fire({
                        position: 'top-end',
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Something went wrong. Please try again.',
                        showConfirmButton: false,
                        toast: true,
                        timer: 2000
                    });
                }
            })
            .catch(error => {
                // Handle network or other errors
                console.error('Error:', error);
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Oops!',
                    text: 'An error occurred. Please try again.',
                    showConfirmButton: false,
                    toast: true,
                    timer: 2000
                });
            });
    }
}


createSubjectBtn.addEventListener('click', openSubjectModal);
closeSubjectModalAdmin.addEventListener('click', closeSubjectModal);
cancelSubject.addEventListener('click', closeSubjectModal);

saveSubject.addEventListener('click', createSubject);


// Create user cards
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.setAttribute('data-id', user[0]);

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <p><strong>ID:</strong> ${user[0]}</p>
        <p><strong>Username:</strong> ${user[1]}</p>
        <p><strong>Email:</strong> ${user[2]}</p>
        <p><strong>Role:</strong> ${user[3]}</p>
        <p>
            <strong>Status:</strong>
            <span class="status-badge status-${user[4]}">${user[4]}</span>
        </p>
    `;

    const userActions = document.createElement('div');
    userActions.className = 'user-actions';

    if (user[4] === 'pending') {
        userActions.innerHTML = `
            <button class="action-btn approve-btn" onclick="handleUserAction(${user[0]}, 'approve')">
                <i class="fas fa-check-circle"></i>
            </button>
            <button class="action-btn reject-btn" onclick="handleUserAction(${user[0]}, 'reject')">
                <i class="fas fa-times-circle"></i>
            </button>
        `;
    } else if (user[4] === 'approved') {
        userActions.innerHTML = `
            <button class="action-btn reject-btn" onclick="handleUserAction(${user[0]}, 'restore')">
                <i class="fas fa-times-circle"></i>
            </button>
        `;
    } else if (user[4] === 'rejected') {
        userActions.innerHTML = `
            <button class="action-btn restore-btn" onclick="handleUserAction(${user[0]}, 'restore')">
                <i class="fas fa-undo"></i>
            </button>
        `;
    }

    card.appendChild(userInfo);
    card.appendChild(userActions);

    return card;
}

function populateUsers(users) {
    const pendingContainer = document.getElementById('pending-users');
    const approvedContainer = document.getElementById('approved-users');
    const rejectedContainer = document.getElementById('rejected-users');

    pendingContainer.innerHTML = '';
    approvedContainer.innerHTML = '';
    rejectedContainer.innerHTML = '';

    users.forEach(user => {
        const userCard = createUserCard(user);

        if (user[4] === 'pending') {
            pendingContainer.appendChild(userCard);
        } else if (user[4] === 'approved') {
            approvedContainer.appendChild(userCard);
        } else if (user[4] === 'rejected') {
            rejectedContainer.appendChild(userCard);
        }
    });
}


// Handle user actions (approve, reject, restore)
function handleUserAction(userId, action) {
    console.log(`User ID: ${userId}, Action: ${action}`);

    // Send the action to the backend
    fetch('/update_user_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, action: action }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);

            // Show success alert with SweetAlert2
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'User status updated',
                text: data.message,
                showConfirmButton: false,
                toast: true,
                timer: 3000
            });

            // Refresh the user list or update the UI
            fetchUsers(); // Call the function to refresh user list
        })
        .catch((error) => {
            console.error('Error:', error);

            // Show error alert with SweetAlert2
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Oops!',
                text: 'An error occurred. Please try again.',
                showConfirmButton: false,
                toast: true,
                timer: 3000
            });
        });
}
