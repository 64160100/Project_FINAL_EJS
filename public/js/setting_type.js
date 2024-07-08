var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

// Function to open the modal
btn.onclick = function () {
    modal.style.display = "block";
};

// Function to close the modal and redirect
function closeModalAndRedirect() {
    modal.style.display = "none";
    window.location.href = "/setting_type"; // Redirect immediately after closing
}

// Attach closeModalAndRedirect to the close button
span.onclick = closeModalAndRedirect;

// Close the modal and redirect when clicking outside of the modal
window.onclick = function (event) {
    if (event.target == modal) {
        closeModalAndRedirect();
    }
};

// Simplified function to close the modal and redirect, ensuring a single action
function togglePopup() {
    closeModalAndRedirect(); // Use the existing function for consistency
}