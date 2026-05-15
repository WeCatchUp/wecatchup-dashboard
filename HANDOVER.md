# WeCatchUp 第四團戰情看板 — 工作交接文件

> 文件版本：2026-05-15  
> 撰寫人：Ainslee Wang  
> 交接用途：完整記錄專案需求、架構決策、技術債與維護指引

---

## 目錄

1. [PRD — 產品需求文件](#1-prd--產品需求文件)
2. [技術架構說明](#2-技術架構說明)
3. [Code Review 報告](#3-code-review-報告)
4. [技術債清單](#4-技術債清單)
5. [維護 SOP](#5-維護-sop)
6. [聯絡窗口與權限交接](#6-聯絡窗口與權限交接)

---

## 1. PRD — 產品需求文件

### 1.1 背景與目的

WeCatchUp 第四團（2026-04-27 ~ 2026-07-05，10 週）舉辦三項運動挑戰賽，需要一個即時顯示各團 KPI 的內部看板，供活動管理者每週更新後在例會中使用。

此為**純靜態儀表板**，不需資料庫，不需後端伺服器，資料來源為 JoiiSport 平台匯出的 Excel 檔。

### 1.2 用戶與使用情境

| 角色 | 使用情境 |
|------|---------|
| 活動管理者（主要） | 每週下載 Excel → 執行腳本 → 開瀏覽器看板，在例會中報告 |
| 英語系工作人員（次要） | 透過 `?lang=en` 或語言切換按鈕切換至英文版 |

### 1.3 三個參賽群組

| ID | 名稱 | 運動類型 | 個人目標 | 週目標 | 報名目標人數 |
|----|------|---------|---------|-------|------------|
| run | RUN CLUB 慢跑挑戰賽 | 跑步、室內跑步 | 200 km | 20 km | 550 人 |
| bike | BIKE Training 單車挑戰賽 | 自行車、飛輪 | 400 km | 40 km | 375 人 |
| walk | Walk Together 健走挑戰賽 | 健行、超慢跑等 | 150 km | 15 km | 625 人 |

### 1.4 功能需求

#### F1 — 整體概覽（Summary Bar）
- 三團合計報名人數
- 活躍運動人數與活躍率（%）
- 整體達標率（以淨報名人數加權平均）
- 領先群組名稱與其達標率

#### F2 — 各團 KPI 卡片（Group Cards）
- 群組名稱、目標距離、週目標
- 達標率徽章
- 報名人數、運動人數、達標人數（分母顯示為報名上限）
- 報名目標達成進度條（動畫）
- 心率裝置用戶數、佔比、達標人數，附進度條

#### F3 — 數據分析圖表（Charts）
- 年齡區間分布（分組長條圖）
- 運動時長分布（分組長條圖）
- 運動時段分布（分組長條圖）
- 前 50% 活躍用戶每週人均累積公里數（折線圖）

#### F4 — 基礎 UX
- 全頁載入動畫（Spinner），資料載入失敗時顯示操作說明錯誤面板
- 資料更新時間戳記顯示
- zh-TW / en 雙語支援（切換按鈕 + URL 參數 + localStorage 記憶）
- 手機版響應式（768px 斷點）

### 1.5 非功能需求

| 項目 | 要求 |
|------|------|
| 部署方式 | 本機 `python -m http.server 8000` 開啟，不需雲端 |
| 相依套件 | 前端：TailwindCSS CDN + Chart.js CDN；後端：Python 3.11+（使用 `int | None` union 語法）、pandas>=2.0、openpyxl>=3.1 |
| 瀏覽器支援 | 現代常青瀏覽器（Chrome / Firefox / Safari，ES2020+） |
| 效能 | 單一 JSON 4.8 KB，載入時間 < 1 秒（本機） |
| 安全性 | 本機只讀展示，無登入、無資料寫入 |

### 1.6 明確不在範圍內（Out of Scope）

- 使用者認證 / 登入
- 即時資料串流（WebSocket / SSE）
- 雲端部署 / CI/CD
- 歷史資料比較（多期別對比）
- 個別成員明細頁

---

## 2. 技術架構說明

### 2.1 整體架構

```
JoiiSport 平台
     │  手動匯出 Excel（每週）
     ▼
data/input/*.xlsx          ← 6 個 Excel 檔（每團 2 個）
     │  python src/update_dashboard.py
     ▼
data/dashboard_data.json   ← 主資料（同步寫入 public/data/）
     │  python -m http.server 8000
     ▼
public/index.html          ← 靜態前端，fetch JSON 後渲染
```

### 2.2 前端模組架構

```
window.WC（全域命名空間）
├── i18n.js     ── 字典 + WC.t() + WC.setLanguage() + WC.initLang()
├── config.js   ── 常數（GROUP_ORDER, 顏色, Chart.js 預設）
├── data.js     ── WC.loadData()，管理載入/錯誤 DOM 狀態
├── summary.js  ── WC.renderSummaryBar()，四格摘要卡片
├── cards.js    ── WC.renderCards()，三張群組 KPI 卡片
├── charts.js   ── WC.renderCharts()，四張圖表
└── main.js     ── DOMContentLoaded 進入點，boot 序列、語言切換 UI
```

**載入順序**（`<script>` 標籤順序，不可對調）：
`i18n.js` → `config.js` → `data.js` → `summary.js` → `cards.js` → `charts.js` → `main.js`

### 2.3 資料流程

```
Excel 欄位（個人報告）         Excel 欄位（運動記錄）
├── 群組代碼                  ├── Email(App帳號)
├── Email(JoiiSports帳號)     ├── 年齡
├── -- (✅ = 達標)            ├── 運動時長（秒）
└── 團長（非空 = 排除）        ├── 開始時間
                              ├── 距離(公里)
                              └── 心率裝置（有值 = 有HR裝置）
                              
update_dashboard.py
├── process_individual()      → registrations, net_registrations, achievers
├── process_exercise()        → active, distributions, weekly_km
├── compute_weekly_km()       → 累積里程週趨勢陣列
├── compute_top50_weekly_avg_km() → 前50%用戶週人均km陣列
└── build_group()             → 合併並計算 achievement_rate

→ dashboard_data.json
   └── groups: { run, bike, walk }
       ├── name, color, goal_km, weekly_goal_km
       ├── registration_target, registrations, net_registrations
       ├── active_participants, net_active_participants
       ├── achievers, achievement_rate
       ├── total_km, users_with_hr, hr_achievers
       ├── age_distribution { "21-30": N, ... }
       ├── duration_distribution { "1-15分": N, ... }
       ├── time_distribution { "00-04時": N, ... }
       ├── weekly_km: [累積km, ...]     ← 10 個元素
       └── top50_weekly_avg_km: [...]   ← 10 個元素
```

### 2.4 關鍵設計決策

| 決策 | 選擇 | 原因 |
|------|------|------|
| 框架 | 無框架（Vanilla JS） | 零 npm 複雜度，可直接用 http.server 開啟 |
| CSS | TailwindCSS CDN + 自訂 CSS | 快速佈局 + 設計代幣中央管理 |
| 圖表 | Chart.js CDN | 成熟、文件豐富，CDN 版零設定 |
| i18n | 手寫字典模式 | 無需套件，字典結構清晰，支援陣列型標籤 |
| 資料格式 | JSON（相對路徑 `./data/dashboard_data.json`） | 搭配 http.server，避免 file:// CORS 問題 |
| 命名空間 | `window.WC` | 所有模組共用，無需打包器，依序 `<script>` 載入 |

### 2.5 歷史檔案說明

在 git history 中可能看到 `src/` 下曾存在一份 React 程式碼
（`App.js`、`components/`、`hooks/` 等），以及根目錄 `js/`、`css/` 兩個
舊版前端目錄。這些檔案的歷史背景如下：

- **`src/` 的 React 檔案**：透過 commit `24a39e6`（第四團首次 merge 回 main）
  一次性進入主分支，**從未被修改、也未被任何現役程式碼引用**。早期使用
  AI 輔助開發、未建立 PRD 與 ADR 紀錄習慣，已無法回溯具體技術選型討論
  過程。推測為早期分支策略下意外帶入的歷史殘留。

- **根目錄 `js/` 與 `css/`**：是 i18n 化之前的舊版前端檔案。前端目錄
  遷移到 `public/` 後（見 commit `d600b60`），這份舊版未同步刪除，且
  未跟上後續的 i18n 改造，與現役 `public/js/` 不同步。

兩批檔案已於 commit `adcc4ef`（React 殘留）、`83eb035`（根目錄 js/css）
清除，共移除 25 個檔案 / 2195 行。

**接手者注意事項：**
- 若在 git history 中看到這些檔案，無需深究來源，亦無需參考其架構
- 現役程式碼以 `public/` 與 `src/update_dashboard.py` 為唯一基準
- 若未來考慮重寫為框架版本，請以「現在的需求」為依據評估，不需要回溯
  歷史決策

---

## 3. Code Review 報告

### 3.1 整體評分

| 面向 | 評分 | 說明 |
|------|------|------|
| 可讀性 | ★★★★☆ | 模組職責清晰，命名具描述性，適當的中文注釋 |
| 架構設計 | ★★★★☆ | 模組化良好，關注點分離到位，序列載入限制明顯 |
| 正確性 | ★★★☆☆ | 核心邏輯正確，年齡分布已修正為去重計人；惟存在一處潛在 NameError（見 TD-01），目前因 JoiiSport 匯出固定包含該欄位而未觸發 |
| 可維護性 | ★★★☆☆ | 功能型設計，無測試，擴充新圖表需改動多處 |
| 安全性 | ★★★★★ | 純讀取靜態展示，無輸入介面，無安全風險 |

### 3.2 前端模組逐檔分析

#### `i18n.js` — 國際化字典
**優點：**
- 字典結構整齊，zh / en 鍵值一一對應
- `WC.t()` 支援 `{placeholder}` 插值，簡潔夠用
- `WC.tArr()` 專門處理陣列型標籤，避免 `buildDatasets()` 混用字串操作

**問題：**
- `footer` 欄位 zh 版寫 `© 2025-2026 華勛股份有限公司`，en 版寫 `© 2026 WeCatchUp`，兩者版權聲明不一致（zh 版包含公司法人名稱，en 版不含）
- `chart_weekly_axis` 含 `\n` 換行，需在 `charts.js` 中手動 `.replace(/\\n/g, '<br>')` 處理，其餘字串沒有此問題，設計不一致

#### `config.js` — 常數設定
**優點：**
- 使用 ES getter (`get GROUP_NAMES_SHORT()`) 延遲求值，確保在 i18n 載入後才呼叫 `WC.t()`
- `CHART_DEFAULTS` 集中管理圖表預設值，各圖表 spread 繼承一致性高

**問題：**
- `GROUP_NAMES_SHORT` 雖保留向下相容注解，但實際程式碼中已無呼叫者（各模組直接呼叫 `WC.t('group_' + gid)`），屬死碼，應清除

#### `data.js` — 資料載入
**優點：**
- 職責單一，只管理 fetch + DOM 狀態切換
- 錯誤處理清楚，失敗時顯示操作說明面板

**問題：**
- `fetch('./data/dashboard_data.json')` 使用相對路徑，若從非 `/public/` 目錄開啟會靜默失敗，依賴部署環境正確
- 錯誤面板的說明文字（Python 指令）硬編碼在 HTML，未接入 i18n（雖 `_updateStaticText()` 有更新 `#error h2`，但錯誤面板的指令內容本身未翻譯）

#### `summary.js` / `cards.js` — 渲染模組
**優點：**
- 純函式設計（輸入 `groups` 物件 → 寫入 DOM），副作用明確
- 達標率計算使用淨報名人數（net_registrations）加權，邏輯正確

**問題（cards.js）：**
- `fmtNum()` 和 `fmtKm()` 在 `cards.js` 和 `charts.js` 中各自重複定義，`summary.js` 也有 `fmtNum()`，共三份相同實作
- 進度條動畫使用 `setTimeout(..., 100)` 觸發，依賴瀏覽器繪製時機，屬於經驗性延遲，在慢速設備上偶發不動畫

#### `charts.js` — 圖表渲染
**優點：**
- `buildDatasets()` 設計巧妙：永遠以中文 key 查詢 JSON，再以當前語言標籤顯示，解決了 zh/en 切換時 JSON key 不變的問題
- 語言切換時整個 `#charts-grid` 重建（含 canvas），舊 canvas 被替換後 Chart.js 實例失去 DOM 引用

**問題：**
- 未顯式呼叫 `chart.destroy()`，依賴瀏覽器 GC 間接回收舊實例。實務上多次切換語言尚未觀察到明顯記憶體洩漏，但顯式 destroy 可提高確定性、避免未來 Chart.js 版本升級後行為變動造成隱患

#### `main.js` — 進入點
**優點：**
- boot 序列清楚：initLang → 建語言按鈕 → loadData → 首次渲染 → 顯示 app
- `WC._rerender()` 和 `WC._lastData` 讓語言切換可以不重新 fetch，設計合理

**問題：**
- `_updateSectionLabels()` 使用 `querySelectorAll('.section-header .section-label')` 並依陣列索引對應文字 key，若 DOM 順序被調整則無聲失效（脆弱的 DOM 耦合）
- 語言按鈕的 CSS 全部用 `style.cssText = [...].join(';')` 內聯，可移至 `design.css` 增加可維護性

#### `design.css` — 設計系統
**優點：**
- CSS 自訂屬性（設計代幣）集中管理，顏色、陰影、圓角易於全域調整
- 768px 斷點響應式覆蓋了主要版面元件

**問題：**
- `--shadow-xl` 和 `--shadow-lg` 數值相同（`0 4px 8px rgba(0,0,0,0.06)`），其中一個是複製貼上錯誤
- Tailwind CDN 與 design.css 兩套系統並存，TailwindCSS 僅用於極少數通用 class（`hidden`、`min-h-screen`、`fixed inset-0`、`z-50` 等），引入 CDN 的邊際效益低
- 未定義 `@media (prefers-color-scheme: dark)`，目前只有淺色模式

### 3.3 資料管線（Python）分析

#### 強項
- 欄位缺失時有明確警告（`⚠️ 找不到欄位`），不會靜默忽略
- 距離單位自動偵測（`mean > 100` → 公尺換算為公里）是巧妙的防呆設計
- 中文星期後綴剝除（`str.extract(r"(\d{4}-\d{2}-\d{2})")`) 處理了 JoiiSport 特有的日期格式

#### 問題

**1. `process_exercise()` 中存在引用錯誤（中等嚴重）**

`ages` 變數在 `if age_col in dist_df.columns:` 區塊內被賦值，但 `pd.cut(ages, ...)` 在 `if` 區塊外執行，若 `age_col` 不存在於欄位中，`ages` 未定義會引發 `NameError`：

```python
# 第 248-255 行：
age_dist = {k: 0 for k in AGE_LABELS}
if age_col in dist_df.columns:
    if email_col in dist_df.columns:
        ages = dist_df.drop_duplicates(subset=[email_col])[age_col].dropna()
    else:
        ages = dist_df.drop_duplicates(subset=[age_col])[age_col].dropna()
cut = pd.cut(ages, bins=AGE_BINS, ...)  # ← 此行在 if 外，ages 可能未定義
counts = cut.value_counts().reindex(AGE_LABELS, fill_value=0)
age_dist = counts.to_dict()
```

實際上因為 JoiiSport 匯出固定有此欄位所以未觸發，但邏輯上是 bug。

**2. 達標率計算分母（輕微）**

`achievement_rate = achievers / net_registrations` — `net_registrations` 排除了團長。此計算隱含假設「團長不計入達標考核」，與 `users_with_hr` 計算（分母用 `registrations` 含團長）不一致，若接手者不知此邏輯可能誤解。

**3. `hr_emails` 的 `set → list` 轉換後被 `pop()` 移除（輕微）**

`build_group()` 呼叫 `ex.pop("hr_emails", [])` 取出並轉回 set，這個「傳入 dict 又立即 pop 出來」的設計可讀性差，可改為 `process_exercise()` 直接回傳兩個值。

**4. `warnings.filterwarnings("ignore")` 全域靜音（輕微）**

壓制了所有 pandas 警告，包含可能有意義的資料轉型警告，建議指定類別。

---

## 4. 技術債清單

依優先順序排列：

### P1 — 建議本期修復

| # | 位置 | 問題 | 修復方式 |
|---|------|------|---------|
| TD-01 | `update_dashboard.py:253-255` | `ages` 可能未定義導致 NameError | 將 `pd.cut()` 移入 `if` 區塊內 |
| TD-02 | `design.css:26-27` | `--shadow-xl` 和 `--shadow-lg` 數值相同 | 修正 `--shadow-xl` 為更深陰影 |

### P2 — 下一個迭代優化

| # | 位置 | 問題 | 修復方式 |
|---|------|------|---------|
| TD-03 | `cards.js`, `charts.js`, `summary.js` | `fmtNum()` / `fmtKm()` 三份重複定義 | 移至 `config.js` 或新增 `utils.js` |
| TD-04 | `i18n.js:77` | zh 版 footer 公司名稱與 en 版不一致 | 統一版權聲明內容 |
| TD-05 | `main.js:133-140` | `_updateSectionLabels()` 依索引對應 key 脆弱 | 改用 `data-i18n-key` 屬性查找 |
| TD-06 | `charts.js` | 語言切換未顯式 `chart.destroy()` | 在 `_rerender()` 清除 canvas 前保存並 destroy 舊實例 |
| TD-07 | `config.js:17-25` | `GROUP_NAMES_SHORT` getter 已無呼叫者 | 刪除死碼 |
| TD-08 | `main.js:14-28` | 語言按鈕樣式全部內聯 | 移至 `design.css`，加入 `.lang-toggle-btn` class |
| TD-09 | `tests/` 不存在 | 無自動化測試；TD-01 即為此缺失導致的潛在 bug（無測試覆蓋故未被發現）。建議至少對 `update_dashboard.py` 的 `process_individual` / `process_exercise` 加 pytest，覆蓋欄位缺失、距離單位異常、空資料三種情境 |
| TD-14 | `update_dashboard.py` 結尾無資料正確性驗證 | 資料管線最致命的風險不是程式碼例外，而是**跑出錯誤數字而沒人發現**（例如分母用錯、單位誤判、dedup 邏輯漏洞）。建議在 `build_group()` 之後、寫入 JSON 之前加入 sanity check：(1) `assert achievers <= net_registrations`、(2) `assert active_participants <= registrations`、(3) `assert all(km >= 0 for km in weekly_km)`、(4) `assert 0 <= achievement_rate <= 1`。可疑數值時 raise 並標註該群組與欄位，避免錯誤資料進入例會 |

### P3 — 長期改進（下一期活動前考慮）

| # | 問題 | 說明 |
|---|------|------|
| TD-10 | 不支援深色模式 | 未設 `@media (prefers-color-scheme: dark)` |
| TD-11 | Tailwind CDN 邊際效益低 | 僅用 ~5 個 class，可考慮移除改用純 CSS |
| TD-12 | 錯誤面板說明文字未完整 i18n | Python 指令多行文字應改為 `WC.t()` 控制 |
| TD-13 | JSON 雙寫邏輯 | 腳本寫入 `data/` 再複製到 `public/data/`，關係沒有文件說明理由 |

---

## 5. 維護 SOP

### 5.1 每週資料更新（正常作業）

```bash
# 1. 從 JoiiSport 下載 6 個 xlsx，放入 data/input/
# 2. 在專案根目錄執行：
python src/update_dashboard.py \
  --run-individual   data/input/run_individual.xlsx \
  --run-exercise     data/input/run_exercise.xlsx \
  --bike-individual  data/input/bike_individual.xlsx \
  --bike-exercise    data/input/bike_exercise.xlsx \
  --walk-individual  data/input/walk_individual.xlsx \
  --walk-exercise    data/input/walk_exercise.xlsx

# 3. 啟動本機伺服器
python -m http.server 8000

# 4. 開啟 http://localhost:8000/public/index.html 確認數字正確
# 5. 確認無誤後 commit（注意：目前 JSON 需同步於兩個路徑，原因待釐清，見 TD-13）：
#    update_dashboard.py 預期會自動寫入兩個路徑，若僅產生其中一個請手動 cp 同步後再 commit
git add data/dashboard_data.json public/data/dashboard_data.json
git commit -m "data: 第N週資料更新"
```

### 5.2 JoiiSport 欄位格式異動時的排查步驟

1. 執行腳本後看 terminal 有無 `⚠️ 找不到欄位` 警告
2. 開啟 Excel 確認欄位標題（注意全形/半形空格差異）
3. 修改 `update_dashboard.py` 中對應的 `*_col = "欄位名稱"` 常數
4. 重跑腳本確認 JSON 數字合理

### 5.3 新增第五團（未來擴充）

前端需修改：
- `config.js`：`GROUP_ORDER` 加入新 ID，`GROUP_TARGETS`、`GROUP_ICONS` 加入新鍵值
- `i18n.js`：`group_*` 新增 zh/en 翻譯
- `design.css`：新增群組色彩 CSS 變數（非必要，可直接用 JSON 的 `color` 欄位）

後端需修改：
- `update_dashboard.py`：`GROUP_CONFIG`、`GROUP_TARGETS` 加入新群組；`main()` 新增 argparse 參數與 `build_group()` 呼叫

### 5.4 環境需求

```
Python:   3.11+（使用了 int | None 型別注釋 union syntax）
套件:      pandas>=2.0, openpyxl>=3.1
瀏覽器:   Chrome 90+ / Firefox 88+ / Safari 15+（ES2020 + CSS Grid）
```

### 5.5 已知限制與特殊邏輯

1. **必須用 http.server 開啟**，不能直接雙擊 `index.html`（`fetch()` 因 CORS 政策失敗）
2. **年齡分布以人為單位**（去重，每人只計一次），而非以運動記錄筆數計（2026-05-01 修正）
3. **淨報名人數（net_registrations）= 報名總數 - 團長人數**（團長排除於達標考核）
4. **距離單位自動偵測**：若平均距離 > 100，視為公尺並除以 1000 換算為公里
5. **前 50% 計算**：以整個活動期間累積里程排序，取前半用戶計算週人均km

---

## 6. 聯絡窗口與權限交接

> ⚠️ 接手者請於交接日內確認下列項目，缺漏者請向原撰寫人索取。

### 6.1 帳號與權限

| 項目 | 持有人 | 交接方式 | 備註 |
|------|--------|---------|------|
| JoiiSport 後台帳號 | （待填） | （待填，建議透過密碼管理器分享） | 用於每週下載 6 個 Excel |
| Git 倉庫擁有者 | （待填） | 需確認 push 權限 | 倉庫位址：（待填） |
| 本機開發環境 | 接手者自備 | 參考 5.4 環境需求 | macOS / Windows / Linux 皆可 |
| Claude Team / Code 帳號 | （待填，由 IT 開通） | 用於 Claude Code 進行維護工作；無此帳號可使用一般編輯器，但 AI 輔助流程會中斷。本專案的 HANDOVER.md 與 Code Review 即由 Claude Code 協助產出 |

### 6.2 利害關係人

| 角色 | 姓名 | 聯絡方式 | 用途 |
|------|------|---------|------|
| 活動主辦（內容問題） | （待填） | （待填） | 規則異動、KPI 定義 |
| 例會報告對象 | （待填） | （待填） | 看板資料的使用者 |
| 技術問題求助對象 | Ainslee Wang | （待填） | 原撰寫人，交接期內可諮詢 |

### 6.3 異常處理 Runbook

**情境 A：週會前發現數字異常**
1. `git log --oneline public/data/dashboard_data.json` 查看上週 commit
2. `git checkout <上週 commit hash> -- public/data/dashboard_data.json data/dashboard_data.json` 回滾
3. 確認瀏覽器看到舊版數字正常 → `git commit -m "revert: 回滾至第 N-1 週資料"`
4. 同步排查本週 Excel 異常原因

**情境 B：腳本執行中途失敗**
1. 觀察 terminal 最後一行 traceback
2. 常見原因：
   - `KeyError: '欄位名'` → JoiiSport 欄位改名，依 5.2 節排查
   - `FileNotFoundError` → Excel 路徑或檔名錯誤
   - `ValueError` 含「could not convert string」→ 該欄位含非預期字串，需開 Excel 檢視

**情境 C：6 個 Excel 檔少 1 個**
- 目前腳本 argparse 必填，缺檔會直接報錯。**不會**產生部分資料的 JSON。
- 若需強制產出（例如某團暫停），需手動修改 `update_dashboard.py` 對應的 `build_group()` 呼叫。

### 6.4 資料保留政策

| 資料 | 保留策略 | 備註 |
|------|---------|------|
| `data/input/*.xlsx` | 不入 git，建議本機保留至活動結束 | 含 Email 欄位，注意個資保護 |
| `data/dashboard_data.json` | 每週 commit，git 歷史即為歷史備份 | 不需另存歷史版本 |
| `public/data/dashboard_data.json` | 同上 | 與 `data/` 同步（見 TD-13） |

⚠️ **個資注意**：Excel 含 Email 欄位，依個資法不得外流，請勿 commit 至 git、勿放置於公開雲端。

---

*文件結束*
