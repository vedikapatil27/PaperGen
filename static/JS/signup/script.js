document.addEventListener('DOMContentLoaded', function () {
    // Select all password fields
    const passwordFields = document.querySelectorAll('input[type="password"]');

    passwordFields.forEach(passwordInput => {
        // Create toggle button
        const togglePassword = document.createElement("button");
        togglePassword.type = "button"; // Prevent form submission
        togglePassword.className = "toggle-password";
        togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
        togglePassword.setAttribute("aria-label", "Toggle password visibility");

        // Add the toggle button to the password field container
        passwordInput.parentElement.appendChild(togglePassword);

        // Add event listener to toggle visibility
        togglePassword.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent form submission
            e.stopPropagation(); // Stop event from bubbling

            // Toggle password visibility
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                this.innerHTML = '<i class="fas fa-eye"></i>';
            } else {
                passwordInput.type = "password";
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            }

            // Focus back on the input
            passwordInput.focus();
        });
    });




    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirm-password');
    const role = document.querySelector('#role');
    const messageBox = document.querySelector('#messageBox');


    // ✅ Show error using SweetAlert
    function showError(input, message) {
        input.style.borderColor = 'red';
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: message,
            toast: true,
            showConfirmButton: false,
            timer: 4000
        });
    }

    // ✅ Show success or error messages using SweetAlert
    function showMessage(type, message) {
        Swal.fire({
            position: 'top-end',
            icon: type, // 'success' or 'error'
            title: message,
            toast: true,
            showConfirmButton: false,
            timer: 2000
        });
    }

    // ✅ Handle form submission
    function submitForm() {
        const signupBtn = document.querySelector('.signup-btn');
        signupBtn.textContent = 'Creating Account...';
        signupBtn.style.opacity = '0.7';
        signupBtn.disabled = true;


        setTimeout(() => {
            // ✅ Prepare data to send to Flask backend
        const data = {
            username: username.value,
            email: email.value,
            password: password.value,
            confirm_password: confirmPassword.value,
            role: role.value
        };

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    showMessage('success', data.message);
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    showMessage('error', data.message);
                    resetButtonState(signupBtn);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('error', 'An error occurred. Please try again.');
                resetButtonState(signupBtn);
            });
        }, 1200);

    }

    // ✅ Validate form inputs
    function validateForm() {
        let isValid = true;
        console.log('functioncalled');


        // ✅ Reset input borders
        [username, email, password, confirmPassword, role].forEach(input => {
            input.style.borderColor = '';
        });

        // ✅ Username validation
        if (!username.value.trim()) {
            showError(username, 'Username is required');
            isValid = false;
        }

        // ✅ Email validation
        if (!validateEmail(email.value)) {
            showError(email, 'Invalid email format');
            isValid = false;
        }

        // ✅ Password strength validation
        if (!isValidPassword(password.value)) {
            showError(password, 'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character');
            isValid = false;
        }

        // ✅ Password match validation
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }

        // ✅ Role validation
        if (!role.value) {
            showError(role, 'Role is required');
            isValid = false;
        }

        return isValid;
    }

    // ✅ Trigger validation and submission on button click
    document.querySelector('.signup-btn').addEventListener('click', (e) => {
        e.preventDefault(); // ✅ Prevent default form submission

        if (validateForm()) {
            submitForm(); // ✅ Only call POST if validation passes
        }
    });

    // ✅ Reset button state after failure
    function resetButtonState(button) {
        button.textContent = 'Sign Up';
        button.style.opacity = '1';
        button.disabled = false;
    }

    // ✅ Email and password format validators
    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function isValidPassword(password) {
        const re = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return re.test(password);
    }




    // Reset border color on input focus
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.style.borderColor = '#4299e1';

            // Remove error message if exists
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });

    // Add subtle animation to the form on load
    const signupBox = document.querySelector('.signup-box');
    setTimeout(() => {
        signupBox.style.opacity = '1';
    }, 100);
});
