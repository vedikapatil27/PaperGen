// DOM Elements
const sidebar = document.querySelector('.left-sidebar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const editModal = document.getElementById('edit-modal');
const fileInput = document.getElementById('image');
const fileName = document.getElementById('file-name');
const imagePreview = document.getElementById('image-preview');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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
    fetchSubjects();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 &&
            !sidebar.contains(e.target) &&
            e.target !== menuToggle &&
            e.target !== mobileMenuToggle &&
            !mobileMenuToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // File input change event
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileName.textContent = fileInput.files[0].name;

                // Show image preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                fileName.textContent = 'No file chosen';
                imagePreview.innerHTML = '';
            }
        });
    }
}

// Fetch Subjects
function fetchSubjects() {
    fetch('/get_subjects')
        .then(response => response.json())
        .then(data => {
            const tabsContainer = document.getElementById('subjects-tabs');
            tabsContainer.innerHTML = '';

            if (data.subjects.length > 0) {
                data.subjects.forEach((subject, index) => {
                    const tabButton = document.createElement('button');
                    tabButton.className = 'tab-item';
                    tabButton.textContent = subject.name;
                    tabButton.dataset.id = subject.id;

                    if (index === 0) {
                        tabButton.classList.add('active');
                        fetchQuestions(subject.id);
                    }

                    tabButton.addEventListener('click', () => {
                        // Remove active class from all tabs
                        document.querySelectorAll('.tab-item').forEach(tab => {
                            tab.classList.remove('active');
                        });

                        // Add active class to clicked tab
                        tabButton.classList.add('active');

                        // Fetch questions for this subject
                        fetchQuestions(subject.id);
                    });

                    tabsContainer.appendChild(tabButton);
                });
            } else {
                tabsContainer.innerHTML = '<p>No subjects found. Please add subjects first.</p>';
            }
        })
        .catch(error => console.error('Error fetching subjects:', error));
}

// Fetch Questions
function fetchQuestions(subjectId) {
    fetch(`/get_questions?subject_id=${subjectId}`)
        .then(response => response.json())
        .then(data => {
            if (data.questions.length > 0) {
                displayQuestions(data.questions);
            } else {
                document.getElementById('questions-container').style.display = 'block';
                document.querySelector('#questions-table tbody').innerHTML =
                    '<tr><td colspan="7" class="no-data">No questions found for this subject.</td></tr>';
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
}

// Display Questions
function displayQuestions(questions) {
    const tableBody = document.querySelector('#questions-table tbody');
    tableBody.innerHTML = '';

    questions.forEach(question => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${question.text}</td>
            <td>${question.marks}</td>
            <td>${question.rbt_level}</td>
            <td>${question.co}</td>
            <td>${question.pi}</td>
            <td>
              ${question.image 
              ? `<img src="${question.image.replace(/\\/g, '/').includes('static/uploads/') ? question.image.replace(/\\/g, '/') : 'static/uploads/' + question.image.replace(/\\/g, '/').replace(/^\//, '')}" width="100" alt="Question Image">`
              : 'No Image'}
            </td>

            <td>
                <button class="action-btn edit-btn" onclick="openEditModal(${question.id}, '${escapeString(question.text)}', ${question.marks}, '${question.rbt_level}', '${question.co}', '${question.pi}', '${question.image ? 'static/uploads/' + question.image.replace(/\\/g, '/').replace(/\\/g, '/').replace(/^\//, '') : ''}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteQuestion(${question.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    document.getElementById('questions-container').style.display = 'block';
}

// Helper function to escape strings for JS
function escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}


// Modal Functions
function openEditModal(id, text, marks, rbtLevel, co, pi, image) {
    // Set form values
    document.getElementById('question_id').value = id;
    document.getElementById('question').value = text;
    document.getElementById('marks').value = marks;
    document.getElementById('rbt_level').value = rbtLevel;
    document.getElementById('co').value = co;
    document.getElementById('pi').value = pi;

    // Reset file input
    document.getElementById('file-name').textContent = 'No file chosen';

    // Show image preview if exists
    if (image) {
        document.getElementById('image-preview').innerHTML =
            `<img src="${image}" alt="Question Image">`;
    } else {
        document.getElementById('image-preview').innerHTML = '';
    }

    // Show modal with animation
    editModal.style.display = 'flex';
    setTimeout(() => {
        editModal.classList.add('active');
    }, 10);
}

function closeModal() {
    editModal.classList.remove('active');
    setTimeout(() => {
        editModal.style.display = 'none';
        window.location.reload();
    }, 300);
}

function updateQuestion() {
    const form = document.getElementById('edit-form');
    const formData = new FormData(form);

    fetch(`/update_question`, { // ✅ Removed ID from URL since it's passed in formData
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // ✅ Refresh active tab questions if update is successful
                const activeTab = document.querySelector('.tab-item.active');
                if (activeTab) {
                    fetchQuestions(activeTab.dataset.id);
                }

                // ✅ Close modal after successful update
                closeModal();

                // ✅ Show success notification
                showNotification(data.message, 'success');
            } else {
                // ✅ Show error notification if backend returns an error
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating question:', error);
            showNotification('Failed to update question', 'error');
        });
}


function deleteQuestion(id) {
    fetch(`/delete_question/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            const activeTab = document.querySelector('.tab-item.active');
            if (activeTab) {
                fetchQuestions(activeTab.dataset.id);
            }

            showNotification(data.message, 'success');
        })
        .catch(error => {
            console.error('Error deleting question:', error);
            showNotification('Failed to delete question', 'error');
        });
}


// Simple notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background-color: var(--card-bg);
        color: var(--text-color);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification.success i {
        color: var(--success-color);
    }
    
    .notification.error i {
        color: var(--error-color);
    }
`;
document.head.appendChild(notificationStyles);