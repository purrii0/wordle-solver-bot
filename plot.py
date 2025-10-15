import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

sns.set(style="whitegrid")

df = pd.read_csv("data.csv")
df_success = df[df["finalWord"] != "FAILED"]

plt.figure(figsize=(8,5))
sns.histplot(df_success["attempts"], bins=range(1, df_success["attempts"].max()+2), kde=False)
plt.title("Distribution of Attempts to Solve")
plt.xlabel("Number of Attempts")
plt.ylabel("Frequency")
plt.savefig("attempts_histogram.png")

df_success["rolling_avg"] = df_success["attempts"].rolling(50).mean()
plt.figure(figsize=(8,5))
plt.plot(df_success.index, df_success["rolling_avg"])
plt.title("Rolling Average of Attempts (per 50 games)")
plt.xlabel("Game Number")
plt.ylabel("Average Attempts")
plt.savefig("rolling_average.png")

plt.figure(figsize=(8,5))
sns.boxplot(x="opener", y="attempts", data=df_success)
plt.title("Attempts by Opener Word")
plt.xlabel("Opener Word")
plt.ylabel("Number of Attempts")
plt.savefig("opener_boxplot.png")

top_words = df_success.groupby("finalWord")["attempts"].mean().sort_values(ascending=False).head(20)
plt.figure(figsize=(10,6))
sns.barplot(x=top_words.values, y=top_words.index)
plt.title("Top 20 Hardest Words (Avg Attempts)")
plt.xlabel("Average Attempts")
plt.ylabel("Word")
plt.savefig("hardest_words.png")
