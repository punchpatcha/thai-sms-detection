"use client"; 

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

// Register the necessary components for the charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [hamCount, setHamCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);

  const [smsClassificationData, setSmsClassificationData] = useState([]);

  useEffect(() => {
    // Fetch SMS classification data
    const fetchClassificationData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
        if (response.ok) {
          const data = await response.json();
          setSmsClassificationData([
            { label: 'Ham', value: hamCount },
            { label: 'Spam', value: spamCount }
          ]);
          setResult(data.prediction);
        } else {
          console.error('Error fetching classification data:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (message.trim()) {
      fetchClassificationData();
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If message is empty, clear the result and return
    if (!message.trim()) {
      setResult(''); // Clear the result
      return;
    }
      
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      console.error('Error:', response.statusText);
      setLoading(false); // Set loading to false even if there's an error
      return;
    }

    const data = await response.json();
    setResult(data.prediction);

    // Update the count based on the result
    if (data.prediction === 'ham') {
      setHamCount(prevCount => prevCount + 1);
    } else if (data.prediction === 'spam') {
      setSpamCount(prevCount => prevCount + 1);
    }
    setLoading(false); // Set loading to false after response
  };

  const resultClass = result === 'spam' ? styles.spam : result === 'ham' ? styles.ham : '';

  const scatterChartData = {
    datasets: [
      {
        label: 'SMS Classification',
        data: [
          { x: 0, y: hamCount, label: 'Ham' },
          { x: 1, y: spamCount, label: 'Spam' },
        ],
        backgroundColor: ['#52be80', '#ec7063'],
        borderColor: ['#2e7d32', '#c62828'],
        borderWidth: 1,
        pointRadius: 10, // Adjust the size of the circles
      },
    ],
  };

  const scatterChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Classification',
        },
        ticks: {
          callback: function(value) {
            return value === 0 ? 'Ham' : 'Spam';
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'SMS Classification Plot',
      },
    },
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Thai SMS Detection</h1>
        <h2>ตรวจจับข้อความหลอกลวง</h2>
      </div>

      {/* Scatter Plot for SMS Classification */}
      <div className={styles.chartContainer}>
        <Scatter
          data={scatterChartData}
          options={scatterChartOptions}
        />
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your SMS here..."
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading && <div className={styles.spinner}></div>}
            {loading ? 'Checking...' : 'Check Message'}
          </button>
        </form>
        {result && (
          <div className={`${styles.messageBox} ${resultClass} ${styles.resultContainer}`}>
            {result === 'ham' ? 'This message is classified as Ham.' : 'This message is classified as Spam.'}
          </div>
        )}
      </div>
    </main>
  );
}
