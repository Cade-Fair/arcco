import csv
from pathlib import Path


DATA_FILE = Path(__file__).parent / "data" / "crowd_data.csv"


def load_crowd_data():
    data = []
    with open(DATA_FILE, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append({
                "day": row["day"],
                "hour": int(row["hour"]),
                "occupancy": int(row["occupancy"])
            })
    return data


def get_recommendations(days, start_hour, end_hour, top_n=3):
    if not days:
        raise ValueError("Days list cannot be empty.")

    if start_hour >= end_hour:
        raise ValueError("start_hour must be less than end_hour.")

    data = load_crowd_data()

    filtered = [
        row for row in data
        if row["day"] in days and start_hour <= row["hour"] <= end_hour
    ]

    sorted_results = sorted(filtered, key=lambda row: (row["occupancy"], row["hour"]))

    return sorted_results[:top_n]


if __name__ == "__main__":
    results = get_recommendations(["Mon", "Tue"], 6, 12)
    for r in results:
        print(r)