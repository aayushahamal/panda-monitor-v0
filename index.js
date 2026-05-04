const fs = require('fs');
const path = require('path');
const express = require('express');
const si = require('systeminformation');
const cors = require('cors');

const app = express();
app.use(cors());

const csvFile = path.join(__dirname, 'stats_history.csv');

// Create CSV file with header if it doesn't exist
if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(csvFile, 'timestamp,downloadSpeed,uploadSpeed,cpuLoad,memoryUsed,memoryTotal\n');
}

// Serve live stats
app.get('/stats', async (req, res) => {
  try {
    const network = await si.networkStats();
    const cpu = await si.currentLoad();
    const mem = await si.mem();

    const downloadSpeed = network[0].rx_sec / (1024 * 1024);
    const uploadSpeed = network[0].tx_sec / (1024 * 1024);
    const cpuLoad = cpu.currentLoad;
    const memoryUsed = mem.active / (1024 * 1024 * 1024);
    const memoryTotal = mem.total / (1024 * 1024 * 1024);

    const timestamp = new Date().toISOString();
    const csvLine = `${timestamp},${downloadSpeed},${uploadSpeed},${cpuLoad},${memoryUsed},${memoryTotal}\n`;
    fs.appendFileSync(csvFile, csvLine);

    res.json({ downloadSpeed, uploadSpeed, cpuLoad, memoryUsed, memoryTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Serve historical CSV for React
app.get('/stats_history', (req, res) => {
  res.sendFile(csvFile);
});

app.listen(5000, () => console.log('Server running at http://localhost:5000'));
