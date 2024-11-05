// Import functions from API.js
import { authenticateWithTUAPI } from './API.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const roleSelect = document.getElementById('role');
    const loginButton = document.querySelector('.login-btn');
    const buttonText = loginButton.querySelector('.btn-text');
    const spinner = loginButton.querySelector('.spinner');

    // Error messages in Thai
    const errorMessages = {
        username: {
            required: 'กรุณากรอกชื่อผู้ใช้',
            length: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร'
        },
        password: {
            required: 'กรุณากรอกรหัสผ่าน',
            length: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
            invalid: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        },
        role: {
            required: 'กรุณาเลือกสถานะผู้ใช้งาน'
        },
        system: {
            error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        }
    };

    // Function to show/hide loading state
    function setLoadingState(isLoading) {
        loginButton.disabled = isLoading;
        if (isLoading) {
            spinner.style.display = 'block';
            buttonText.textContent = 'กำลังเข้าสู่ระบบ...';
        } else {
            spinner.style.display = 'none';
            buttonText.textContent = 'เข้าสู่ระบบ';
        }
    }

    // Function to show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Function to clear all error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => element.style.display = 'none');
    }

    // Function to validate fields
    function validateFields() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;

        const isValid = username !== '' && password !== '' && role !== '';
        loginButton.disabled = !isValid;

        return isValid;
    }

    // Add input event listeners
    usernameInput.addEventListener('input', validateFields);
    passwordInput.addEventListener('input', validateFields);
    roleSelect.addEventListener('change', validateFields);

    // Initial validation check
    validateFields();

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const img = this.querySelector('img');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            img.src = 'img/eye-open.png';
            img.alt = 'ซ่อนรหัสผ่าน';
        } else {
            passwordInput.type = 'password';
            img.src = 'img/eye-closed.png';
            img.alt = 'แสดงรหัสผ่าน';
        }
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearErrors();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;

        let isValid = true;

        // Validation
        if (!username) {
            showError('usernameError', errorMessages.username.required);
            isValid = false;
        } else if (username.length < 4) {
            showError('usernameError', errorMessages.username.length);
            isValid = false;
        }

        if (!password) {
            showError('passwordError', errorMessages.password.required);
            isValid = false;
        } else if (password.length < 6) {
            showError('passwordError', errorMessages.password.length);
            isValid = false;
        }

        if (!role) {
            showError('roleError', errorMessages.role.required);
            isValid = false;
        }

        if (isValid) {
            try {
                setLoadingState(true);
                const response = await authenticateWithTUAPI(username, password);

                // Check user type matches selected role
                if (response.status && 
                    ((role === 'student' && response.type === 'student') || 
                     (role === 'lecturer' && response.type === 'employee'))) {
                    
                    // Redirect based on role
                    window.location.href = role === 'student' ? 'Student_history.html' : 'Lecturer_history.html';
                } else if (response.status) {
                    // User type doesn't match selected role
                    showError('roleError', 'กรุณาเลือกสถานะผู้ใช้งานให้ถูกต้อง');
                } else {
                    showError('passwordError', errorMessages.password.invalid);
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('passwordError', error.message || errorMessages.system.error);
            } finally {
                setLoadingState(false);
            }
        }
    });
});