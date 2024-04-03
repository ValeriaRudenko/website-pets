$(document).on('submit', 'form', function(event) {
  event.preventDefault();

  var email = $('input[name="email"]').val();
  var password = $('input[name="password"]').val();

  $.ajax({
    url: 'http://localhost:3000/signin',
    method: 'POST',
    data: {
      email: email,
      password: password
    },
    success: function(response) {
      if (response.status === 200) {
        localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn to true
        window.location.href = '/public/profile.html';
      } else {
        alert('Invalid email or password');
      }
    },
    error: function() {
      alert('Error occurred during login');
    }
  });


});

