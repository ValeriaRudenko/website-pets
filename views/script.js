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
    var commentForm = imageElement.find('.comment-form');
    var formData = new FormData(commentForm[0]);

    $.ajax({
      url: "http://localhost:3000/comments",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.success) {
          var comment = response.comment;
          displayComment(imageElement, comment);
          clearForm(commentForm);
        } else {
          console.error("Error submitting comment.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  }

  function displayComment(imageElement, comment) {
    var commentElement = $("<div class='comment'>")
      .append($("<p>").text(comment.content))
      .append($("<span>").text("By: " + comment.author));

    imageElement.append(commentElement);
  }

  function clearForm(form) {
    form.find("input[type='text']").val("");
  }
});
