"use client";

import { useState } from 'react';
import styles from './page.module.css';
import '../styles/globals.css'; // Adjust path as necessary

export default function Home() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      return;
    }

    const data = await response.json();
    setResult(data.prediction);
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
    </main>
  );
}
