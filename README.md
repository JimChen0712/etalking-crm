# Etalking CRM 增強面板 (Etalking CRM Overlay)

這是一個專為 Etalking 業務團隊量身打造的 CRM 系統增強外掛（Bookmarklet / Tampermonkey 腳本）。它覆蓋在原有的 CRM 系統之上，透過視覺化數據與動態追蹤機制，幫助主管與業務更精準地管理名單、追蹤跟進進度，並與 Google Sheets 進行無縫的雙向同步。

## 🌟 核心亮點功能

### 1. 雙軌制名單跟進追蹤 (Dual-Track Contact Rate)
針對不同生命週期的名單，系統會自動套用最適合的追蹤邏輯：
*   **新單 (Type 1)**：
    *   **規則**：鐵血紀律「3 天 6 次」，未達標即面臨噴單風險。
    *   **視覺**：乾淨俐落的藍色進度條（例：`進度: 4/6`），幫助業務一目了然。
*   **常態單 (Type 2)**：
    *   **規則**：計算「動態觸及率 (%)」，防堵長期跟進怠惰。詳見下方的「觸及率計算詳解」。

### 2. 智慧防呆凍結機制 (Smart Stop Logic)
當客戶表現出實質進展時，系統會自動停止對業務的「觸及率壓榨」，將該名單的觸及率永遠凍結在最後一刻：
*   **已接通 (Answered)**：系統自動分析日誌，若聯絡內容為業務手動輸入（不包含 `未接*`、`關機*` 等系統預設前綴詞），即判定為已接通。
*   **預約 Demo (Scheduled Demo)**：日誌中出現 `預約DEMO` 紀錄。
*   **名單轉移**：名單轉為「釋出 (Type 4)」或「Demo (Type 3)」時，觸及率自動結算凍結。

### 3. 主管專屬一鍵同步 (Manager Bulk Sync)
徹底解決每天手動同步 500+ 張名單的痛點：
*   提供專屬的**「🔄 同步常態單觸及率」**按鈕。
*   點擊後，系統會在背景以**每秒 1 筆的安全速度**（Throttled Queue），將所有常態單的最新觸及率派發到 Google Sheets 的 M 欄。
*   避免 Google API 流量超載（Rate Limit），並即時顯示同步進度。

### 4. 無縫 Google Sheets 整合
*   讀取與寫入皆透過 Google Apps Script (GAS) API 進行。
*   支援將業務的聯絡紀錄、評級 (Grade)、備註 (Memo) 與觸及率 (Contact Rate) 即時寫入表單。

---

## 📊 觸及率計算詳解 (Contact Rate Calculation)

為了防止業務在名單轉為「常態」後怠惰，系統會嚴格計算「動態觸及率」。這個數字代表業務有沒有照著公司期望的節奏在跟進客戶。

### 數學公式
*   **起算日**：以該名單「被分配給業務的那一天 (assignDate)」或「轉入常態的那一天 (normalDate)」為第 1 天。
*   **基底目標**：名單前 3 天的唯一要求就是打滿 6 次。
*   **常態目標**：從第 4 天起，每天需要額外撥打 1.5 次。
*   **計算公式**：
    *   `目標次數 (Target) = 6 + 無條件進位( (持有天數 - 3) × 1.5 )`
    *   `觸及率 (Rate) = (目前總聯絡次數 / 目標次數) × 100%` （最高上限為 100%）

### 實際範例
假設一張單在業務手上待了不同天數，系統期望的聯絡目標如下：
| 持有天數 | 系統期望打幾次？ (Target) | 說明 |
| :--- | :--- | :--- |
| 第 1~3 天 | 不算觸及率，只看進度條 | 3 天 6 次的高壓階段 |
| 第 4 天 | 6 + 1.5 = **8 次** | 轉常態，開始計算觸及率 |
| 第 5 天 | 6 + 3.0 = **9 次** | |
| 第 10 天 | 6 + 10.5 = **17 次** | （16.5 無條件進位為 17）|

**情境**：如果這張單到了第 10 天，業務總共只打了 10 次電話。
`觸及率 = (10 / 17) * 100% = 58%`。系統就會在畫面上亮紅燈，警告這張名單跟進落後！

---

## 🛠️ 開發與建置 (Development)

專案使用 Vanilla JavaScript 搭配 Vite 進行建置與打包。

### 安裝依賴
```bash
npm install
```

### 本地開發與建置
建置指令會透過 Vite 將所有模組打包，並將輸出的檔案複製為專案根目錄的 `crm.js`。
```bash
npm run build
```

---

## 🚀 部署與安裝 (Deployment)

### 1. 更新遠端腳本
確保您已將打包後的程式碼推送到 GitHub，並且 `crm.js` 在 `main` 分支是最新版本。

### 2. 書籤安裝 (Bookmarklet)
在瀏覽器中新增一個書籤，並將網址 (URL) 填入以下程式碼：
*(注意：此腳本會透過 JSDelivr CDN 抓取 GitHub 上的最新 `crm.js` 執行)*

```javascript
javascript:(function(){
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/JimChen0712/etalking-crm@main/crm.js?v=' + new Date().getTime();
    document.body.appendChild(script);
})();
```

### 3. 使用方式
1. 登入原有的 Etalking CRM 系統。
2. 點擊瀏覽器上方剛剛建立的書籤。
3. 稍等一秒鐘，全新的增強面板就會覆蓋在畫面上方！

---

## 📂 專案結構 (Project Structure)

*   `src/main.js`：核心主程式，包含 UI 渲染、狀態管理與業務邏輯（觸及率計算、日誌分析）。
*   `src/api.js`：與 Google Apps Script (GAS) 通訊的 API 模組。
*   `src/config.js`：專案的全域設定檔。
*   `crm.js`：經過 Vite 打包後的最終單一執行檔（供 CDN 讀取）。

---
*Built with ❤️ for the Etalking Sales Team.*
