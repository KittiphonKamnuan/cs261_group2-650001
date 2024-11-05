// API.js

// TU API Configuration
const API_CONFIG = {
    BASE_URL: 'https://restapi.tu.ac.th/api/v1',
    APP_KEY: 'TUce8ebe796d66cb8fab75a309d97313858aabb8ab12527f50f6093f9168c64bfbfabdae8117c844c83176aebdb1e5b50e',
    ENDPOINTS: {
        AUTH: '/auth/Ad/verify'
    }
};

// TU API Authentication
async function authenticateWithTUAPI(username, password) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Application-Key': API_CONFIG.APP_KEY
            },
            body: JSON.stringify({
                UserName: username,
                PassWord: password
            })
        });

        // Check HTTP Status
        switch (response.status) {
            case 200:
                break; // Continue processing
            case 400:
                throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            case 401:
                throw new Error('ไม่พบ Application-Key โปรดติดต่อผู้ดูแลระบบ');
            case 403:
                throw new Error('Application-Key ไม่ถูกต้อง โปรดติดต่อผู้ดูแลระบบ');
            default:
                throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }

        const data = await response.json();

        // Check API Response Status
        if (!data.status) {
            throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }

        // Store user data in session storage
        if (data.status) {
            const userData = {
                username: data.username,
                type: data.type,
                displayNameTH: data.displayname_th,
                displayNameEN: data.displayname_en,
                email: data.email,
                department: data.department,
                // Student specific data
                tuStatus: data.tu_status,
                statusId: data.statusid,
                faculty: data.faculty,
                // Employee specific data
                statusWork: data.StatusWork,
                statusEmp: data.StatusEmp,
                organization: data.organization
            };

            sessionStorage.setItem('userData', JSON.stringify(userData));
            sessionStorage.setItem('authToken', 'authenticated'); // For session management
        }

        return data;
    } catch (error) {
        console.error('TU API Error:', error);
        throw error;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return !!sessionStorage.getItem('authToken');
}

// Get stored user data
function getUserData() {
    try {
        const userData = sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Get user type (student or employee)
function getUserType() {
    const userData = getUserData();
    return userData?.type || null;
}

// Export functions
export {
    authenticateWithTUAPI,
    isAuthenticated,
    getUserData,
    getUserType,
    logout
};