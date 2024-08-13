document.getElementById('drop_zone').addEventListener('click', function () {
    document.getElementById('menu_image').click();
});

function dragOverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        showImage(files[0]);
    }
}

function showImage(input) {
    const file = input.files ? input.files[0] : input;
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 300, 300);
                const resizedImage = canvas.toDataURL('image/jpeg');
                document.getElementById('preview').src = resizedImage;
                document.getElementById('image_container').style.display = 'block';
                document.getElementById('label_menu_image').style.display = 'none';
                document.getElementById('drop_zone').style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function deleteImage() {
    document.getElementById('preview').src = '';
    document.getElementById('image_container').style.display = 'none';
    document.getElementById('label_menu_image').style.display = 'block';
    document.getElementById('drop_zone').style.display = 'flex';
    document.getElementById('menu_image').value = '';

    // Reset icon position
    const icon = document.querySelector('#drop_zone i');
    if (icon) {
        icon.style.position = '';
        icon.style.top = '';
        icon.style.left = '';
        icon.style.transform = '';
    }
}
