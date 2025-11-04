// Example JS for your blog app: handling “Like” button, maybe confirmations, image preview etc.

// Like button handler
document.addEventListener('DOMContentLoaded', function() {
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async function(event) {
      const postId = this.dataset.postid;
      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ })  // maybe you send user info or just the postId
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // assume { likesCount: <newCount> }
        const likeCountSpan = document.getElementById('likeCount');
        if (likeCountSpan && data.likesCount !== undefined) {
          likeCountSpan.textContent = data.likesCount;
        }
      } catch (err) {
        console.error('Error liking the post:', err);
      }
    });
  }

  // Image preview for upload (on create/edit post)
  const imageInput = document.getElementById('images') || document.getElementById('newImages');
  if (imageInput) {
    imageInput.addEventListener('change', function(event) {
      const previewContainerId = 'imagePreviewContainer';
      let previewContainer = document.getElementById(previewContainerId);
      if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = previewContainerId;
        this.parentNode.insertBefore(previewContainer, this.nextSibling);
      }
      previewContainer.innerHTML = ''; // clear previous previews
      Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '150px';
          img.style.marginRight = '10px';
          img.style.marginBottom = '10px';
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }
});
