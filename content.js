(() => {
  'use strict';

  const OLD_ORDER_PATH = '/fsapi/order/v2/listid/all';
  const NEW_ORDER_PATH = '/ecapi/order/v2/index.php/core/order';

  const OLD_REFUND_PATH = '/fsapi/order/v2/listid/refund';
  const NEW_REFUND_PATH = '/fsapi/order/v1/listid/refund';

  function replaceUrl(url) {
    if (typeof url !== 'string') {
      return url;
    }

    if (url.includes(OLD_ORDER_PATH)) {
      return url.replace(OLD_ORDER_PATH, NEW_ORDER_PATH);
    }

    if (url.includes(OLD_REFUND_PATH)) {
      return url.replace(OLD_REFUND_PATH, NEW_REFUND_PATH);
    }

    return url;
  }

  const originalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    const replacedUrl = replaceUrl(url);
    return originalOpen.call(this, method, replacedUrl, ...args);
  };
})();
