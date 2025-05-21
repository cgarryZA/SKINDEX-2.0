async function includeComponent(htmlId, htmlUrl, cssUrl) {
  // 1) inject the component CSS into <head>
  if (cssUrl) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);
  }
  // 2) fetch & inject the HTML
  const placeholder = document.getElementById(htmlId);
  const rsp = await fetch(htmlUrl);
  placeholder.innerHTML = await rsp.text();
}