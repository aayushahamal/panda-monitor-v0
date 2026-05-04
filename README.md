# 🐼 The "Panda-lyzer" System Monitor 

### *Born out of 100GB of Steam-induced frustration.* 🎮

## 📜 The Backstory
This project wasn't born in a classroom or a corporate office. It was born in the dark depths of a **3-day download marathon**. 

While trying to download a 100GB+ game on Steam with a throttled ISP, I realized I was spending more time staring at progress bars than actually living. I needed to see exactly what was happening with my data and CPU without looking at boring, gray Task Manager windows. 

So, I built this: **A cute, panda-themed dashboard** to keep me company while my ISP decides whether or not to give me my data.

## ✨ Why use this?
- **Relatable Origins:** Built by someone who knows the pain of slow downloads.
- **Teens & Beginners:** This is a perfect "first dive" into seeing how your computer actually talks to the internet.
- **Visible Progress:** Watch your individual dataset grow in real-time.
- **Panda Power:** Because if you have to wait 3 days for a game, you might as well have a panda watching your back.

## 📊 Vitals being Tracked
- **Network In/Out:** Perfect for monitoring those ISP bottlenecks.
- **CPU & Memory:** See if your laptop is sweating as hard as you are.
- **Historical Logging:** It records even when you aren't looking (so you can see if your net dropped while you slept!).

##  Getting Started

### 1. Prerequisites
- Node.js installed on your machine.
- Git (for cloning).

### 2. Backend Setup (monitor-server)
The backend handles data collection using  `systeminformation` to grab your live stats and save them to a CSV.
```bash
cd monitor-server
npm install
node index.js 
```
The backend handles data 
Tip: To run the backend 24/7 in the background, use PM2:
``` bash
npm install -g pm2 
pm2 start index.js --name panda-backend
```
## 3. Frontend Setup  (monitor-frontend) [The Face]
 ** The React dashboard makes those numbers look pretty. **
``` bash
cd monitor-server/monitor-frontend
npm install
npm start
```
The dashboard will open at
http://localhost:3000.

🛠️ For the Curious
This project is a great way to see how Node.js and React work together. If you're a teen or a student looking to see "visible change" in your code, try tweaking the Panda icons or the graph colors!

Made with 10% React, 10% Node, and 80% pure frustration. 🐼💢

