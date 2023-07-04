loadTails();
getFormData();

const DEFAULT_TITLE = 'Handy Shtuchka';

const mainMenu = document.querySelector('[data-menu="main"]');
const header = document.querySelector('h3');

let isCtrl = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Control') isCtrl = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Control') isCtrl = false;
});

mainMenu.querySelectorAll('.menu__item').forEach((item) => {
  item.addEventListener('click', () => {
    mainMenu.classList.add('menu_hide');
    document
      .querySelector(`[data-menu="${item.dataset.target}"]`)
      .classList.remove('menu_hide');

    header.innerText = item.dataset.target;
  });
});

const backBtns = document.querySelectorAll('.menu__back').forEach((btn) => {
  btn.addEventListener('click', () => {
    mainMenu.classList.remove('menu_hide');
    btn.parentElement.classList.add('menu_hide');

    header.innerText = DEFAULT_TITLE;
  });
});

const tailsAddBtn = document.querySelector(
  '[data-menu="tails"] .menu__item_add'
);

tailsAddBtn.addEventListener('click', () => {
  const name = prompt('Name:', 'sun');
  const tail = prompt('Tail:', '?sun=0');

  addTail(name, tail);
});

function loadTails() {
  if (!localStorage.getItem('tails'))
    return localStorage.setItem('tails', '[]');

  const tails = JSON.parse(localStorage.getItem('tails'));

  tails.forEach((item) => {
    appendTail(item);
  });
}

function addTail(name, tail) {
  const tails = JSON.parse(localStorage.getItem('tails'));

  tails.push({ name, tail });

  localStorage.setItem('tails', JSON.stringify(tails));

  appendTail({ name, tail }, false);
}

function appendTail(item, first = true) {
  const tailsMenu = document.querySelector(
    '[data-menu="tails"] .menu__container'
  );

  const el = document.createElement('div');
  el.classList.add('menu__item');
  const p = document.createElement('p');
  el.dataset.tail = item.tail;

  p.innerText = item.name;

  p.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (isCtrl) chrome.tabs.update(tab.id, { url: tab.url + item.tail });
    else chrome.tabs.create({ url: tab.url + item.tail });
  });

  el.appendChild(p);

  const hint = document.createElement('div');
  hint.classList.add('menu__item-hint');
  hint.innerText = item.tail;

  el.appendChild(hint);

  const icons = document.createElement('div');
  icons.classList.add('menu__item-btns');

  const deleteBtn = document.createElement('img');
  deleteBtn.src = 'icons/trash.svg';
  deleteBtn.addEventListener('click', async (e) => {
    deleteTail(e.target.parentElement.parentElement.dataset.tail);
  });

  const editBtn = document.createElement('img');
  editBtn.src = 'icons/pencil.svg';
  editBtn.addEventListener('click', async (e) => {
    editTail(e.target.parentElement.parentElement.dataset.tail);
  });

  icons.appendChild(editBtn);
  icons.appendChild(deleteBtn);

  el.appendChild(icons);

  if (first) tailsMenu.insertBefore(el, tailsMenu.firstChild);
  else tailsMenu.insertBefore(el, tailsMenu.querySelector('.menu__item_add'));

  return el;
}

function editTail(tail) {
  const tails = JSON.parse(localStorage.getItem('tails'));
  const item = tails.find((item) => item.tail === tail);

  const newName = prompt('Name:', item.name);
  const newTail = prompt('Tail:', item.tail);

  const index = tails.findIndex((i) => i === item);

  tails[index] = { name: newName, tail: newTail };

  localStorage.setItem('tails', JSON.stringify(tails));

  const tailEl = document.querySelector(`[data-tail="${tail}"]`);

  tailEl.querySelector('p').innerText = newName;
  tailEl.dataset.tail = newTail;
}

function deleteTail(tail) {
  const tails = JSON.parse(localStorage.getItem('tails'));
  const newTails = tails.filter((item) => item.tail !== tail);

  localStorage.setItem('tails', JSON.stringify(newTails));

  document.querySelector(`[data-tail="${tail}"]`).remove();
}

async function getFormData() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const data = await chrome.tabs.sendMessage(tab.id, 'get_form_data');

  const formMenu = document.querySelector(
    '[data-menu="form"] .menu__container'
  );

  const nameContainer = formMenu.querySelector('[data-subcontainer="name"]');
  const phoneContainer = formMenu.querySelector('[data-subcontainer="phone"]');
  const submitContainer = formMenu.querySelector(
    '[data-subcontainer="submit"]'
  );

  if (data.name) {
    const minLength = document.createElement('div');
    minLength.classList.add('menu__subtext');
    minLength.innerText = `Min Length: `;

    let value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.name.minLength;

    minLength.appendChild(value);

    const required = document.createElement('div');
    required.classList.add('menu__subtext');
    required.innerText = `Empty Is Not Allowed: `;

    value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.name.required;

    required.appendChild(value);

    nameContainer.appendChild(minLength);
    nameContainer.appendChild(required);
  } else {
    const text = document.createElement('div');
    text.classList.add('menu__subtext');
    text.innerText = `Field not found`;

    nameContainer.appendChild(text);
  }

  if (data.phone) {
    const minLength = document.createElement('div');
    minLength.classList.add('menu__subtext');
    minLength.innerText = `Min Length: `;

    let value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.phone.minLength;

    minLength.appendChild(value);

    const maxLength = document.createElement('div');
    maxLength.classList.add('menu__subtext');
    maxLength.innerText = `Max Length: `;

    value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.phone.maxLength;

    maxLength.appendChild(value);

    const required = document.createElement('div');
    required.classList.add('menu__subtext');
    required.innerText = `Empty Is Not Allowed: `;

    value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.phone.required;

    required.appendChild(value);

    const digital = document.createElement('div');
    digital.classList.add('menu__subtext');
    digital.innerText = `Digital Keyboard: `;

    value = document.createElement('span');
    value.classList.add('menu__subtext_highlight');
    value.innerText = data.phone.type == 'tel';

    digital.appendChild(value);

    phoneContainer.appendChild(minLength);
    phoneContainer.appendChild(maxLength);
    phoneContainer.appendChild(required);
    phoneContainer.appendChild(digital);
  } else {
    const text = document.createElement('div');
    text.classList.add('menu__subtext');
    text.innerText = `Field not found`;

    phoneContainer.appendChild(text);
  }

  if (data.submit) {
    const text = document.createElement('div');
    text.classList.add('menu__subtext');
    text.innerText = `Button is available`;

    submitContainer.appendChild(text);

    const submitBtn = document.createElement('div');
    submitBtn.classList.add('menu__item');

    const p = document.createElement('p');
    p.innerText = 'Send Form';

    submitBtn.appendChild(p);

    submitBtn.addEventListener('click', async () => {
      const name = prompt('Name:', 'test');
      const tel = prompt('Phone:', '');

      await chrome.tabs.sendMessage(tab.id, `send_form ${name} ${tel}`);
    });

    formMenu.appendChild(submitBtn);
  } else {
    const text = document.createElement('div');
    text.classList.add('menu__subtext');
    text.innerText = `Button not found`;

    submitContainer.appendChild(text);
  }
}
