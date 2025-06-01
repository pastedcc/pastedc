document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const contentEl = document.getElementById('content');
  const languageEl = document.getElementById('language');
  const expirationEl = document.getElementById('expiration');
  const pasteBtn = document.getElementById('paste-btn');
  const resultContainer = document.querySelector('.result-container');
  const viewContainer = document.querySelector('.view-container');
  const editorContainer = document.querySelector('.editor-container');
  const pasteUrlEl = document.getElementById('paste-url');
  const copyBtn = document.getElementById('copy-btn');
  const newPasteBtn = document.getElementById('new-paste');
  const backBtn = document.getElementById('back-btn');
  const pasteContentEl = document.getElementById('paste-content');
  const pasteLanguageEl = document.getElementById('paste-language').querySelector('.value');
  const pasteViewsEl = document.getElementById('paste-views').querySelector('.value');
  const pasteExpiresEl = document.getElementById('paste-expires').querySelector('.value');
  const themeBtn = document.getElementById('theme-btn');
  const htmlEl = document.documentElement;

  // Check current theme
  const currentTheme = localStorage.getItem('theme') || 'dark';
  htmlEl.setAttribute('data-theme', currentTheme);

  // Check if we're viewing a paste
  const path = window.location.pathname.split('/').filter(p => p);
  if (path.length === 1) {
    loadPaste(path[0]);
  }

  // Initialize particles.js
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: getComputedStyle(document.documentElement).getPropertyValue('--accent') },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: 'var(--accent)', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' }
      }
    }
  });

  // Theme toggle
  themeBtn.addEventListener('click', () => {
    const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update particles color
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom[0].pJS.particles.color.value = 
        getComputedStyle(document.documentElement).getPropertyValue('--accent');
      window.pJSDom[0].pJS.fn.particlesRefresh();
    }
  });

  // Create new paste
  pasteBtn.addEventListener('click', async () => {
    if (!contentEl.value.trim()) {
      showToast('Please enter some content', 'error');
      return;
    }

    try {
      pasteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
      pasteBtn.disabled = true;

      const response = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentEl.value,
          language: languageEl.value,
          expiration: parseInt(expirationEl.value)
        })
      });

      const data = await response.json();

      if (data.success) {
        const url = `${window.location.origin}/${data.pasteId}`;
        pasteUrlEl.value = url;
        editorContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        showToast('Paste created successfully!', 'success');
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast('Failed to create paste', 'error');
      console.error(err);
    } finally {
      pasteBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Create Paste';
      pasteBtn.disabled = false;
    }
  });

  // Copy URL to clipboard
  copyBtn.addEventListener('click', () => {
    pasteUrlEl.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
    
    showToast('URL copied to clipboard', 'success');
  });

  // Create new paste
  newPasteBtn.addEventListener('click', () => {
    contentEl.value = '';
    resultContainer.classList.add('hidden');
    editorContainer.classList.remove('hidden');
    contentEl.focus();
  });

  // Back to editor
  backBtn.addEventListener('click', () => {
    window.location.href = '/';
  });

  // Load paste from URL
  async function loadPaste(pasteId) {
    try {
      showLoading();
      const response = await fetch(`/api/paste/${pasteId}`);
      const data = await response.json();

      if (data.success) {
        const paste = data.paste;
        pasteContentEl.textContent = paste.content;
        pasteLanguageEl.textContent = paste.language.charAt(0).toUpperCase() + paste.language.slice(1);
        pasteViewsEl.textContent = paste.views;

        if (paste.expiration) {
          const expires = new Date(paste.expiration);
          pasteExpiresEl.textContent = expires.toLocaleString();
        } else {
          pasteExpiresEl.textContent = 'Never';
        }

        editorContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        viewContainer.classList.remove('hidden');

        // Apply syntax highlighting
        const language = paste.language === 'plaintext' ? null : paste.language;
        if (language) {
          pasteContentEl.className = language;
          hljs.highlightElement(pasteContentEl);
        }
      } else {
        if (response.status === 404) {
          showErrorPage('Paste not found', 'The requested paste doesn\'t exist or may have been deleted.');
        } else if (response.status === 410) {
          showErrorPage('Paste expired', 'This paste has expired and is no longer available.');
        }
      }
    } catch (err) {
      showErrorPage('Connection Error', 'Failed to load the paste. Please try again later.');
      console.error(err);
    } finally {
      hideLoading();
    }
  }

  // Helper functions
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <p>Loading paste...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }

  function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
  }

  function showErrorPage(title, message) {
    document.body.innerHTML = `
      <div class="container">
        <div class="error-container glass">
          <h1><i class="fas fa-exclamation-triangle"></i> ${title}</h1>
          <p>${message}</p>
          <a href="/" class="glow"><i class="fas fa-arrow-left"></i> Back to Home</a>
        </div>
      </div>
    `;
  }
});

// Add CSS for toast and loader
const style = document.createElement('style');
style.textContent = `
  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1000;
  }
  
  .toast-success {
    background: #4CAF50;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
  
  .toast-error {
    background: #F44336;
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  }
  
  .toast.show {
    opacity: 1;
  }
  
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .loader-content {
    text-align: center;
    color: white;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--accent);
    animation: spin 1s ease-in-out infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-container {
    padding: 2rem;
    text-align: center;
    max-width: 500px;
    margin: 5rem auto;
  }
  
  .error-container h1 {
    color: #F44336;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .error-container a {
    margin-top: 1.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }
`;
document.head.appendChild(style);
