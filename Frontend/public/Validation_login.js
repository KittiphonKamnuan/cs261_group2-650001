document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.src = 'img/eye-open.png';
        } else {
            passwordInput.type = 'password';
            togglePassword.src = 'img/eye-closed.png';
        }
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Clear previous errors
        document.getElementById('usernameError').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';
        document.getElementById('roleError').style.display = 'none';

        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim();
        const role = document.getElementById('role').value;

        let isValid = true;

        // Username validation
        if (!username) {
            document.getElementById('usernameError').textContent = 'Username is required.';
            document.getElementById('usernameError').style.display = 'block';
            isValid = false;
        } else if (username.length < 4) {
            document.getElementById('usernameError').textContent = 'Username must be at least 4 characters long.';
            document.getElementById('usernameError').style.display = 'block';
            isValid = false;
        }

        // Password validation
        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required.';
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters long.';
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        // Role validation
        if (!role) {
            document.getElementById('roleError').textContent = 'Please select your role.';
            document.getElementById('roleError').style.display = 'block';
            isValid = false;
        }

        // If validation passes, redirect based on role
        if (isValid) {
            if (role === 'student') {
                window.location.href = 'Student_history.html';
            } else if (role === 'lecturer') {
                window.location.href = 'Lecturer_history.html';
            }
        }
    });
});