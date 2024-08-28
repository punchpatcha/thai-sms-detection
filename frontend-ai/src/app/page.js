"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If message is empty, clear the result and return
    if (!message.trim()) {
      setResult(""); // Clear the result
      return;
    }

    // Set loading to true
    setLoading(true);

     // Mock response
    //const mockData = { prediction: "spam" }; // Change to "spam" to test the other case
    //  setTimeout(() => {
    //  setResult(mockData.prediction);
   // setLoading(false); // Set loading to false after response
   //   }, 1000); // Simulate a delay for loading

    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); // Log API URL

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      console.error("Error:", response.statusText);
      setLoading(false); // Set loading to false even if there's an error
      return;
    }

    const data = await response.json();
    setResult(data.prediction);
    setLoading(false); // Set loading to false after response
  };

  const resultClass =
    result === "spam"
      ? styles.spam
      : result === "ham"
      ? styles.ham
      : "";

  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
        <Image
          src="/favicon.png"
          alt="Logo"
          className={styles.logo}
          width={80}
          height={70}
        />
      </div>
      
      <div className={styles.header}>
        <h1>SMS นี้หลอกลวงหรือไม่ ? </h1>
        <h2>กรอกข้อความของคุณเลย</h2>
      </div>

      <div className={styles.formContainer}>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your SMS here..."
        />
      </div>

      <div className={styles.buttonContainer}>
        <button
          type="submit"
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <div className={styles.spinner}></div>}
          {loading ? "Checking..." : "Check Message"}
        </button>
      </div>

      {result && (
        <div
          className={`${styles.messageBox} ${resultClass} ${styles.resultContainer}`}
        >
          {result === "spam"
            ? "Spam (ข้อความหลอกลวง)"
            : "Ham (ข้อความนี้ปลอดภัย)"}
          <div className={styles.infoBox}>
            ผลลัพธ์จากการเทรน AI ด้วยโมเดล SVM โดยใช้ชุดข้อมูลล่าสุด 809
            ข้อความ SMS ภาษาไทย จากการเทรนครั้งล่าสุดมีความแม่นยำ 90% และยังอยู่ใน
            กระบวนการเทรนต่อไป ซึ่งผลลัพธ์นี้เป็นแค่การทำนายเพียงเบื้องต้นเท่านั้น
          </div>
        </div>
      )}
    </main>
  );
}
