"use client"; 

import { useState } from 'react';
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
import { Bubble } from 'react-chartjs-2';

// Register the necessary components for the chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading
  
  const [bubbleData, setBubbleData] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split the message into words
    const words = message.trim().split(/\s+/);

    // If message is empty, clear the result and return
    if (words.length == 0) {
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
    setBubbleData(data.wordFrequencies); // Example structure: [{ word: 'word1', ham: 5, spam: 10 }, ...]

    setLoading(false); // Set loading to false after response
  };

  const resultClass = result === 'spam' ? styles.spam : result === 'ham' ? styles.ham : '';

  const chartData = {
    datasets: bubbleData.map((wf) => ({
      label: wf.word,
      data: [
        {
          x: wf.ham,
          y: wf.spam,
          r: Math.sqrt(wf.ham + wf.spam) * 5, // Bubble size based on total frequency (adjust size as needed)
        },
      ],
      backgroundColor: wf.ham > wf.spam ? '#52be80' : '#ec7063', // Green for Ham, Red for Spam
    })),
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ham Frequency',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Spam Frequency',
        },
      },
    },
  };

  return (
    <main className={styles.main}>
      
      <div className={styles.header}>
        <h1>Thai SMS Detection</h1>
        <h2 >ตรวจจับข้อความหลอกลวง</h2>
      </div>

      {bubbleData.length > 0 && (
        <div className={styles.chartContainer}>
          <Bubble data={chartData} options={chartOptions} />
        </div>
      )}

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
