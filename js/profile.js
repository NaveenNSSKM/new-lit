/**
 * Profile Page Controller
 */

let activeUser = null;

// Initialize Profile Page
const initProfile = async () => {
  activeUser = await window.authAPI.getUser();
  
  const lockScreen = document.getElementById('profile-lock-screen');
  const dashboard = document.getElementById('profile-dashboard-content');

  if (!activeUser) {
    // Show lock screen
    if (lockScreen) lockScreen.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    
    document.getElementById('lock-login-btn')?.addEventListener('click', () => {
      document.getElementById('auth-modal')?.classList.add('show');
    });
    return;
  }

  // User verified, show dashboard
  if (lockScreen) lockScreen.style.display = 'none';
  if (dashboard) dashboard.style.display = 'grid';

  prefillProfileData();
  setupProfileListeners();
};

// Fill input fields with loaded profile data
const prefillProfileData = () => {
  document.getElementById('profile-name').value = activeUser.full_name || "";
  document.getElementById('profile-email').value = activeUser.email || "";
  document.getElementById('profile-phone').value = activeUser.phone || "";
  document.getElementById('profile-address').value = activeUser.address || "";
  
  const avatar = document.getElementById('profile-avatar-large');
  if (avatar && activeUser.profile_image) {
    avatar.src = activeUser.profile_image;
  }
};

// Bind submit event actions
const setupProfileListeners = () => {
  // Logout link in sidebar
  document.getElementById('profile-logout-sidebar-btn')?.addEventListener('click', async () => {
    await window.authAPI.signOut();
    window.showToast("Signed out successfully.");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  });

  // Edit Details Submit
  document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const address = document.getElementById('profile-address').value.trim();
    const avatarImg = document.getElementById('profile-avatar-large').src;

    const { error } = await window.authAPI.updateProfile(name, phone, address, avatarImg);

    if (error) {
      window.showToast(error.message, "danger");
    } else {
      window.showToast("Profile settings saved successfully.");
      
      // Update global header representation
      if (typeof window.updateAuthHeader === 'function') {
        window.updateAuthHeader();
      }
    }
  });

  // Change Password Submit
  document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pass = document.getElementById('profile-pass-new').value;
    const confirm = document.getElementById('profile-pass-confirm').value;

    if (pass.length < 8) {
      window.showToast("Password must be at least 8 characters.", "danger");
      return;
    }
    if (pass !== confirm) {
      window.showToast("Passwords do not match.", "danger");
      return;
    }

    const { error } = await window.authAPI.changePassword(pass);

    if (error) {
      window.showToast(error.message, "danger");
    } else {
      window.showToast("Password updated successfully.");
      document.getElementById('change-password-form').reset();
    }
  });

  // Photo Selector conversion to base64
  document.getElementById('avatar-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64 = evt.target.result;
        const img = document.getElementById('profile-avatar-large');
        if (img) img.src = base64;
        window.showToast("Photo updated. Click 'Save Account Profile' to save changes.");
      };
      reader.readAsDataURL(file);
    }
  });
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initProfile();
});
