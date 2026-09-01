document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var note = document.getElementById("form-note");
  var button = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
    };

    button.disabled = true;
    button.textContent = "Sending...";
    if (note) {
      note.textContent = "";
      note.className = "form-note";
    }

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          if (note) {
            note.textContent = "Message sent successfully! We'll get back to you soon.";
            note.className = "form-note form-note-success";
          }
        } else {
          if (note) {
            note.textContent = result.body && result.body.error ? result.body.error : "Something went wrong. Please try again.";
            note.className = "form-note form-note-error";
          }
        }
      })
      .catch(function () {
        if (note) {
          note.textContent = "Something went wrong. Please check your connection and try again.";
          note.className = "form-note form-note-error";
        }
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Send Message";
      });
  });
});


document.addEventListener("DOMContentLoaded", function () {
  var toggles = document.querySelectorAll(".nav-item.has-dropdown > .dropdown-toggle");

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var item = toggle.closest(".nav-item.has-dropdown");
      var isOpen = item.classList.contains("open");

      toggles.forEach(function (other) {
        other.closest(".nav-item.has-dropdown").classList.remove("open");
        other.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item.has-dropdown")) {
      toggles.forEach(function (toggle) {
        toggle.closest(".nav-item.has-dropdown").classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  });
});