import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Papa from 'papaparse';
import panda1 from './panda.png';
import panda2 from './pandaa.png';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('live');
  const [cumulativeGB, setCumulativeGB] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  // Load historical CSV
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get('http://localhost:5000/stats_history');
        const parsed = Papa.parse(res.data, { header: true, dynamicTyping: true });
        const formatted = parsed.data
          .filter(d => d.timestamp)
          .map(d => ({
            timestamp: d.timestamp,
            downloadSpeed: d.downloadSpeed || 0,
            uploadSpeed: d.uploadSpeed || 0,
            cpuLoad: d.cpuLoad || 0,
            memoryUsed: d.memoryUsed || 0,
            memoryTotal: d.memoryTotal || 16,
          }));


          setIsDemo(false);
          setData(formatted);

        // Calculate cumulative GB
        let cum = 0;
        formatted.forEach((d, i) => {
          if (i > 0) {
            const prev = formatted[i - 1];
            const avgSpeedMB = (d.downloadSpeed + prev.downloadSpeed) / 2;
            cum += avgSpeedMB / 1024;
          }
        });
        setCumulativeGB(cum.toFixed(3));
      } catch (err) {
        console.error('Error loading history:', err);
        setIsDemo(true);
      }
    }
    fetchHistory();
  }, []);

  // Live updates
 // Live updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:5000/stats');
        
        // If the request succeeds, we are DEFINITELY not in demo mode
        setIsDemo(false); 

        setData(prev => {
          const newPoint = {
            timestamp: new Date().toISOString(),
            downloadSpeed: res.data.downloadSpeed || 0,
            uploadSpeed: res.data.uploadSpeed || 0,
            cpuLoad: res.data.cpuLoad || 0,
            memoryUsed: res.data.memoryUsed || 0,
            memoryTotal: res.data.memoryTotal || 16,
          };
          return [...prev, newPoint].slice(-100000);
        });
      } catch (err) {
        // ONLY trigger demo mode if we don't already have real data
        // This prevents the screen from flickering to demo if one request fails
        setIsDemo(prevDemo => {
            if (!prevDemo) console.warn("Backend connection lost. Switching to Simulation...");
            return true;
        });

        const demoPoint = {
          timestamp: new Date().toISOString(),
          downloadSpeed: parseFloat((Math.random() * 5 + 1).toFixed(2)), 
          uploadSpeed: parseFloat((Math.random() * 0.5).toFixed(2)),
          cpuLoad: parseFloat((Math.random() * 10 + 5).toFixed(1)),
          memoryUsed: parseFloat((4.5 + Math.random() * 0.3).toFixed(2)),
          memoryTotal: 16,
        };
        setData(prev => [...prev, demoPoint].slice(-60));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getFilteredData = () => {
    const now = new Date();

    if (viewMode === 'live') {
      return data.slice(-60); // Last 60 seconds
    }

    if (viewMode === '8h') {
      const cutoff = new Date(now.getTime() - 8 * 60 * 60 * 1000);
      return data.filter(d => new Date(d.timestamp) >= cutoff);
    }

    if (viewMode === '24h') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return data.filter(d => new Date(d.timestamp) >= cutoff);
    }

    return data; // Full history
  };

  const filteredData = getFilteredData();

  // Format X-axis
  const formatXAxis = (value) => {
    if (!value) return '';
    const date = new Date(value);

    if (viewMode === 'live') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get custom ticks for X-axis
  const getCustomTicks = () => {
    if (filteredData.length === 0) return [];

    if (viewMode === 'live') {
      return filteredData
        .filter((d, i) => i % 10 === 0)
        .map(d => d.timestamp);
    }

    if (viewMode === '8h') {
      const ticks = [];
      const now = new Date();
      for (let i = 0; i <= 8; i++) {
        const tickTime = new Date(now.getTime() - (8 - i) * 60 * 60 * 1000);
        const closest = filteredData.reduce((prev, curr) => {
          const prevDiff = Math.abs(new Date(prev.timestamp) - tickTime);
          const currDiff = Math.abs(new Date(curr.timestamp) - tickTime);
          return currDiff < prevDiff ? curr : prev;
        });
        if (closest) ticks.push(closest.timestamp);
      }
      return ticks;
    }

    if (viewMode === '24h') {
      const ticks = [];
      const now = new Date();
      for (let i = 0; i <= 24; i += 2) {
        const tickTime = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
        const closest = filteredData.reduce((prev, curr) => {
          const prevDiff = Math.abs(new Date(prev.timestamp) - tickTime);
          const currDiff = Math.abs(new Date(curr.timestamp) - tickTime);
          return currDiff < prevDiff ? curr : prev;
        });
        if (closest) ticks.push(closest.timestamp);
      }
      return ticks;
    }

    const interval = Math.floor(filteredData.length / 20);
    return filteredData
      .filter((d, i) => i % interval === 0)
      .map(d => d.timestamp);
  };

  const customTicks = getCustomTicks();

  return (
    <div className="app-container">
     {/* Pandas along the sides */}
      <img src={panda1} alt="" className="panda-side panda-left-1" />
      <img src={panda2} alt="" className="panda-side panda-left-2" />
      <img src={panda1} alt="" className="panda-side panda-left-3" />
      <img src={panda2} alt="" className="panda-side panda-left-4" />
      <img src={panda1} alt="" className="panda-side panda-left-5" />

      <img src={panda2} alt="" className="panda-side panda-right-1" />
      <img src={panda1} alt="" className="panda-side panda-right-2" />
      <img src={panda2} alt="" className="panda-side panda-right-3" />
      <img src={panda1} alt="" className="panda-side panda-right-4" />
      <img src={panda2} alt="" className="panda-side panda-right-5" />

      <h1 className="main-title">🐼 System & Download Monitor 🐼</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <span style={{
                padding: '5px 15px',
                borderRadius: '20px',
                background: isDemo ? '#fff3cd' : '#d4edda',
                color: isDemo ? '#856404' : '#155724',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                border: `1px solid ${isDemo ? '#ffeeba' : '#c3e6cb'}`
              }}>
                {isDemo ? "🟠 Simulation Mode (Offline Demo)" : "🟢 Live System Connected"}
              </span>
            </div>
      <div className="button-container">
        {['live', '8h', '24h', 'full'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`mode-button ${viewMode === mode ? 'active' : ''}`}
          >
            {mode === 'live' ? '🔴 Live (1 min)' : mode === '8h' ? '⏰ Last 8 Hours' : mode === '24h' ? '📅 Last 24 Hours' : '📊 Full History'}
          </button>
        ))}
      </div>

      {/* Network Chart */}
      <div className="chart-container">
        <h2 className="chart-title">📡 Network Speed</h2>
        <p className="cumulative-text">
          Total Downloaded: <strong>{cumulativeGB} GB</strong>
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffc0cb" />
            <XAxis
              dataKey="timestamp"
              stroke="#ff69b4"
              style={{ fontSize: 11 }}
              ticks={customTicks}
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#ff69b4"
              style={{ fontSize: 12 }}
              domain={[0, 'auto']}
              label={{ value: 'Speed (MB/s)', angle: -90, position: 'insideLeft', style: { fill: '#ff69b4', fontSize: 13 } }}
            />
            <Tooltip
              contentStyle={{ background: '#fff0f5', border: '2px solid #ffb6c1', borderRadius: 8 }}
              formatter={(value) => `${Number(value).toFixed(2)} MB/s`}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line
              type="monotone"
              dataKey="downloadSpeed"
              stroke="#5b8ff9"
              strokeWidth={2.5}
              name="Download"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="uploadSpeed"
              stroke="#5ad8a6"
              strokeWidth={2.5}
              name="Upload"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CPU Chart */}
      <div className="chart-container">
        <h2 className="chart-title">💻 CPU Usage</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffc0cb" />
            <XAxis
              dataKey="timestamp"
              stroke="#ff69b4"
              style={{ fontSize: 11 }}
              ticks={customTicks}
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#ff69b4"
              style={{ fontSize: 12 }}
              domain={[0, 'auto']}
              label={{ value: 'CPU (%)', angle: -90, position: 'insideLeft', style: { fill: '#ff69b4', fontSize: 13 } }}
            />
            <Tooltip
              contentStyle={{ background: '#fff0f5', border: '2px solid #ffb6c1', borderRadius: 8 }}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line
              type="monotone"
              dataKey="cpuLoad"
              stroke="#ff7300"
              strokeWidth={2.5}
              name="CPU Load"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Memory Chart */}
      <div className="chart-container">
        <h2 className="chart-title">💾 Memory Usage</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffc0cb" />
            <XAxis
              dataKey="timestamp"
              stroke="#ff69b4"
              style={{ fontSize: 11 }}
              ticks={customTicks}
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#ff69b4"
              style={{ fontSize: 12 }}
              domain={[0, 'dataMax']}
              label={{ value: 'Memory (GB)', angle: -90, position: 'insideLeft', style: { fill: '#ff69b4', fontSize: 13 } }}
            />
            <Tooltip
              contentStyle={{ background: '#fff0f5', border: '2px solid #ffb6c1', borderRadius: 8 }}
              formatter={(value) => `${Number(value).toFixed(2)} GB`}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line
              type="monotone"
              dataKey="memoryUsed"
              stroke="#5b8ff9"
              strokeWidth={2.5}
              name="Used"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="memoryTotal"
              stroke="#ff9a9a"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Total"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;