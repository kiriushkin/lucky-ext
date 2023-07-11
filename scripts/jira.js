(() => {
  const css = `.copy-btn {
  display: inline;
  margin-inline: 5px;
  cursor: pointer;
  pointer-events: all;
  position: relative;
}

.copy-btn::after {
  content: 'Copied';

  position: absolute;
  top: -5px;
  right: -65px;
  padding: 5px;

  width: 50px;

  text-align: center;

  border-radius: 5px;
  background-color: #33333333;

  opacity: 0;
  transition: .3s;
  color: #fff;
}

.copy-btn.copied::after {
  opacity: 1;
}

.open-link {
  text-decoration: none;
}
`;

  const style = document.createElement('style');
  style.innerText = css;

  document.body.appendChild(style);

  const block = document.querySelector('#description-val');

  if (!block) return;

  const els = [];

  block.querySelectorAll('p').forEach((el) => {
    if (el.textContent.includes(' - ') && !el.innerHTML.includes('<a'))
      els.push(el);
  });

  els.forEach((el) => {
    const lines = el.innerHTML.split('<br>');

    const pairs = lines.map((line) => line.split(' - '));

    const newLines = pairs.map((pair) => {
      const value = pair[1];

      if (!value) return pair[0];

      const button = document.createElement('div');
      button.classList.add('copy-btn');
      button.innerHTML = '🔗';
      button.dataset.value = value;

      return pair[0] + ' - ' + value + button.outerHTML;
    });

    el.innerHTML = newLines.join('<br>');
  });

  document.querySelectorAll('.copy-btn').forEach(
    (btn) =>
      (btn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.value);

        btn.classList.add('copied');

        setTimeout(() => {
          btn.classList.remove('copied');
        }, 1000);
      })
  );
})();

(() => {
  const linksBox = document.querySelector('.flooded');

  if (!linksBox) return;

  const isMac = navigator.userAgent.match('Mac OS X');

  const lines = linksBox.innerHTML.split('<br>');

  const links = lines.filter((line) =>
    line.match(/https:\/\/[a-z0-9]+\.[a-z]+/)
  );

  const firstLine = lines[0].trim();
  const lastLink =
    links.length > 0
      ? links[links.length - 1]
        ? links[links.length - 1].trim()
        : links[0].trim()
      : '';

  const [devLink] = firstLine.match(/^.+\.[a-z]+/);
  const [prodLink] = lastLink
    ? lastLink.match(/https:\/\/[a-z0-9]+\.[a-z]+/)
    : '';

  const path1 = isMac ? devLink : devLink.replace(/_[a-z]{2}/, '');
  const path2 = firstLine.replace(devLink, '');

  const prodDomain = prodLink ? prodLink.replace('https://', '') : '';

  const [devDomain] = path1.match(/[a-z]+-[a-z]+.[a-z]+/);

  const href = isMac
    ? `shortcuts://run-shortcut?name=Lucky&input=path1=${path1}+path2=${path2}`
    : `lucky://path1=${path1}&path2=${path2}`;

  lines[0] = `${
    lines[0]
  } <a href="${href}" class="open-link">⬆️</a> <a target="_blank" href="https://lt-tracker.pro/cloudflare/domains?q=${devDomain}${
    prodDomain ? '&blank=' + prodDomain : ''
  }">🔁</a>`;

  linksBox.innerHTML = lines.join('<br>');
})();
