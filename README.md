# Scriptable is voc salvation

This project is an iOS vocabulary quiz system that uses **Scriptable** and **Shortcuts**. It can pop up multiple-choice questions either through notifications or directly in Shortcuts, and record wrong answers to iCloud for review.

---
![alt text](readme_assets/image-1.png)
## Features

- Fetches a large number of words daily from a Google Sheet or API (default 500 words)  
- Randomly picks wrong answers for review (default 30% probability)  
- Generates multiple-choice questions in Scriptable  
- Records wrong answers in JSON files in either iCloud or GitHub
- Fully compatible with iOS Shortcuts for displaying questions and choosing answers  

---

## File Structure

| File | Description |
|------|-------------|
| `daily_words.json` | Full set of words fetched daily |
| `daily_remain.json` | Remaining words that have not been asked yet |
| `wrong_words.json` | Words answered incorrectly, used for review |

---

## Setup

1. Install **Scriptable** from the App Store.  
2. Install **Shortcuts** (built-in iOS app).  
3. Copy the `make_voc_problem` script into Scriptable.  
4. download the Shortcut from [the link](https://www.icloud.com/shortcuts/5243846190b9428181f91854f439a304) and add it to your Shortcuts app.
5. Configure the script and Shortcut as needed (e.g., modify the script name of the problem making script in **Shortcuts**).
![alt text](readme_assets/image.png)
6. set the Shortcut to run automatically at your desired time using the Automation feature in Shortcuts.
   1. e.g., set it to run every time you open a specific app like Instagram or games.
   ![alt text](readme_assets/image-3.png)







