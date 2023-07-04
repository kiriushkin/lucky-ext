(() => {
  const result = location.search.match(/q=[a-z]+-?[a-z0-9]+.[a-z]+/);
  const blankResult = location.search.match(/blank=[a-z0-9]+.[a-z]+/);

  closeTab();

  if (!result) return;

  if (blankResult)
    window.open(
      location.origin +
        location.pathname +
        `?${blankResult[0].replace('blank=', 'q=')}`,
      '_blank'
    );

  const domain = result[0].replace('q=', '');
  const input = document.querySelector('#dt-filter-search');
  const btn = document.querySelector('#data-table-search');

  input.value = domain;
  btn.click();
  clearCache();

  function clearCache() {
    const btn = document.querySelector('.material-icons.i-hover');

    if (!btn) return setTimeout(clearCache, 300);

    btn.click();

    closeTab();
  }

  function closeTab() {
    const toast = document.querySelector('.toast.success');

    if (!toast) return setTimeout(closeTab, 300);

    setTimeout(() => {
      window.close();
      console.log('aga');
    }, 1000);
  }
})();
