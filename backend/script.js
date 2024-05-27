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
            window.location.href = '/index'; // Redirecționează utilizatorul către pagina index după autentificare cu succes
        })
        .catch(error => {
            errorMessage.textContent = error.message;
        });
    });
});

// Function for Task List
function loadTasks() {
    // Fetch tasks from the server
    fetch('/tasks/list')
        .then(response => response.json())
        .then(tasks => {
            // Display tasks on the page
            const tasksList = document.getElementById('tasks-list');
            tasksList.innerHTML = ''; // Clear existing tasks

            tasks.forEach(task => {
                const listItem = document.createElement('li');
                listItem.textContent = task.title;
                tasksList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}

// Function for Task Edit
function editTask(taskId, baseUrl = '') {
    // Redirect to the edit task page with the task ID
    const newUrl = `${baseUrl}/tasks/edit/${taskId}`;
    window.location.assign(newUrl);
}

// Export the function
module.exports = {
    loadTasks, editTask
};

