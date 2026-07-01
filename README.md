# eTalking CRM 擴充套件

這是一個專為 eTalking 內部 CRM 系統設計的「書籤小工具 (Bookmarklet)」擴充腳本。旨在提升業務人員處理名單的效率，提供更流暢的操作介面、快速壓單功能，並自動同步進度至 Google Sheets。

## ✨ 核心功能 (Features)

*   **快速名單操作**：無需重新整理頁面，即可快速設定聯絡狀態、A/C 等級與備註。
*   **Google Sheet 雙向同步**：自動將聯絡進度、等級與備註同步至團隊的 Google Sheet 中，確保資料不遺失。
*   **自動撥號器 (Auto Dialer)**：支援連續自動撥打名單，大幅節省手動點擊的時間。
*   **公海與個人名單管理**：提供標籤頁切換，並支援多條件過濾（顧問、名單來源、全域搜尋）。

## 🛠 技術架構 (Architecture)

本專案於 2026 年進行了模組化重構，採用現代化的前端開發流程：

*   **建置工具**：使用 [Vite](https://vitejs.dev/) 進行打包 (Library Mode)。
*   **模組化設計**：
    *   `src/main.js`: 核心邏輯與 UI 渲染。
    *   `src/api.js`: 處理與 Google Apps Script (GAS) 的 API 通訊。
    *   `src/config.js`: 全域常數與設定（包含使用者對照表、API 網址）。
*   **輸出**：編譯後的檔案會直接輸出至根目錄的 `crm.js`，供書籤工具無縫讀取。

## 🚀 開發與建置 (Development)

確保您已經安裝了 Node.js。

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **編譯打包**
   ```bash
   npm run build
   ```
   > 執行打包後，`src/` 內的程式碼會被壓縮並覆蓋至專案根目錄的 `crm.js`。

## 📌 未來規劃 (Roadmap)

*   [ ] **名單觸及率追蹤 (Contact Frequency)**：自動擷取後台日誌，控管「每日/每週」的最少聯絡次數，並整合至自動撥號器的跳過機制中。
*   [ ] **現代化 UI 重構**：導入更清晰的卡片式排版與膠囊標籤。
