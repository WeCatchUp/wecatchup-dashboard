#!/usr/bin/env python3
"""
WeCatchUp 第四團 KPI 儀表板資料更新腳本
每週下載 Excel 後執行此腳本，輸出 data/dashboard_data.json
"""

import argparse
import json
import os
import warnings
from datetime import datetime, timedelta
from pathlib import Path

import math

import pandas as pd

warnings.filterwarnings("ignore")

# ── 活動設定 ──────────────────────────────────────────────────────────────────

ACTIVITY = {
    "name": "WeCatchUp 第四團",
    "start": "2026-04-27",
    "end":   "2026-07-05",
    "weeks": 10,
}

GROUP_TARGETS = {
    "run":  550,
    "bike": 375,
    "walk": 625,
}

GROUP_CONFIG = {
    "run": {
        "name": "RUN CLUB 慢跑挑戰賽",
        "color": "#3b82f6",
        "goal_km": 200,
        "weekly_goal_km": 20,
    },
    "bike": {
        "name": "BIKE Training 單車挑戰賽",
        "color": "#f97316",
        "goal_km": 400,
        "weekly_goal_km": 40,
    },
    "walk": {
        "name": "Walk Together 健走挑戰賽",
        "color": "#22c55e",
        "goal_km": 150,
        "weekly_goal_km": 15,
    },
}

# 年齡區間（右閉：(20,30], (30,40], ..., (70,∞]）
AGE_BINS = [20, 30, 40, 50, 60, 70, float("inf")]
AGE_LABELS = ["21-30", "31-40", "41-50", "51-60", "61-70", "70+"]

# 運動時長區間（分鐘，右閉）
DURATION_BINS = [0, 15, 30, 45, 60, 90, 120, 180, float("inf")]
DURATION_LABELS = ["1-15分", "16-30分", "31-45分", "46-60分", "61-90分", "91-120分", "121-180分", "180分+"]

# 運動時段區間（小時，左閉右開）
TIME_BINS = [0, 4, 8, 12, 16, 20, 24]
TIME_LABELS = ["00-04時", "04-08時", "08-12時", "12-16時", "16-20時", "20-24時"]


# ── 工具函式 ──────────────────────────────────────────────────────────────────

def file_mtime(filepath: str) -> str:
    """回傳檔案最後修改時間的字串表示"""
    try:
        return datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return ""


def extract_hour(value) -> int | None:
    """從時間字串或 Timestamp 中取出小時"""
    if pd.isna(value):
        return None
    try:
        return pd.to_datetime(str(value)).hour
    except Exception:
        pass
    s = str(value)
    if ":" in s:
        try:
            return int(s.split(":")[0]) % 24
        except Exception:
            pass
    return None


def empty_distributions() -> dict:
    """回傳三種分布的空白字典"""
    return {
        "age_distribution": {k: 0 for k in AGE_LABELS},
        "duration_distribution": {k: 0 for k in DURATION_LABELS},
        "time_distribution": {k: 0 for k in TIME_LABELS},
    }


# ── 個人報告處理 ──────────────────────────────────────────────────────────────

def process_individual(filepath: str, group_id: str) -> dict:
    """解析個人報告，回傳報名人數、達標人數及團長 email 集合"""
    default = {"registrations": 0, "net_registrations": 0, "achievers": 0, "achieve_emails": set(), "leader_emails": set(), "mtime": ""}
    try:
        df = pd.read_excel(filepath, dtype=str)
        df = df.fillna("")

        # 欄位驗證
        achieve_col = "--"
        leader_col = "團長"
        email_col = "Email (JoiiSports帳號)"

        for col in [achieve_col, leader_col, email_col]:
            if col not in df.columns:
                print(f"  ⚠️  [{group_id.upper()}] 個人報告找不到欄位：'{col}'，現有欄位：{list(df.columns)}")

        # 識別團長 email
        leader_emails: set[str] = set()
        if leader_col in df.columns and email_col in df.columns:
            is_leader = df[leader_col].str.strip() != ""
            leader_emails = set(df.loc[is_leader, email_col].str.strip().str.lower())

        total = len(df)
        net_total = int((df[leader_col].str.strip() == "").sum()) if leader_col in df.columns else total
        achievers = int((df[achieve_col].str.strip() == "✅").sum()) if achieve_col in df.columns else 0

        # 達標用戶 email 集合（供後續心率交叉比對）
        achieve_emails: set[str] = set()
        if achieve_col in df.columns and email_col in df.columns:
            achieve_emails = set(
                df.loc[df[achieve_col].str.strip() == "✅", email_col]
                .str.strip().str.lower()
                .replace("", pd.NA).dropna()
            )

        return {
            "registrations": total,
            "net_registrations": net_total,
            "achievers": achievers,
            "achieve_emails": achieve_emails,
            "leader_emails": leader_emails,
            "mtime": file_mtime(filepath),
        }

    except Exception as e:
        print(f"  ❌ [{group_id.upper()}] 個人報告讀取失敗：{e}")
        return default


# ── 運動記錄處理 ──────────────────────────────────────────────────────────────

def process_exercise(filepath: str, group_id: str, leader_emails: set) -> dict:
    """解析運動記錄，回傳運動人數、累積公里及各分布統計"""
    dists = empty_distributions()
    default = {
        "active_participants": 0,
        "net_active_participants": 0,
        "total_km": 0.0,
        **dists,
        "weekly_km": [],
        "users_with_hr": 0,
        "hr_emails": [],
        "top50_weekly_avg_km": [],
        "mtime": "",
    }
    try:
        df = pd.read_excel(filepath, dtype=str)
        df = df.fillna("")

        email_col = "Email (App帳號)"
        age_col = "年齡"
        duration_col = "運動時長"
        start_col = "開始時間"
        distance_col = "距離(公里)"
        date_col = "運動日期"

        # 運動日期去除中文星期後綴（如「2026-04-27 (一)」→「2026-04-27」）
        if date_col in df.columns:
            df[date_col] = df[date_col].str.extract(r"(\d{4}-\d{2}-\d{2})")[0]

        # 數值欄位轉型
        for col in [age_col, duration_col, distance_col]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # 運動人數
        active_emails: set[str] = set()
        if email_col in df.columns:
            active_emails = set(df[email_col].str.strip().str.lower().replace("", pd.NA).dropna().unique())
        net_active_emails = active_emails - leader_emails

        # 心率裝置統計
        hr_col = "心率裝置"
        if hr_col in df.columns:
            hr_mask = (
                df[hr_col].notna()
                & (df[hr_col].astype(str).str.strip() != "")
                & (df[hr_col].astype(str) != "nan")
            )
            hr_emails: set[str] = (
                set(df.loc[hr_mask, email_col].str.strip().str.lower().replace("", pd.NA).dropna().unique())
                if email_col in df.columns else set()
            )
            users_with_hr = len(hr_emails)
        else:
            hr_emails = set()
            users_with_hr = 0

        # 累積公里（只計活動期間；過濾 0 / NaN；mean > 100 表示單位為公尺，自動換算）
        dist_divisor = 1.0
        if distance_col in df.columns and date_col in df.columns:
            dates_parsed = pd.to_datetime(df[date_col], errors="coerce")
            period_mask = (dates_parsed >= pd.Timestamp(ACTIVITY["start"])) & \
                          (dates_parsed <= pd.Timestamp(ACTIVITY["end"]))
            dist_valid = df.loc[period_mask, distance_col].dropna()
            dist_valid = dist_valid[dist_valid > 0]
            mean_val = float(dist_valid.mean()) if len(dist_valid) > 0 else 0.0
            dist_divisor = 1000.0 if mean_val > 100 else 1.0
            total_km = float(dist_valid.sum()) / dist_divisor
        elif distance_col in df.columns:
            dist_valid = df[distance_col].dropna()
            dist_valid = dist_valid[dist_valid > 0]
            mean_val = float(dist_valid.mean()) if len(dist_valid) > 0 else 0.0
            dist_divisor = 1000.0 if mean_val > 100 else 1.0
            total_km = float(dist_valid.sum()) / dist_divisor
        else:
            total_km = 0.0

        # 只取活動期間的資料做分布統計
        if date_col in df.columns:
            dates_for_dist = pd.to_datetime(df[date_col], errors="coerce")
            period_mask_dist = (
                (dates_for_dist >= pd.Timestamp(ACTIVITY["start"])) &
                (dates_for_dist <= pd.Timestamp(ACTIVITY["end"]))
            )
            dist_df = df[period_mask_dist].copy()
        else:
            dist_df = df.copy()

        # 年齡分布
        age_dist = {k: 0 for k in AGE_LABELS}
        if age_col in dist_df.columns:
            ages = dist_df[age_col].dropna()
            cut = pd.cut(ages, bins=AGE_BINS, labels=AGE_LABELS, right=True)
            counts = cut.value_counts().reindex(AGE_LABELS, fill_value=0)
            age_dist = counts.to_dict()

        # 運動時長分布（秒 → 分鐘，只計算 ≥1 分鐘的記錄）
        dur_dist = {k: 0 for k in DURATION_LABELS}
        if duration_col in dist_df.columns:
            durations_min = (dist_df[duration_col].dropna() / 60.0)
            durations_min = durations_min[durations_min >= 1]
            cut = pd.cut(durations_min, bins=DURATION_BINS, labels=DURATION_LABELS, right=True)
            counts = cut.value_counts().reindex(DURATION_LABELS, fill_value=0)
            dur_dist = counts.to_dict()

        # 運動時段分布
        time_dist = {k: 0 for k in TIME_LABELS}
        if start_col in dist_df.columns:
            hours = dist_df[start_col].apply(extract_hour).dropna().astype(int)
            cut = pd.cut(hours, bins=TIME_BINS, labels=TIME_LABELS, right=False)
            counts = cut.value_counts().reindex(TIME_LABELS, fill_value=0)
            time_dist = counts.to_dict()

        # 週趨勢（累積公里）
        weekly_km = compute_weekly_km(df, date_col, distance_col)

        # 前 50% 活躍用戶每週人均累積公里數
        top50_weekly_avg_km = compute_top50_weekly_avg_km(df, date_col, distance_col, email_col, dist_divisor)

        return {
            "active_participants": len(active_emails),
            "net_active_participants": len(net_active_emails),
            "total_km": round(total_km, 2),
            "age_distribution": {k: int(v) for k, v in age_dist.items()},
            "duration_distribution": {k: int(v) for k, v in dur_dist.items()},
            "time_distribution": {k: int(v) for k, v in time_dist.items()},
            "weekly_km": weekly_km,
            "users_with_hr": users_with_hr,
            "hr_emails": list(hr_emails),
            "top50_weekly_avg_km": top50_weekly_avg_km,
            "mtime": file_mtime(filepath),
        }

    except Exception as e:
        print(f"  ❌ [{group_id.upper()}] 運動記錄讀取失敗：{e}")
        return default


def compute_weekly_km(df: pd.DataFrame, date_col: str, distance_col: str) -> list:
    """計算活動期間每週累積公里（共 10 週）"""
    activity_start = datetime.strptime(ACTIVITY["start"], "%Y-%m-%d")
    if date_col not in df.columns or distance_col not in df.columns:
        return []
    try:
        work = df[[date_col, distance_col]].copy()
        work[date_col] = pd.to_datetime(work[date_col], errors="coerce")
        work = work.dropna(subset=[date_col])
        work = work[work[date_col] >= pd.Timestamp(activity_start)]
        work[distance_col] = pd.to_numeric(work[distance_col], errors="coerce").fillna(0)

        cumulative = 0.0
        weekly: list[float] = []
        for week in range(ACTIVITY["weeks"]):
            week_start = pd.Timestamp(activity_start + timedelta(weeks=week))
            week_end = week_start + pd.Timedelta(weeks=1)
            mask = (work[date_col] >= week_start) & (work[date_col] < week_end)
            cumulative += float(work.loc[mask, distance_col].sum())
            weekly.append(round(cumulative, 2))
        return weekly

    except Exception as e:
        print(f"  ⚠️  週趨勢計算失敗：{e}")
        return []


def compute_top50_weekly_avg_km(df: pd.DataFrame, date_col: str, distance_col: str, email_col: str, divisor: float = 1.0) -> list:
    """計算前 50% 活躍用戶（依累積里程排序）每週人均累積公里數"""
    activity_start = datetime.strptime(ACTIVITY["start"], "%Y-%m-%d")
    if date_col not in df.columns or distance_col not in df.columns or email_col not in df.columns:
        return []
    try:
        work = df[[date_col, distance_col, email_col]].copy()
        work[date_col] = pd.to_datetime(work[date_col], errors="coerce")
        work = work.dropna(subset=[date_col])
        work = work[work[date_col] >= pd.Timestamp(activity_start)]
        work[distance_col] = pd.to_numeric(work[distance_col], errors="coerce").fillna(0)

        # 計算各人累積里程，取前50%
        person_km = work.groupby(email_col)[distance_col].sum()
        n_top = math.ceil(len(person_km) * 0.5)
        if n_top == 0:
            return [0.0] * ACTIVITY["weeks"]
        top_emails = set(person_km.nlargest(n_top).index)
        top_work = work[work[email_col].isin(top_emails)]

        # 計算各週累積人均公里數
        cumulative = 0.0
        result: list[float] = []
        for week in range(ACTIVITY["weeks"]):
            week_start = pd.Timestamp(activity_start + timedelta(weeks=week))
            week_end = week_start + pd.Timedelta(weeks=1)
            mask = (top_work[date_col] >= week_start) & (top_work[date_col] < week_end)
            cumulative += float(top_work.loc[mask, distance_col].sum()) / divisor
            result.append(round(cumulative / n_top, 2))
        return result

    except Exception as e:
        print(f"  ⚠️  top50 週平均計算失敗：{e}")
        return []


# ── 群組整合 ──────────────────────────────────────────────────────────────────

def build_group(group_id: str, individual_path: str | None, exercise_path: str | None) -> dict:
    """整合個人報告與運動記錄，產生單一群組的完整資料"""
    cfg = GROUP_CONFIG[group_id]
    result = {
        **cfg,
        "registration_target": GROUP_TARGETS[group_id],
        "registrations": 0,
        "net_registrations": 0,
        "active_participants": 0,
        "net_active_participants": 0,
        "achievers": 0,
        "achievement_rate": 0.0,
        "total_km": 0.0,
        "users_with_hr": 0,
        "hr_achievers": 0,
        "data_updated_individual": "",
        "data_updated_exercise": "",
        **empty_distributions(),
        "weekly_km": [],
        "top50_weekly_avg_km": [],
    }

    leader_emails: set[str] = set()
    achieve_emails: set[str] = set()

    if individual_path:
        if os.path.exists(individual_path):
            ind = process_individual(individual_path, group_id)
            result["registrations"] = ind["registrations"]
            result["net_registrations"] = ind["net_registrations"]
            result["achievers"] = ind["achievers"]
            result["data_updated_individual"] = ind["mtime"]
            leader_emails = ind["leader_emails"]
            achieve_emails = ind["achieve_emails"]
        else:
            print(f"  ⚠️  [{group_id.upper()}] 個人報告檔案不存在：{individual_path}")

    if exercise_path:
        if os.path.exists(exercise_path):
            ex = process_exercise(exercise_path, group_id, leader_emails)
            hr_emails = set(ex.pop("hr_emails", []))
            result["active_participants"] = ex["active_participants"]
            result["net_active_participants"] = ex["net_active_participants"]
            result["total_km"] = ex["total_km"]
            result["age_distribution"] = ex["age_distribution"]
            result["duration_distribution"] = ex["duration_distribution"]
            result["time_distribution"] = ex["time_distribution"]
            result["weekly_km"] = ex["weekly_km"]
            result["users_with_hr"] = ex["users_with_hr"]
            result["top50_weekly_avg_km"] = ex["top50_weekly_avg_km"]
            result["data_updated_exercise"] = ex["mtime"]

            # 有心率裝置且達標的用戶數
            if hr_emails and achieve_emails:
                result["hr_achievers"] = len(hr_emails & achieve_emails)
        else:
            print(f"  ⚠️  [{group_id.upper()}] 運動記錄檔案不存在：{exercise_path}")

    net_reg = result["net_registrations"]
    if net_reg > 0:
        result["achievement_rate"] = round(result["achievers"] / net_reg * 100, 1)

    return result


# ── 主程式 ────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="WeCatchUp 第四團 KPI 儀表板更新工具")
    parser.add_argument("--run-individual",  metavar="FILE", help="RUN CLUB 個人報告 xlsx")
    parser.add_argument("--run-exercise",    metavar="FILE", help="RUN CLUB 運動記錄 xlsx")
    parser.add_argument("--bike-individual", metavar="FILE", help="BIKE Training 個人報告 xlsx")
    parser.add_argument("--bike-exercise",   metavar="FILE", help="BIKE Training 運動記錄 xlsx")
    parser.add_argument("--walk-individual", metavar="FILE", help="Walk Together 個人報告 xlsx")
    parser.add_argument("--walk-exercise",   metavar="FILE", help="Walk Together 運動記錄 xlsx")
    parser.add_argument("--output", default="data/dashboard_data.json", metavar="FILE",
                        help="輸出 JSON 路徑（預設：data/dashboard_data.json）")
    args = parser.parse_args()

    print("🔄 開始處理資料...\n")

    groups = {
        "run":  build_group("run",  args.run_individual,  args.run_exercise),
        "bike": build_group("bike", args.bike_individual, args.bike_exercise),
        "walk": build_group("walk", args.walk_individual, args.walk_exercise),
    }

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    output_data = {
        "last_updated": now,
        "activity": ACTIVITY,
        "groups": groups,
    }

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    public_path = out_path.parent.parent / "public" / "data" / "dashboard_data.json"
    public_path.parent.mkdir(parents=True, exist_ok=True)
    with open(public_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ 同步寫入 {public_path}")

    # 終端機摘要
    print()
    for gid, g in groups.items():
        print(f"  [{gid.upper():<4}] 報名 {g['registrations']}/{g['registration_target']} | 運動 {g['active_participants']:<5} | 達標 {g['achievers']:<5} | 心率用戶 {g['users_with_hr']:<5} | 心率達標 {g['hr_achievers']:<5} | 累積 {g['total_km']:>10,.1f} km")

    print(f"\n✅ dashboard_data.json 已更新於 {now}")


if __name__ == "__main__":
    main()
