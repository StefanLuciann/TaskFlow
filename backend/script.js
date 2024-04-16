document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = form.elements['username'].value;
        const password = form.elements['password'].value;

        // Verifică dacă ambele câmpuri sunt completate
        if (username.trim() === '' || password.trim() === '') {
            errorMessage.textContent = 'Please fill in all fields.';
            return;
        }

        // Trimite datele la server
        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid username or password.');
            }
            // Aici poți redirecționa utilizatorul sau efectua alte acțiuni în funcție de răspunsul serverului
        })
        .catch(error => {
            errorMessage.textContent = error.message;
        });
    });
});
