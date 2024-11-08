// Import API functions
import { isAuthenticated, getUserData, logout } from '../js/API.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = '../index.html';
        return;
    }

    // DOM Elements
    const loadingOverlay = document.querySelector('.loading-overlay');
    const studentName = document.querySelector('.student-name');
    const studentId = document.querySelector('.student-id');
    const guardianForm = document.getElementById('guardianForm');
    const logoutBtn = document.querySelector('.menu-btn.logout');
    const menuBtns = document.querySelectorAll('.menu-btn');
    
    // Form fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const firstNameEnInput = document.getElementById('firstNameEn');
    const lastNameEnInput = document.getElementById('lastNameEn');
    const idNumberInput = document.getElementById('idNumber');
    const otherReasonInput = document.querySelector('.reason-input');
    
    // Function to show/hide loading overlay
    function toggleLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // Function to show error modal
    function showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const modalMessage = document.getElementById('modalMessage');
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    // Load user data from API
    async function loadUserData() {
        try {
            toggleLoading(true);
            const userData = getUserData();
            
            if (!userData) {
                throw new Error('ไม่พบข้อมูลผู้ใช้');
            }

            // Display student name and ID in sidebar
            studentName.textContent = `${userData.displayNameTH || 'ไม่พบข้อมูล'}`;
            studentId.textContent = userData.username || 'ไม่พบข้อมูล';

            // Split display names
            let thNames = userData.displayNameTH ? userData.displayNameTH.split(' ') : ['', ''];
            let enNames = userData.displayNameEN ? userData.displayNameEN.split(' ') : ['', ''];

            // Populate form fields
            firstNameInput.value = thNames[0] || '';
            lastNameInput.value = thNames[1] || '';
            firstNameEnInput.value = enNames[0] || '';
            lastNameEnInput.value = enNames[1] || '';
            
            // Set ID number field to be editable
            idNumberInput.removeAttribute('disabled');
            idNumberInput.value = '';
            idNumberInput.placeholder = 'กรุณากรอกเลขประจำตัวประชาชน';

        } catch (error) {
            console.error('Error loading user data:', error);
            showErrorModal('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            toggleLoading(false);
        }
    }

    // Handle menu navigation
    menuBtns.forEach(button => {
        button.addEventListener('click', function() {
            if (this === logoutBtn) {
                handleLogout();
                return;
            }

            menuBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            switch(this.textContent.trim()) {
                case 'ข้อมูลส่วนตัว':
                    window.location.href = '../Student_history.html';
                    break;
                case 'เขียนคำร้อง':
                    window.location.href = '../petition_type.html';
                    break;
                case 'ตรวจสอบสถานะคำร้อง':
                    window.location.href = '../check_status.html';
                    break;
            }
        });
    });

    // Handle permission type selection
    document.querySelectorAll('input[name="permissionType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.id === 'type5') {
                otherReasonInput.style.display = 'block';
                otherReasonInput.required = true;
            } else {
                otherReasonInput.style.display = 'none';
                otherReasonInput.required = false;
                otherReasonInput.value = '';
            }
        });
    });

    // Handle form submission
    guardianForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        try {
            toggleLoading(true);

            // Validate ID card number
            const idNumber = idNumberInput.value.trim();
            if (!idNumber) {
                throw new Error('กรุณากรอกเลขประจำตัวประชาชน');
            }
            if (!/^\d{13}$/.test(idNumber)) {
                throw new Error('เลขประจำตัวประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
            }

            // Get form field values
            const subject = document.querySelector('input[name="subject"]').value.trim();
            const guardianName = document.querySelector('input[name="guardianName"]').value.trim();
            const relationship = document.querySelector('input[name="relationship"]').value.trim();

            // Validate required fields
            if (!subject || !guardianName || !relationship) {
                throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
            }

            // Get selected permission type
            const selectedPermission = document.querySelector('input[name="permissionType"]:checked');
            if (!selectedPermission) {
                throw new Error('กรุณาเลือกประเภทการยินยอม');
            }

            // Prepare permission data
            let permissionData = {
                type: selectedPermission.value
            };

            // If "Other" is selected, validate and include reason
            if (selectedPermission.id === 'type5') {
                const otherReason = otherReasonInput.value.trim();
                if (!otherReason) {
                    throw new Error('กรุณาระบุเหตุผล');
                }
                permissionData.reason = otherReason;
            }

            // Prepare form data
            const formData = {
                idNumber: idNumber,
                subject: subject,
                guardianName: guardianName,
                relationship: relationship,
                permission: permissionData
            };

            console.log('Form Data:', formData);
            // TODO: Send form data to API
            
            showErrorModal('ส่งคำร้องเรียบร้อยแล้ว');
            
            setTimeout(() => {
                window.location.href = '../check_status.html';
            }, 2000);

        } catch (error) {
            console.error('Form submission error:', error);
            showErrorModal(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            toggleLoading(false);
        }
    });

    // Handle logout
    function handleLogout() {
        try {
            logout();
        } catch (error) {
            showErrorModal('ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง');
        }
    }

    // Handle modal interactions
    document.querySelector('.close-modal')?.addEventListener('click', () => {
        document.getElementById('errorModal').style.display = 'none';
    });

    document.querySelector('.modal-btn')?.addEventListener('click', () => {
        document.getElementById('errorModal').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('errorModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.getElementById('errorModal').style.display = 'none';
        }
    });

    // Initialize form
    loadUserData();
});