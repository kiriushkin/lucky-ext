chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'get_form_data') {
    const data = {};

    const nameInput = document.querySelector('[name="name"]');
    if (nameInput)
      data.name = {
        minLength: nameInput.minLength,
        required: nameInput.required,
      };

    const telInput = document.querySelector('[name="phone"]');
    if (telInput)
      data.phone = {
        minLength: telInput.minLength,
        maxLength: telInput.maxLength,
        type: telInput.type,
        required: telInput.required,
      };

    const submit = document.querySelector('[type="submit"]');
    if (submit) data.submit = true;

    sendResponse(data);
  }

  if (msg === 'get_lang') {
    const lang = document.documentElement.lang;
    sendResponse(lang);
  }

  if (msg.match('send_form')) {
    const [cmd, name, tel] = msg.split(' ');

    const nameInput = document.querySelector('[name="name"]');
    const telInput = document.querySelector('[name="phone"]');
    const sendBtn = document.querySelector('[type="submit"]');

    nameInput.value = name;
    telInput.value = tel;

    sendBtn.click();
  }
});

// yam logger
(() => {
  const elements = document.querySelectorAll('noscript');

  let yamEl;

  elements.forEach((el) => {
    if (el.innerHTML.match(/mc.yandex.ru\/watch\//)) return (yamEl = el);
  });

  if (!yamEl) return;

  const yam = +yamEl.innerHTML.match(/watch\/\d+/)[0].split('/')[1];

  console.log('Current yam:', yam);
})();
