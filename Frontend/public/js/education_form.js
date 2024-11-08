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
    const educationForm = document.getElementById('educationForm');
    const logoutBtn = document.querySelector('.menu-btn.logout');
    const menuBtns = document.querySelectorAll('.menu-btn');
    
    // Form fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const firstNameEnInput = document.getElementById('firstNameEn');
    const lastNameEnInput = document.getElementById('lastNameEn');
    const idNumberInput = document.getElementById('idNumber');
    
    // Radio buttons and sub-fields
    const radioOptions = document.querySelectorAll('input[name="petitionType"]');

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
        idNumberInput.value = ''; // Clear any existing value
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

    // Handle radio button changes
    radioOptions.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all sub-fields first
            document.querySelectorAll('.sub-fields').forEach(field => {
                field.style.display = 'none';
            });
            
            // Hide all sub-options first
            document.querySelectorAll('.sub-options').forEach(option => {
                option.style.display = 'none';
            });

            // Show relevant fields based on selection
            if (this.checked) {
                const parentLabel = this.parentElement;
                const subFields = parentLabel.querySelector('.sub-fields');
                const subOptions = parentLabel.querySelector('.sub-options');
                
                if (subFields) {
                    subFields.style.display = 'grid';
                }
                if (subOptions) {
                    subOptions.style.display = 'block';
                }
            }
        });
    });

    // Handle form submission
    educationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        try {
            toggleLoading(true);

            // Get form subject
            const subject = document.querySelector('input[name="subject"]').value.trim();
            if (!subject) {
                throw new Error('กรุณากรอกเรื่องที่ต้องการยื่นคำร้อง');
            }

            // Get selected petition type
            const selectedType = document.querySelector('input[name="petitionType"]:checked');
            if (!selectedType) {
                throw new Error('กรุณาเลือกประเภทคำร้อง');
            }

            // Get sub-fields values if applicable
            let formData = {
                subject: subject,
                petitionType: selectedType.value
            };

            // Handle different petition types
            switch (selectedType.id) {
                case 'type1':
                case 'type2':
                case 'type3':
                    const subFields = selectedType.parentElement.querySelectorAll('.sub-fields input');
                    const subFieldsData = Array.from(subFields).map(field => ({
                        name: field.placeholder,
                        value: field.value.trim()
                    }));
                    
                    if (subFieldsData.some(field => !field.value)) {
                        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
                    }
                    formData.subFields = subFieldsData;
                    break;
                
                case 'type4':
                    const withdrawalType = document.querySelector('input[name="withdrawalType"]:checked');
                    if (!withdrawalType) {
                        throw new Error('กรุณาเลือกยืนยันการไม่มีภาระหนี้สิน');
                    }
                    formData.withdrawalConfirmation = withdrawalType.value;
                    break;

                case 'type5':
                    const otherReason = selectedType.parentElement.querySelector('.sub-fields input').value.trim();
                    if (!otherReason) {
                        throw new Error('กรุณาระบุเหตุผล');
                    }
                    formData.otherReason = otherReason;
                    break;
            }

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

    // Initialize
    loadUserData();
});