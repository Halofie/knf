document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  // Select the <g id="eyeIcon"> inside the SVG
  const eyeIcon = document.querySelector('#togglePassword svg #eyeIcon');

  if (toggleBtn && passwordInput && eyeIcon) {
    toggleBtn.addEventListener('click', function () {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      // Toggle eye/eye-slash icon
      if (type === 'text') {
        eyeIcon.innerHTML = `
          <path d="M13.359 11.238l2.122 2.122a.75.75 0 1 1-1.06 1.06l-2.122-2.121A7.97 7.97 0 0 1 8 13.5c-5 0-8-5.5-8-5.5a15.634 15.634 0 0 1 3.34-3.778l-2.12-2.12a.75.75 0 1 1 1.06-1.06l14 14a.75.75 0 0 1-1.06 1.06l-2.122-2.122zM8 12.5c1.657 0 3.156-.672 4.359-1.762l-1.415-1.415A3.5 3.5 0 0 1 8 11.5a3.5 3.5 0 0 1-3.5-3.5c0-.828.293-1.588.776-2.176L3.64 4.762A13.133 13.133 0 0 0 1.172 8c.058.087.122.183.195.288.335.48.83 1.12 1.465 1.755C4.121 11.332 5.88 12.5 8 12.5z"/>
          <path d="M8 5.5a2.5 2.5 0 0 1 2.45 2.02l-3.97-3.97A2.5 2.5 0 0 1 8 5.5z"/>
        `;
      } else {
        eyeIcon.innerHTML = `
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.12 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.133 13.133 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
        `;
      }
    });
  }
});

  // Show error if ?error=1 in URL
const params = new URLSearchParams(window.location.search);
  if (params.get('error') === '1') {
    document.getElementById('loginError').style.display = 'block';
}