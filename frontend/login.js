/* ==========================================================================
   CRATE Analytics - Login & Registration Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Current Mode: 'signin' | 'signup'
  let currentTab = 'signin';

  // --- Theme Management ---
  const savedTheme = localStorage.getItem('crate_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('crate_theme', 'light');
      } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem('crate_theme', 'dark');
      }
    });
  }

  // --- Password Visibility Toggle ---
  const passwordInput = document.getElementById('password');
  const togglePassBtn = document.getElementById('btn-toggle-password');
  const eyeShow = togglePassBtn?.querySelector('.eye-show');
  const eyeHide = togglePassBtn?.querySelector('.eye-hide');

  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (isPassword) {
        eyeShow.classList.add('hidden');
        eyeHide.classList.remove('hidden');
      } else {
        eyeShow.classList.remove('hidden');
        eyeHide.classList.add('hidden');
      }
    });
  }

  // --- Tab Switching (Sign In vs Create Account) ---
  const tabSignIn = document.getElementById('tab-signin');
  const tabSignUp = document.getElementById('tab-signup');

  const groupFullName = document.getElementById('group-fullname');
  const groupOrg = document.getElementById('group-org');
  const groupConfirmPass = document.getElementById('group-confirm-password');
  const groupRemember = document.getElementById('remember-group');
  const groupTerms = document.getElementById('terms-group');

  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const submitBtnText = document.getElementById('submit-btn-text');
  const footerText = document.getElementById('footer-text');
  const btnForgotPassword = document.getElementById('btn-forgot-password');

  function switchTab(tab) {
    currentTab = tab;
    clearErrors();

    if (tab === 'signin') {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('active');
      tabSignUp.setAttribute('aria-selected', 'false');

      groupFullName.classList.add('hidden');
      groupOrg.classList.add('hidden');
      groupConfirmPass.classList.add('hidden');
      groupTerms.classList.add('hidden');

      groupRemember.classList.remove('hidden');
      if (btnForgotPassword) btnForgotPassword.style.display = 'inline-block';

      authTitle.textContent = 'Welcome back';
      authSubtitle.textContent = 'Enter your credentials to access your analytics dashboard.';
      submitBtnText.textContent = 'Sign In to Dashboard';

      footerText.innerHTML = `Don't have a CRATE account? <a href="#" id="link-switch-tab" data-target="signup">Create an account for free</a>`;
    } else {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'false');

      groupFullName.classList.remove('hidden');
      groupOrg.classList.remove('hidden');
      groupConfirmPass.classList.remove('hidden');
      groupTerms.classList.remove('hidden');

      groupRemember.classList.add('hidden');
      if (btnForgotPassword) btnForgotPassword.style.display = 'none';

      authTitle.textContent = 'Create your account';
      authSubtitle.textContent = 'Get started with free open-source community retention analytics.';
      submitBtnText.textContent = 'Create Free Account';

      footerText.innerHTML = `Already have an account? <a href="#" id="link-switch-tab" data-target="signin">Sign in here</a>`;
    }

    // Re-bind footer switch link
    const switchLink = document.getElementById('link-switch-tab');
    if (switchLink) {
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = switchLink.getAttribute('data-target');
        switchTab(target);
      });
    }
  }

  tabSignIn.addEventListener('click', () => switchTab('signin'));
  tabSignUp.addEventListener('click', () => switchTab('signup'));

  const initialSwitchLink = document.getElementById('link-switch-tab');
  if (initialSwitchLink) {
    initialSwitchLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('signup');
    });
  }

  // --- Form Validation Helpers ---
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach((el) => (el.style.display = 'none'));
    document.querySelectorAll('.form-control').forEach((el) => el.classList.remove('is-invalid'));
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) alertBox.classList.add('hidden');
  }

  function showError(fieldId, errorId, message) {
    const input = document.getElementById(fieldId);
    const errSpan = document.getElementById(errorId);
    if (input) input.classList.add('is-invalid');
    if (errSpan) {
      if (message) errSpan.textContent = message;
      errSpan.style.display = 'block';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Form Submission Handler ---
  const authForm = document.getElementById('auth-form');
  const btnSubmit = document.getElementById('btn-submit');
  const spinner = btnSubmit?.querySelector('.btn-spinner');

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const emailVal = document.getElementById('email').value.trim();
    const passVal = document.getElementById('password').value.trim();

    let hasError = false;

    if (!isValidEmail(emailVal)) {
      showError('email', 'error-email', 'Please enter a valid work email.');
      hasError = true;
    }

    if (!passVal || passVal.length < 8) {
      showError('password', 'error-password', 'Password must be at least 8 characters long.');
      hasError = true;
    }

    if (currentTab === 'signup') {
      const nameVal = document.getElementById('fullname').value.trim();
      const confirmPassVal = document.getElementById('confirm-password').value.trim();
      const termsChecked = document.getElementById('terms-agree').checked;

      if (!nameVal) {
        showError('fullname', 'error-fullname', 'Full name is required.');
        hasError = true;
      }

      if (passVal !== confirmPassVal) {
        showError('confirm-password', 'error-confirm-password', 'Passwords do not match.');
        hasError = true;
      }

      if (!termsChecked) {
        const termsErr = document.getElementById('error-terms');
        if (termsErr) termsErr.style.display = 'block';
        hasError = true;
      }
    }

    if (hasError) return;

    // Simulate Network Request / Login API
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      const userSession = {
        name: currentTab === 'signup' ? document.getElementById('fullname').value.trim() : (emailVal.split('@')[0].replace('.', ' ') || 'Alex Rivers'),
        email: emailVal,
        avatarInitials: currentTab === 'signup' ? getInitials(document.getElementById('fullname').value) : 'AR',
        org: document.getElementById('orgname')?.value.trim() || 'CRATE Maintainers',
        role: 'Maintainer',
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('crate_user', JSON.stringify(userSession));

      showToast(currentTab === 'signin' ? 'Welcome back! Redirecting to dashboard...' : 'Account created! Loading your dashboard...');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }, 900);
  });

  function setLoading(loading) {
    if (loading) {
      btnSubmit.disabled = true;
      submitBtnText.style.opacity = '0.5';
      spinner.classList.remove('hidden');
    } else {
      btnSubmit.disabled = false;
      submitBtnText.style.opacity = '1';
      spinner.classList.add('hidden');
    }
  }

  // Helper to extract initials
  function getInitials(nameStr) {
    if (!nameStr) return 'AR';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  // --- OAuth Login Simulators ---
  const btnGithubOAuth = document.getElementById('btn-oauth-github');
  const btnGoogleOAuth = document.getElementById('btn-oauth-google');

  if (btnGithubOAuth) {
    btnGithubOAuth.addEventListener('click', () => {
      showToast('Authenticating with GitHub OAuth...');
      setTimeout(() => {
        const githubUser = {
          name: 'Alex Rivers',
          email: 'alex.rivers@github.dev',
          avatarInitials: 'AR',
          org: 'OpenSource-Core-Team',
          provider: 'GitHub',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('crate_user', JSON.stringify(githubUser));
        showToast('GitHub connected successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 700);
    });
  }

  if (btnGoogleOAuth) {
    btnGoogleOAuth.addEventListener('click', () => {
      showToast('Authenticating with Google Workspace...');
      setTimeout(() => {
        const googleUser = {
          name: 'Alex Rivers',
          email: 'alex.rivers@gmail.com',
          avatarInitials: 'AR',
          org: 'DevRel Team',
          provider: 'Google',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('crate_user', JSON.stringify(googleUser));
        showToast('Google account verified! Redirecting...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 700);
    });
  }

  // --- Forgot Password Modal ---
  const btnForgot = document.getElementById('btn-forgot-password');
  const forgotModal = document.getElementById('forgot-modal');
  const btnCloseForgot = document.getElementById('btn-close-forgot');
  const btnCancelForgot = document.getElementById('btn-cancel-forgot');
  const btnSendReset = document.getElementById('btn-send-reset');
  const resetEmailInput = document.getElementById('reset-email');

  if (btnForgot && forgotModal) {
    btnForgot.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('show');
    });
  }

  function closeForgotModal() {
    if (forgotModal) forgotModal.classList.remove('show');
  }

  if (btnCloseForgot) btnCloseForgot.addEventListener('click', closeForgotModal);
  if (btnCancelForgot) btnCancelForgot.addEventListener('click', closeForgotModal);

  if (btnSendReset) {
    btnSendReset.addEventListener('click', () => {
      const email = resetEmailInput.value.trim();
      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.');
        return;
      }
      closeForgotModal();
      showToast(`Password reset link sent to ${email}`);
    });
  }

  // --- Toast Helper ---
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
});
