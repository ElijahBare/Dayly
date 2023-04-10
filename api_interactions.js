const saveButton = document.getElementById('save-button');
const entryTextarea = document.querySelector('.entry-container textarea');

saveButton.addEventListener('click', () => {
    (async () => {
        const content = entryTextarea.value;

        try {
            const response = await fetch('http://localhost:5000/api/entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            const jsonResponse = await response.json();

            if (jsonResponse.status === 'success') {
                console.log('Journal entry saved successfully.');
                entryTextarea.value = '';
            } else {
                console.log('Error saving journal entry.');
            }
        } catch (error) {
            console.log('Error connecting to server.');
        }
    })();
});

