document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get('error');

    if (errorType) {
        let errorMessage = '';
        let inputFieldId = '';

        switch (errorType) {
            case 'duplicate_id':
                errorMessage = 'An employee with the same ID already exists.';
                inputFieldId = 'employee_id';
                break;
            case 'duplicate_phone':
                errorMessage = 'An employee with the same phone number already exists.';
                inputFieldId = 'phone_number';
                break;
            case 'duplicate_id_number':
                errorMessage = 'An employee with the same ID number already exists.';
                inputFieldId = 'id_number';
                break;
        }

        if (inputFieldId) {
            const inputField = document.getElementById(inputFieldId);
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `<span style="color: red;">${errorMessage}</span> <i class="warning icon"></i>`;
            inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);

            // Optionally, send feedback back to the server
            sendFeedbackToServer(errorType);
        }
    }
});

function sendFeedbackToServer(errorType) {
    fetch('/path/to/feedback_endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errorType: errorType }),
    })
    .then(response => response.json())
    .then(data => console.log('Feedback sent successfully:', data))
    .catch((error) => console.error('Error sending feedback:', error));
}
