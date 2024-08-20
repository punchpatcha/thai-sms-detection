"use client";

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import styles from './page.module.css';

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [topSpamWords, setTopSpamWords] = useState([]);

  useEffect(() => {
    const fetchTopSpamWords = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/top-spam-words`);
      const data = await response.json();
      setTopSpamWords(data);
    };
    fetchTopSpamWords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error('Error:', response.statusText);
      return;
    }

    const data = await response.json();
    setResult(data.prediction);
  };

  const data = {
    labels: topSpamWords.map(word => word.word),
    datasets: [
      {
        label: 'Top 10 Thai Spam SMS Words',
        data: topSpamWords.map(word => word.frequency),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <main className={styles.main}>
      <h1>AI SMS Detection</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="5"
          cols="50"
          placeholder="Enter your SMS here"
        ></textarea>
        <br />
        <button type="submit">Check Message</button>
      </form>
      {result && <p>Result: {result}</p>}
      <div>
        <h2>Top 10 Thai Spam SMS Words</h2>
        <Bar data={data} />
      </div>
    </main>
  );
}
