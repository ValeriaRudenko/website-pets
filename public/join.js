
  $(function() {
    $(document).on('submit', 'form', function(event) {
      event.preventDefault();

      var typeofpet = $('input[name="typeofpet"]').val();
      var name = $('input[name="name"]').val();
      var breed = $('input[name="breed"]').val();
      var email = $('input[name="email"]').val();
      var password = $('input[name="password"]').val();
      var repeatPassword = $('input[name="repeatPassword"]').val();
      var type;
      var gender;
      var avatar;

      $.ajax({
        url: 'http://localhost:3000/signup',
        method: 'POST',
        data: {
          typeofpet: typeofpet,
          name: name,
          breed: breed,
          email: email,
          password: password,
          repeatPassword: repeatPassword,
          type: type,
          gender: gender,
          avatar: avatar
        },
        success: function(response) {
          if (response.status === 200) {
            alert('Sign-up successful');
            localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn to true
            window.location.href = '/public/profile.html';
          } else {
            alert('Sign-up failed: ' + response.message);
          }
        },
        error: function() {
          alert('Error occurred while signing up');
        }
      });
    });
  });