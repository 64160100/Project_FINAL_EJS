    function validatePassword() {
        const password = document.getElementById('password').value;
        // Regular expressions for checks
        const lengthCheck = /^.{8,30}$/;
        const specialCharacterCheck = /[!@#$%^&*]/;
        const lowerAndUpperCaseCheck = /^(?=.*[a-z])(?=.*[A-Z])/;

        // Update icons based on validation results
        updateIcon('icon-alphabet', lengthCheck.test(password));
        updateIcon('icon-special-characters', specialCharacterCheck.test(password));
        updateIcon('icon-lower-case-letters', lowerAndUpperCaseCheck.test(password));

        // Check if all conditions are met
        const allConditionsMet = lengthCheck.test(password) && specialCharacterCheck.test(password) && lowerAndUpperCaseCheck.test(password);

        // Enable or disable the submit button based on the conditions
        document.getElementById('confirm-btn').disabled = !allConditionsMet;

        // Additionally check if passwords match
        validatePasswordsMatch(); // Ensure this is called to check matching passwords
    }

    // Updates the icon based on validation result
    function updateIcon(elementId, isValid) {
        const element = document.getElementById(elementId);
        element.className = ''; // Clear previous icons
        element.classList.add('icon-placeholder');
        if (isValid) {
            element.classList.add('bx', 'bx-check', 'green');
        } else {
            element.classList.add('bx', 'bx-x', 'red');
        }
    }

    // Validates if password and confirm password match
    function validatePasswordsMatch() {
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirm_password').value;
        var feedbackIcon = document.getElementById('confirm-password-feedback-icon');

        // Clear previous icons and colors
        feedbackIcon.classList.remove('bx', 'bx-check', 'bx-x', 'green', 'red');

        if (password === confirmPassword) {
            feedbackIcon.classList.add('bx', 'bx-check', 'green'); // Correct combination
            // Enable the confirm button if all other conditions are met
            validatePassword(); // Re-check all conditions including matching passwords
        } else {
            feedbackIcon.classList.add('bx', 'bx-x', 'red'); // Incorrect combination
            document.getElementById('confirm-btn').disabled = true; // Disable the confirm button
        }
    }

    // Toggles the visibility of password and confirm password fields
    function togglePassword() {
        var passwordField = document.getElementById("password");
        var confirmPasswordField = document.getElementById("confirm_password");
        var showIcons = document.querySelectorAll(".bxs-ghost");
        var hideIcons = document.querySelectorAll(".bx-ghost");

        // Toggle for the "password" field
        if (passwordField.type === "password") {
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }

        // Toggle for the "confirm_password" field
        if (confirmPasswordField.type === "password") {
            confirmPasswordField.type = "text";
        } else {
            confirmPasswordField.type = "password";
        }

        // Toggle icons visibility
        showIcons.forEach(icon => {
            icon.style.display = icon.style.display === "none" ? "block" : "none";
        });
        hideIcons.forEach(icon => {
            icon.style.display = icon.style.display === "none" ? "block" : "none";
        });
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('password').addEventListener('input', validatePassword);
        document.getElementById('confirm_password').addEventListener('input', validatePasswordsMatch);
    });