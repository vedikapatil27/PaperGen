// DOM Elements
const sidebar = document.querySelector('.left-sidebar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const editModal = document.getElementById('edit-modal');
const fileInput = document.getElementById('image');
const fileName = document.getElementById('file-name');
const imagePreview = document.getElementById('image-preview');
const tooltip = document.getElementById('tooltip');
const searchInput = document.getElementById('question-search');
const clearSearchBtn = document.getElementById('clear-search');

// Store original questions data
let currentQuestions = [];

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

    // Setup tooltip functionality
    document.addEventListener('mouseover', handleTooltip);
    document.addEventListener('mouseout', hideTooltip);
    document.addEventListener('mousemove', moveTooltip);

    // Setup search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        // Show/hide clear button based on search input
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() !== '') {
                clearSearchBtn.style.display = 'flex';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });
        
        // Clear search when button is clicked
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            handleSearch();
            // Add focus back to search input
            searchInput.focus();
        });
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const questionsGrid = document.getElementById('questions-grid');
    
    // If we have questions to search through
    if (currentQuestions.length > 0) {
        if (searchTerm === '') {
            // If search is empty, restore original display
            displayQuestions(currentQuestions);
        } else {
            // Filter and sort questions based on search term
            const matchedQuestions = [];
            const unmatchedQuestions = [];
            
            currentQuestions.forEach(question => {
                // Check if question text contains search term
                if (question.text.toLowerCase().includes(searchTerm)) {
                    matchedQuestions.push(question);
                } else {
                    unmatchedQuestions.push(question);
                }
            });
            
            // Display matched questions first, then unmatched
            const sortedQuestions = [...matchedQuestions, ...unmatchedQuestions];
            
            // If no matches found, show a message
            if (matchedQuestions.length === 0) {
                questionsGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No questions found matching "${searchTerm}"</p>
                        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="clearSearch()">
                            Clear Search
                        </button>
                    </div>
                `;
            } else {
                // Display questions with matched ones first
                displayQuestions(sortedQuestions, searchTerm);
            }
        }
    }
}

// Clear search function
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        handleSearch();
    }
}

// Highlight search matches in text
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight-text">$1</span>');
}

// Escape special characters for regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Tooltip Functions
function handleTooltip(e) {
    const target = e.target;
    
    // Check if the target or its parent has a data-tooltip attribute
    if (target.hasAttribute('data-tooltip') || 
        (target.parentElement && target.parentElement.hasAttribute('data-tooltip'))) {
        
        const tooltipElement = target.hasAttribute('data-tooltip') ? target : target.parentElement;
        const tooltipText = tooltipElement.getAttribute('data-tooltip');
        
        showTooltip(tooltipText, e);
    }
}

function showTooltip(text, e) {
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    moveTooltip(e);
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

function moveTooltip(e) {
    if (tooltip.classList.contains('visible')) {
        // Position the tooltip above the cursor
        const x = e.clientX;
        const y = e.clientY - 10; // Offset to position above cursor
        
        // Calculate tooltip dimensions
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        // Adjust position to keep tooltip within viewport
        let posX = x - (tooltipWidth / 2);
        let posY = y - tooltipHeight - 10; // Position above with some margin
        
        // Ensure tooltip stays within viewport boundaries
        if (posX < 10) posX = 10;
        if (posX + tooltipWidth > window.innerWidth - 10) {
            posX = window.innerWidth - tooltipWidth - 10;
        }
        
        if (posY < 10) {
            // If not enough space above, position below
            posY = y + 25;
        }
        
        tooltip.style.left = `${posX}px`;
        tooltip.style.top = `${posY}px`;
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

                        // Clear search when changing tabs
                        if (searchInput) {
                            searchInput.value = '';
                            clearSearchBtn.style.display = 'none';
                        }

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
                // Store current questions for search functionality
                currentQuestions = data.questions;
                displayQuestions(data.questions);
            } else {
                document.getElementById('questions-container').style.display = 'block';
                document.getElementById('questions-grid').innerHTML =
                    '<div class="no-data">No questions found for this subject.</div>';
                currentQuestions = [];
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
}

// Display Questions - Updated for div-based layout
function displayQuestions(questions, searchTerm = '') {
    const questionsGrid = document.getElementById('questions-grid');
    questionsGrid.innerHTML = '';

    questions.forEach(question => {
        const card = document.createElement('div');
        card.className = 'question-card';
        
        // Add search-match class if this is a search result and matches the search term
        if (searchTerm && question.text.toLowerCase().includes(searchTerm.toLowerCase())) {
            card.classList.add('search-match');
        }

        // SVG icons for buttons
        const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>`;
        
        const deleteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>`;

        // Highlight search term in question text if provided
        const highlightedText = searchTerm ? highlightText(question.text, searchTerm) : question.text;

        card.innerHTML = `
            <div class="question-header">
                <div class="question-text">${highlightedText}</div>
            </div>
            <div class="question-details">
                <div class="detail-item">
                    <span class="detail-label">Marks</span>
                    <span class="detail-value">${question.marks}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">RBT Level</span>
                    <span class="detail-value">${question.rbt_level}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">CO</span>
                    <span class="detail-value">${question.co}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">PI</span>
                    <span class="detail-value">${question.pi}</span>
                </div>
            </div>
            ${question.image 
                ? `<div class="question-image">
                    <img src="${question.image.replace(/\\/g, '/').includes('static/uploads/') 
                        ? question.image.replace(/\\/g, '/') 
                        : 'static/uploads/' + question.image.replace(/\\/g, '/').replace(/^\//, '')}" 
                        alt="Question Image">
                   </div>`
                : ''}
            <div class="question-actions">
                <button class="action-btn edit-btn" 
                    data-tooltip="Edit this question"
                    onclick="openEditModal(${question.id}, '${escapeString(question.text)}', ${question.marks}, '${question.rbt_level}', '${question.co}', '${question.pi}', '${question.image ? 'static/uploads/' + question.image.replace(/\\/g, '/').replace(/\\/g, '/').replace(/^\//, '') : ''}')">
                    ${editSvg}
                </button>
                <button class="action-btn delete-btn" 
                    data-tooltip="Delete this question"
                    onclick="deleteQuestion(${question.id})">
                    ${deleteSvg}
                </button>
            </div>
        `;

        questionsGrid.appendChild(card);
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
    }, 300);
}

function updateQuestion() {
    const form = document.getElementById('edit-form');
    const formData = new FormData(form);

    fetch(`/update_question`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Refresh active tab questions if update is successful
                const activeTab = document.querySelector('.tab-item.active');
                if (activeTab) {
                    fetchQuestions(activeTab.dataset.id);
                }

                // Close modal after successful update
                closeModal();

                // Show success notification
                showNotification(data.message, 'success');
            } else {
                // Show error notification if backend returns an error
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating question:', error);
            showNotification('Failed to update question', 'error');
        });
}

function deleteQuestion(id) {
    // Add confirmation dialog
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
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