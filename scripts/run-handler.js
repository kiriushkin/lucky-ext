import ClassWatcher from './ClassWatcher.js';

const isMac = navigator.userAgent.match('Mac OS X');
const { settings } = await chrome.storage.sync.get('settings');

const menu = document.querySelector('[data-menu="run"]');
const input = menu.querySelector('#command');
const errorEl = menu.querySelector('.error');

const onMenuHide = () => {
  input.value = '';
  errorEl.style.display = 'none';
  errorEl.textContent = '';
};

const onMenuShow = () => {
  setTimeout(() => {
    input.focus();
  }, 400);
};

const classWatcher = new ClassWatcher(
  menu,
  'menu_hide',
  onMenuHide,
  onMenuShow
);

input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (!input.value) return throwError('The command must be entered');

  const [command, ...args] = input.value.split(' ');

  if (command === 'open') {
    const link = args[0].replace(/https?:\/\//, '');

    const domain = link.match(/^.+\.[a-z]+/);

    if (!domain) return throwError('Invalid link');

    const path1 =
      isMac || settings.underscoreInReposPath.value
        ? domain
        : domain.replace(/_[a-z]{2}/, '');
    const path2 = link.replace(domain, '');

    // return throwError(path1 + '\n' + path2);

    const dest = isMac
      ? `shortcuts://run-shortcut?name=Lucky&input=path1=${path1}+path2=${path2}`
      : `lucky://path1=${path1}&path2=${path2}`;

    open(dest);
  } else {
    throwError('Unknown command');
  }

  input.value = '';
});

function throwError(error) {
  errorEl.textContent = error;
  errorEl.style.display = '';
  input.value = '';
}
