(function () {
  "use strict";

  var messages = [];
  var isLoading = false;

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function buildWidget() {
    var root = el("div", "chatbot-root");

    var toggle = el("button", "chatbot-toggle", "&#128172;");
    toggle.setAttribute("aria-label", "Chat with Alif by Aqsa");
    toggle.type = "button";

    var panel = el("div", "chatbot-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with Alif by Aqsa");

    var header = el("div", "chatbot-header");
    header.innerHTML =
      '<span class="logo-badge chatbot-header-badge"><img src="logo.jpg" alt="Alif by Aqsa" class="logo-photo"></span>' +
      '<span class="chatbot-header-text"><strong>Alif by Aqsa</strong><span>Ask us anything</span></span>';
    var closeBtn = el("button", "chatbot-close", "&times;");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    header.appendChild(closeBtn);

    var body = el("div", "chatbot-body");
    var greeting = el(
      "div",
      "chatbot-msg chatbot-msg-bot",
      "Hi! I'm here to help with anything about our menu, recipes, or how to order. What would you like to know?"
    );
    body.appendChild(greeting);

    var formRow = el("div", "chatbot-input-row");
    var input = el("input", "chatbot-input");
    input.type = "text";
    input.placeholder = "Type a message...";
    input.setAttribute("aria-label", "Your message");
    var sendBtn = el("button", "chatbot-send", "Send");
    sendBtn.type = "button";
    formRow.appendChild(input);
    formRow.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(formRow);

    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);

    function openPanel() {
      root.classList.add("chatbot-open");
      input.focus();
    }
    function closePanel() {
      root.classList.remove("chatbot-open");
    }

    toggle.addEventListener("click", function () {
      if (root.classList.contains("chatbot-open")) {
        closePanel();
      } else {
        openPanel();
      }
    });
    closeBtn.addEventListener("click", closePanel);

    function appendMessage(text, from) {
      var msg = el("div", "chatbot-msg chatbot-msg-" + from, "");
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
      return msg;
    }

    function setLoading(loading) {
      isLoading = loading;
      sendBtn.disabled = loading;
      input.disabled = loading;
    }

    function send() {
      var text = input.value.trim();
      if (!text || isLoading) return;

      appendMessage(text, "user");
      messages.push({ role: "user", content: text });
      input.value = "";
      setLoading(true);

      var typing = appendMessage("...", "bot");

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          typing.remove();
          if (result.ok && result.data.reply) {
            appendMessage(result.data.reply, "bot");
            messages.push({ role: "assistant", content: result.data.reply });
          } else {
            appendMessage(
              result.data.error || "Something went wrong. Please try again.",
              "bot"
            );
          }
        })
        .catch(function () {
          typing.remove();
          appendMessage(
            "Couldn't reach the chat assistant. Please try again later.",
            "bot"
          );
        })
        .finally(function () {
          setLoading(false);
          input.focus();
        });
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
