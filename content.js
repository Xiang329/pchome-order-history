(() => {
  'use strict';
  const BASE_URL = 'https://ecvip.pchome.com.tw';

  const NEW_ORDER_PATH = '/fsapi/order/v2/listid/all';
  const OLD_ORDER_PATH = '/ecapi/order/v2/index.php/core/order';

  const NEW_REFUND_PATH = '/fsapi/order/v2/listid/refund';
  const OLD_REFUND_PATH = '/fsapi/order/v1/listid/refund';

  const xhr = XMLHttpRequest.prototype;
  const { open, send } = xhr;

  xhr.open = function (method, url, ...args) {
    const u = new URL(url, BASE_URL);

    // Order API
    if (u.pathname === NEW_ORDER_PATH) {
      this._searchQuery = u.searchParams.get('q');

      if (this._searchQuery) {
        this._isOrderId = /^\d{14}$/.test(this._searchQuery);
        if (this._isOrderId) {
          this._searchUrl = u;
          return open.call(this, method, url, ...args);
        }
      }

      u.pathname = OLD_ORDER_PATH;
      return open.call(this, method, u.href, ...args);
    }

    // Refund API
    if (u.pathname === NEW_REFUND_PATH) {
      u.pathname = OLD_REFUND_PATH;
      return open.call(this, method, u.href, ...args);
    }

    // Other API
    return open.call(this, method, url, ...args);
  };

  xhr.send = function (body) {
    if (!this._searchQuery || !this._isOrderId) {
      return send.call(this, body);
    }

    searchOrder(this._searchUrl, this._searchQuery)
      .then(json => {
        const text = JSON.stringify(json);

        Object.defineProperties(this, {
          readyState: { value: 4, configurable: true },
          status: { value: 200, configurable: true },
          statusText: { value: 'OK', configurable: true },
          responseText: { value: text, configurable: true },
          response: {
            value: this.responseType === 'json' ? json : text,
            configurable: true
          }
        });

        ['readystatechange', 'load', 'loadend']
          .forEach(type => this.dispatchEvent(new Event(type)));
      })
      .catch(err => {
        console.error('[PChome API Shim]', err);

        ['error', 'loadend']
          .forEach(type => this.dispatchEvent(new Event(type)));
      });
  };

  /**
   * 使用舊版 API 取得所有訂單，模擬新版 API 搜尋訂單結果
   * @param {URL} source
   * @param {string} id
   * @returns {Promise<object>}
   */
  async function searchOrder(source, id) {
    const url = new URL(OLD_ORDER_PATH, BASE_URL);

    // 複製除了搜尋 / 分頁之外的參數
    for (const [key, value] of source.searchParams) {
      if (!['q', 'offset', 'limit'].includes(key)) {
        url.searchParams.set(key, value);
      }
    }

    url.searchParams.set('limit', 100);
    let offset = 1;
    while (true) {
      url.searchParams.set('offset', offset);

      const res = await fetch(url, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const rows = json.Rows ?? [];
      const found = rows.find(row => String(row.Id) === id);
      if (found) {
        return { ...json, TotalRows: 1, Rows: [found] };
      }

      const total = Number(json.TotalRows) || 0;
      if (!rows.length || offset + rows.length > total) {
        return { ...json, TotalRows: 0, Rows: [] };
      }

      offset += rows.length;
    }
  }
  console.debug('[PChome API Shim] enabled');
})();
