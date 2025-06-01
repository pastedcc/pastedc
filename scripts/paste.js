function submitPaste() {
    const content = document.getElementById('paste-content').value;
    const expiry = document.getElementById('expiry').value;
    
    if (!content.trim()) {
        alert('Please enter some text');
        return;
    }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    fetch('/submit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `content=${encodeURIComponent(content)}&expiry=${expiry}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            const url = `${window.location.origin}/view.php?id=${data.id}`;
            document.getElementById('paste-url').value = url;
            document.getElementById('result').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create paste');
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Create Paste';
    });
}

function copyUrl() {
    const urlInput = document.getElementById('paste-url');
    urlInput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}

// Dark mode toggle (optional)
const darkModeToggle = document.createElement('button');
darkModeToggle.textContent = 'Toggle Dark Mode';
darkModeToggle.style.position = 'fixed';
darkModeToggle.style.bottom = '20px';
darkModeToggle.style.right = '20px';
darkModeToggle.onclick = () => document.body.classList.toggle('dark');
document.body.appendChild(darkModeToggle);
