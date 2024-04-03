$(function () {
  $("#uploadForm").on("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(this);

    $.ajax({
      url: "http://localhost:3000/gallery",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.success) {
          var imageUrl = response.imageUrl;
          var description = formData.get("description");
          displayImage(imageUrl, description);
          clearForm();
          alert("Image uploaded successfully");
        } else {
          console.error("Error uploading image.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  });


  function displayImage(imageUrl, description) {
    var imageElement = $("<div class='image'>")
      .append($("<img>").attr("src", imageUrl))
      .append($("<p>").text(description));

    var commentForm = $("<form class='comment-form'>")
      .append($("<input type='text' name='comment' style='margin-right: 10px;' placeholder='Leave a comment' required>"))
      .append($("<input type='text' name='author' style='margin-right: 10px;' placeholder='Your name' required>"))
      .append($("<button type='submit'>Submit</button>").on("click", function(event) {
        event.preventDefault();
        submitComment($(this).closest('.image'));
      }));      

    imageElement.append(commentForm);

    $("#imageContainer").prepend(imageElement);
  }

  function submitComment(imageElement) {
    var commentForm = imageElement.find(".comment-form");
    var comment = commentForm.find("input[name='comment']").val();
    var author = commentForm.find("input[name='author']").val();

    var formData = {
      comment_text: comment,
      userId: author
    };

    $.ajax({
      url: "http://localhost:3000/comments",
      type: "POST",
      data: formData,
      success: function (response) {
        if (response.success) {
          var comment = response.comment;
          displayComment(imageElement, comment.comment_text, comment.author);
          commentForm[0].reset();
        } else {
          console.error("Error submitting comment.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  }

  // Function to display a comment on the image
  function displayComment(imageElement, commentText, author) {
    var commentElement = $("<div class='comment'>")
      .append($("<p>").text(commentText))
      .append($("<span>").text(" - " + author));

    imageElement.append(commentElement);
  }

  // Function to clear the form inputs
  function clearForm() {
    $("#uploadForm")[0].reset();
  }

  // Load existing comments on page load
  $(window).on('load', function () {
    $.ajax({
      url: "http://localhost:3000/comments",
      type: "GET",
      success: function (response) {
        if (response.success) {
          var comments = response.comments;
          for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];
            var imageElement = $(".image:has(p:contains('" + comment.photo_id + "'))");
            if (imageElement.length) {
              displayComment(imageElement, comment.comment_text, comment.author);
            }
          }
        } else {
          console.error("Error loading comments.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  });

});

