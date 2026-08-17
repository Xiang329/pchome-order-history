# PChome 歷史訂單查詢

這是一個擴充功能，用於恢復 PChome 原先的歷史訂單查詢功能，讓使用者可繼續查詢三年前的訂單紀錄。

## 原理

當使用者前往 `https://24h.pchome.com.tw/vip/order` 訂單頁面時，擴充功能會在該頁面攔截以下請求並進行替換：

**訂單查詢(支援商品名稱搜尋)**

原 API：

```text
/fsapi/order/v2/listid/all
```

替換為：

```text
/ecapi/order/v2/index.php/core/order
```

**退款查詢**

原 API：

```text
/fsapi/order/v2/listid/refund
```

替換為：

```text
/fsapi/order/v1/listid/refund
```

## 手動安裝方式

1. 下載此專案並解壓縮
2. 打開瀏覽器並前往 `擴充功能` 頁面（`chrome://extensions/`或`edge://extensions/`）
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」並選擇本專案資料夾
5. 完成！

## License

MIT License
