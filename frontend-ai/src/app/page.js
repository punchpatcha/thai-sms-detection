"use client"; 

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the necessary components for the chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading

  const [hamCount, setHamCount] = useState(0);
  const [spamCount, setSpamCount] = useState(0);
  
 // State for top spam words
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
      return;}
      
    // Set loading to true
    setLoading(true);

 // Mock response
   //  const mockData = { prediction: "ham" }; // Change to "spam" to test the other case
    //  setTimeout(() => {
    //  setResult(mockData.prediction);
    //  setLoading(false); // Set loading to false after response
   //   }, 1000); // Simulate a delay for loading

    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); // Log API URL

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

  return (
    <main className={styles.main}>
      
      <div className={styles.header}>
        <h1>Thai SMS Detection</h1>
        <h2 >ตรวจจับข้อความหลอกลวง</h2>
      </div>
        {/* Chart Visualization */}
        <div className={styles.chartContainer}>
        <Bar
          data={{
            labels: ['Ham', 'Spam'],
            datasets: [
              {
                label: 'SMS Classification',
                data: [hamCount, spamCount],
                backgroundColor: ['#52be80', '#ec7063'],
              },
            ],
          }}
        />
      </div>

      {/* Top Spam Words Visualization */}
      <div className={styles.chartContainer}>
        {topSpamWords.length > 0 ? (
          <Bar
            data={{
              labels: topSpamWords.map(word => word.word),
              datasets: [
                {
                  label: 'Top 10 Spam Words',
                  data: topSpamWords.map(word => word.count),
                  backgroundColor: '#ec7063',
                },
              ],
            }}
          />
        ) : (
          <p>Loading top spam words...</p>
        )}
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
            {loading && <div className={styles.spinner}></div>} {/* Show spinner */}
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
