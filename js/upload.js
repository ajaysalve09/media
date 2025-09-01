const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const uploadLabel = document.querySelector('.upload-label');

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.style.display = 'block';
    uploadLabel.style.display = 'none';
  }
});

function saveDraft() {
  const caption = document.getElementById('caption').value;
  const photo = photoInput.files[0];
  if (photo || caption) {
    alert('Draft saved! (Backend storage integration needed)');
  } else {
    alert('Nothing to save.');
  }
}

function discardPost() {
  document.getElementById('caption').value = '';
  photoInput.value = '';
  photoPreview.style.display = 'none';
  uploadLabel.style.display = 'block';
}

function publishPost() {
  const caption = document.getElementById('caption').value;
  const photo = photoInput.files[0];
  if (!photo) {
    alert('Please select a photo to post.');
    return;
  }
  alert('Post published! (Implement backend upload)');
  discardPost();
}
