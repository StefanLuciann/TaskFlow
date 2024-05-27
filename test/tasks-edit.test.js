// test/task-edit.test.js

let editTask = require('../backend/script.js').editTask;

describe('Task Edit Functionality', () => {
    it('should redirect to the edit task page with the specified task ID', () => {
        const taskId = '123';

        // Mock window.location.assign function
        const mockAssign = jest.fn();
        delete window.location;
        window.location = { assign: mockAssign };

        // Call the editTask function with a sample task ID and base URL
        editTask(taskId, 'http://localhost');

        // Construct the expected URL
        const expectedUrl = 'http://localhost/tasks/edit/123';

        // Check if the function calls window.location.assign with the correct URL
        expect(mockAssign).toHaveBeenCalledWith(expectedUrl);
    });
});
