import './scripts/run-handler.js';
import langs from './languages.mjs';

loadTails();
loadLangs();
loadSettings();
getFormData();

const DEFAULT_TITLE = 'Handy Shtuchka';

const mainMenu = document.querySelector('[data-menu="main"]');
const header = document.querySelector('h3');

let isCtrl = false;

const DEFAULT_SETTINGS = {
  pullAndOpenFeature: {
    title: 'Pull&Open Feature',
    type: 'checkbox',
    value: false,
  },
  clearCacheFeature: {
    title: 'Clear Cache Feature',
    type: 'checkbox',
    value: false,
  },
  localHostLink: {
    title: 'Localhost Link',
    type: 'checkbox',
    value: false,
  },
  underscoreInReposPath: {
    title: 'Underscore In Repos Path',
    type: 'checkbox',
    value: false,
  },
};

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

async function loadTails() {
  await migrateFromLocalStorage();

  if (!(await chrome.storage.sync.get('tails'))?.tails?.length > 0)
    return await chrome.storage.sync.set({ tails: [] });

  const { tails } = await chrome.storage.sync.get('tails');

  tails.forEach((item) => {
    appendTail(item);
  });
}

async function addTail(name, tail) {
  const { tails } = await chrome.storage.sync.get('tails');

  tails.push({ name, tail });

  await chrome.storage.sync.set({ tails });

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

async function editTail(tail) {
  const { tails } = await chrome.storage.sync.get('tails');
  const item = tails.find((item) => item.tail === tail);

  const newName = prompt('Name:', item.name);
  const newTail = prompt('Tail:', item.tail);

  const index = tails.findIndex((i) => i === item);

  tails[index] = { name: newName, tail: newTail };

  await chrome.storage.sync.set({ tails });

  const tailEl = document.querySelector(`[data-tail="${tail}"]`);

  tailEl.querySelector('p').innerText = newName;
  tailEl.dataset.tail = newTail;
}

async function deleteTail(tail) {
  const { tails } = await chrome.storage.sync.get('tails');
  const newTails = tails.filter((item) => item.tail !== tail);

  await chrome.storage.sync.set({ tails: newTails });

  document.querySelector(`[data-tail="${tail}"]`).remove();
}

async function loadLangs() {
  const select = document.querySelector('#langs-list');
  langs.forEach((_) => {
    const option = document.createElement('option');
    option.value = _.code;
    option.textContent = _.language;

    select.appendChild(option);
  });

  const days = document.querySelector('#days');
  const months = document.querySelector('#months');
  const format = document.querySelector('#format-list');

  select.addEventListener('change', generateDateCode);
  days.addEventListener('change', generateDateCode);
  months.addEventListener('change', generateDateCode);
  format.addEventListener('change', generateDateCode);

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const data = await chrome.tabs.sendMessage(tab.id, 'get_lang');

    if (data) select.querySelector(`[value="${data}"]`).selected = true;

    console.log(data);

    generateDateCode();
  } catch (error) {
    console.log(error);
    generateDateCode();
  }

  const code = document.querySelector('#date-code');
  code.addEventListener('click', (e) => {
    navigator.clipboard.writeText(e.target.textContent);
    e.target.classList.toggle('highlighted');
    setTimeout(() => {
      e.target.classList.toggle('highlighted');
    }, 1000);
  });
}

function generateDateCode() {
  const select = document.querySelector('#langs-list').value;
  const days = document.querySelector('#days').value;
  const months = document.querySelector('#months').value;
  const format = document.querySelector('#format-list').value;

  let daysText = '';
  let monthsText = '';

  if (days !== 0)
    daysText = `let d = new Date();d.setDate(d.getDate() + ${days});`;

  if (daysText && months !== 0)
    monthsText = `d.setMonth(d.getMonth() + ${months});`;
  else if (!daysText && months !== 0)
    monthsText = `let d = new Date();d.setMonth(d.getMonth() + ${months});`;

  const config = {
    dateStyle:
      format === 'short' || format === 'long' || format === 'full'
        ? format
        : undefined,
    month: format === 'month' ? 'long' : undefined,
    year: format === 'year' ? 'numeric' : undefined,
    day: format === 'day' ? 'numeric' : undefined,
    weekday: format === 'weekday' ? 'long' : undefined,
  };

  const scriptText = `(() => {${daysText}${monthsText}document.write(${
    daysText || monthsText ? 'd' : '(new Date())'
  }.toLocaleDateString('${select}', ${JSON.stringify(config)}))})();`;
  const scriptEl = document.createElement('script');

  scriptEl.innerText = scriptText;

  const codeEl = document.querySelector('#date-code');
  codeEl.textContent = scriptEl.outerHTML;
}

async function getFormData() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const data = await chrome.tabs.sendMessage(tab.id, 'get_form_data');

    const formMenu = document.querySelector(
      '[data-menu="form"] .menu__container'
    );

    const nameContainer = formMenu.querySelector('[data-subcontainer="name"]');
    const phoneContainer = formMenu.querySelector(
      '[data-subcontainer="phone"]'
    );
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
  } catch (error) {}
}

async function loadSettings() {
  if (!(await chrome.storage.sync.get('settings'))?.settings)
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });

  const { settings } = await chrome.storage.sync.get('settings');

  console.log(settings);

  const keys = Object.keys(DEFAULT_SETTINGS);

  keys.forEach((key) => {
    if (!settings[key]) settings[key] = DEFAULT_SETTINGS[key];
  });

  appendSettings(settings);
}

function appendSettings(settings) {
  const settingsMenu = document.querySelector(
    '[data-menu="settings"] .menu__container'
  );

  Object.entries(settings).forEach(([key, value]) => {
    const item = document.createElement('div');
    item.classList.add('menu__item');
    item.classList.add('menu__item_fs');

    const element = document.createElement('input');
    element.id = key;
    element.setAttribute('type', value.type);
    if (value.type === 'checkbox') element.checked = value.value;

    element.addEventListener('change', async () => {
      const { settings } = await chrome.storage.sync.get('settings');

      const newSettings = {
        ...settings,
        [key]: {
          ...value,
          value: element.type === 'checkbox' ? element.checked : element.value,
        },
      };

      await chrome.storage.sync.set({ settings: newSettings });

      console.log(await chrome.storage.sync.get('settings'));
    });

    item.appendChild(element);

    if (value.type === 'checkbox') {
      const label = document.createElement('label');
      label.innerText = value.title;
      label.setAttribute('for', key);
      item.appendChild(label);
    }

    settingsMenu.appendChild(item);
  });
}

async function migrateFromLocalStorage() {
  if ((await chrome.storage.sync.get('tails'))?.tails?.length > 0) return;

  const tails = JSON.parse(localStorage.getItem('tails'));
  await chrome.storage.sync.set({ tails });
}
