"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register the necessary components for the charts
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  BarElement, 
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
  const [topSpamWords, setTopSpamWords] = useState([]);

  useEffect(() => {
    // Fetch the top spam words when the component mounts
    const fetchTopSpamWords = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/top-spam-words`);
        if (response.ok) {
          const data = await response.json();
          setTopSpamWords(data.top_words);
        } else {
          console.error('Error fetching top spam words:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchTopSpamWords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If message is empty, clear the result and return
    if (!message.trim()) {
      setResult(''); // Clear the result
      return;
    }

    setLoading(true);

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
        setResult(data.prediction);

        // Update the count based on the result
        if (data.prediction === 'ham') {
          setHamCount(prevCount => prevCount + 1);
        } else if (data.prediction === 'spam') {
          setSpamCount(prevCount => prevCount + 1);
        }
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  const resultClass = result === 'spam' ? styles.spam : result === 'ham' ? styles.ham : '';

  const topWords = topSpamWords.length > 0 ? topSpamWords : [];

  const lineChartData = {
    labels: ['Ham', 'Spam'],
    datasets: [
      {
        label: 'SMS Classification Count',
        data: [hamCount, spamCount],
        borderColor: '#52be80',
        backgroundColor: 'rgba(82, 190, 128, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Thai SMS Detection</h1>
        <h2>ตรวจจับข้อความหลอกลวง</h2>
      </div>

      {/* Line Chart for SMS Classification */}
      <div className={styles.chartContainer}>
        <Line
          data={lineChartData}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Count'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Category'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
              },
              title: {
                display: true,
                text: 'SMS Classification Count',
              }
            }
          }}
        />
      </div>

      {/* Top Spam Words Visualization */}
      <div className={styles.chartContainer}>
        <Bar
          data={{
            labels: topWords.map(word => word.word),
            datasets: [
              {
                label: 'Top 10 Spam Words',
                data: topWords.map(word => word.count),
                backgroundColor: '#ec7063',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
              },
              title: {
                display: true,
                text: 'Top 10 Thai Spam Words',
              },
            },
          }}
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
            {result === 'spam' ? 'Spam (ข้อความหลอกลวง)' : 'Ham (ข้อความนี้ปลอดภัย)'}
            <div className={styles.infoBox}>
              ผลลัพธ์จากการเทรน AI ด้วยโมเดล SVM โดยใช้ชุดข้อมูลล่าสุด 809 ข้อความ SMS ภาษาไทย จากการเทรนครั้งล่าสุดมีความแม่นยำ 90% 
              และยังอยู่ในกระบวนการเทรนต่อไป ซึ่งผลลัพธ์นี้เป็นแค่การทำนายเพียงเบื้องต้นเท่านั้น
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
