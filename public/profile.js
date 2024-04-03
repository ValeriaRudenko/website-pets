$(function() {
  $('#navbar').load('navbar.html');

  $.ajax({
    url: 'http://localhost:3000/profile',
    method: 'GET',
    success: function(response) {
      $('#name').val(response.name);
      $('#breed').val(response.breed);
      $('#description').val(response.description);
    },
    error: function() {
      alert('Error occurred while loading user data');
    }
  });

  function saveUserData() {
    var name = $('#name').val();
    var breed = $('#breed').val();
    var description = $('#description').val();
    var password = $('#password').val();

    $.ajax({
      url: 'http://localhost:3000/profile',
      method: 'POST',
      data: {
        name: name,
        breed: breed,
        description: description,
        password: password
      },
      success: function(response) {
        alert('User data saved successfully');
      },
      error: function() {
        alert('Error occurred while saving user data');
      }
    });
  }

  function saveAvatar() {
    var avatarFile = document.getElementById('avatar-input').files[0];
    var formData = new FormData();
    formData.append('avatar', avatarFile);

    var maxSize = 2 * 1024 * 1024; // 2MB
    if (avatarFile.size > maxSize) {
      alert('Error: Please upload an image smaller than 2MB.');
      return;
    }

    var maxDimension = 1024;
    var image = new Image();
    image.src = URL.createObjectURL(avatarFile);
    image.onload = function() {
      if (image.width > maxDimension || image.height > maxDimension) {
        alert('Error: Please upload an image with dimensions not exceeding 1024x1024.');
        return;
      }
      var canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, 100, 100);

      var resizedAvatarDataUrl = canvas.toDataURL('image/jpeg');
      document.getElementById('avatar-preview-image').src = resizedAvatarDataUrl;

      var requestOptions = {
        method: 'POST',
        body: formData
      };

      fetch('http://localhost:3000/avatars', requestOptions)
        .then(data => {
          alert('Avatar saved successfully');
        })
        .catch(error => {
          alert('Error occurred while saving the avatar');
        });
    };
  }

  function showSavedAvatar() {
    $.ajax({
      url: 'http://localhost:3000/avatars/filename',
      method: 'GET',
      success: function(response) {
        // Display user's avatar
        if (response.avatar) {
          $('#avatar-preview-image').attr('src', '/uploads/' + response.avatar);
        }
      },
      error: function() {
        alert('Error occurred while loading user data');
      }
    });
  }

  showSavedAvatar();

  $(document).on('click', '#avatar-button', saveAvatar);
  $(document).on('click', '#name + .btn-2', saveUserData);
  $(document).on('click', '#breed + .btn-2', saveUserData);
  $(document).on('click', '#description + .btn-2', saveUserData);
  $(document).on('click', '#password + .btn-2', saveUserData);
});
