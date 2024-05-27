// test/tasks-list.test.js
let loadTasks = require('../backend/script.js').loadTasks; 

describe('Task List Functionality', () => {
    beforeAll(() => {
        document.body.innerHTML = `<ul id="tasks-list"></ul>`;
    });
    it('should fetch and load tasks from the server', async () => {
        // Mocking the fetch function to return sample tasks
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve([
                { _id: '1', title: 'Task 1' },
                { _id: '2', title: 'Task 2' },
                { _id: '3', title: 'Task 3' },
            ]),
        });

        // Call the loadTasks function
        await loadTasks();

        // Check if the tasks are loaded and displayed correctly
        const tasksList = document.getElementById('tasks-list');
        setTimeout(() => {
            expect(tasksList.children.length).toBe(3);
            expect(tasksList.children[0].textContent).toBe('Task 1');
            expect(tasksList.children[1].textContent).toBe('Task 2');
            expect(tasksList.children[2].textContent).toBe('Task 3');
        }, 500); // Adjust the timeout as needed
    });
});
