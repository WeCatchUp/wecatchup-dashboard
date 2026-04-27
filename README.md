# WeCatchUp 運動團戰情看板

## 專案說明
WeCatchUp 運動團 KPI 戰情看板，使用純靜態 HTML + TailwindCSS + Chart.js 建置。
資料每週由 Python 腳本更新，無需後端伺服器。

## 技術架構
- **前端**：HTML + TailwindCSS CDN + Chart.js CDN
- **資料管線**：Python 3 + pandas
- **部署**：GitHub Pages（靜態）

## 專案結構

```
wecatchup-dashboard/
├── data/
│   ├── input/               ← 每週放入 6 個 Excel 檔（不上傳 git）
│   ├── team3/
│   │   └── dashboard_data_final.json  ← 第三團最終資料快照
│   └── dashboard_data.json  ← 第四團當前資料（由腳本產生）
├── src/
│   └── update_dashboard.py  ← 第四團週更新資料管線
└── public/
    └── index.html           ← 第四團 KPI 看板 UI
```

## 第四團週更新流程

1. 從 JoiiSport 下載 6 個 Excel 檔，放入 `data/input/`
2. 執行資料管線：
```bash
python src/update_dashboard.py \
  --run-individual   data/input/run_individual.xlsx \
  --run-exercise     data/input/run_exercise.xlsx \
  --bike-individual  data/input/bike_individual.xlsx \
  --bike-exercise    data/input/bike_exercise.xlsx \
  --walk-individual  data/input/walk_individual.xlsx \
  --walk-exercise    data/input/walk_exercise.xlsx
```
3. 啟動本地伺服器：
```bash
python -m http.server 8000
```
4. 開啟 http://localhost:8000/public/index.html 並重新整理

## 子團設定（第四團）

| ID   | 名稱                          | 運動類型                   | 週目標   | 總目標   |
|------|-------------------------------|---------------------------|----------|----------|
| run  | RUN CLUB 10週慢跑挑戰賽        | 跑步, 室內跑步             | 20 km    | 200 km   |
| bike | BIKE Training 10週單車挑戰賽   | 自行車, 飛輪               | 40 km    | 400 km   |
| walk | Walk Together 10週健走挑戰賽   | 健行, 超慢跑, 健走杖, 登山 | 15 km    | 150 km   |

**活動期間**：2026-04-27 ～ 2026-07-05（共 10 週）

## 相依套件安裝

```bash
pip install pandas openpyxl
```
