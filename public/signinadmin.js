$(function() {
  $(document).on('submit', function(event) {
      event.preventDefault();

      var formData = {
        username: $('input[name=username]').val(),
        password: $('input[name=password]').val()
      };
  
      $.ajax({
        url: 'http://localhost:3000/signinadmin',
        type: 'POST',
        data: formData,
        success: function(response) {
            if (response.status === 200) {
              localStorage.setItem('isLoggedInAdmin', 'true'); // Set isLoggedIn(Adminka_) to true
              window.location.href = '/public/index.html';
            } else {
              alert('Invalid username or password');
            }
          },
          error: function() {
            alert('Error occurred during login');
          }
        });
    });
  });