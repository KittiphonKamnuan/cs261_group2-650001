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
    const examForm = document.getElementById('examForm');
    const logoutBtn = document.querySelector('.menu-btn.logout');
    const menuBtns = document.querySelectorAll('.menu-btn');
    
    // Form fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const firstNameEnInput = document.getElementById('firstNameEn');
    const lastNameEnInput = document.getElementById('lastNameEn');
    const idNumberInput = document.getElementById('idNumber');
    const otherDocInput = document.querySelector('input[name="otherDocument"]');
    
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

    // Handle document type selection
    document.querySelectorAll('input[name="document"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.id === 'doc4') {
                otherDocInput.style.display = 'block';
                otherDocInput.required = true;
            } else {
                otherDocInput.style.display = 'none';
                otherDocInput.required = false;
                otherDocInput.value = '';
            }
        });
    });

    // Handle form submission
    examForm.addEventListener('submit', async function(event) {
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
            const courseInfo = document.querySelector('input[name="courseInfo"]').value.trim();
            const examDate = document.querySelector('input[name="examDate"]').value;
            const advisor = document.querySelector('input[name="advisor"]').value.trim();
            const reason = document.querySelector('input[name="reason"]').value.trim();
            const conclusion = document.querySelector('input[name="conclusion"]').value.trim();

            // Validate required fields
            if (!courseInfo || !examDate || !advisor || !reason || !conclusion) {
                throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
            }

            // Get selected document
            const selectedDoc = document.querySelector('input[name="document"]:checked');
            if (!selectedDoc) {
                throw new Error('กรุณาเลือกเอกสารที่ต้องการแนบ');
            }

            // Prepare document data
            let documentData = {
                type: selectedDoc.value
            };

            if (selectedDoc.id === 'doc4') {
                const otherDocDetail = otherDocInput.value.trim();
                if (!otherDocDetail) {
                    throw new Error('กรุณาระบุรายละเอียดเอกสารอื่นๆ');
                }
                documentData.detail = otherDocDetail;
            }

            // Prepare form data
            const formData = {
                idNumber: idNumber,
                courseInfo: courseInfo,
                examDate: examDate,
                advisor: advisor,
                reason: reason,
                document: documentData,
                conclusion: conclusion
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