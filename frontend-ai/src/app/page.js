"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import cloud from 'd3-cloud';
import * as d3 from 'd3'; // Import D3.js

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading
  const cloudRef = useRef(null); // Ref for the word cloud container
  const [wordCloudData, setWordCloudData] = useState([]); // State for word cloud data

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If message is empty, clear the result and return
    if (!message.trim()) {
      setResult(""); // Clear the result
      return;
    }

    // Set loading to true
    setLoading(true);

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

    // Fetch top spam words for word cloud
    const wordCloudResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/top-spam-words`
    );

    if (!wordCloudResponse.ok) {
      console.error("Error fetching top spam words:", wordCloudResponse.statusText);
      setLoading(false); // Set loading to false even if there's an error
      return;
    }

    const wordCloudData = await wordCloudResponse.json();
    setWordCloudData(wordCloudData.map(([text, size]) => ({ text, size })));
    setLoading(false); // Set loading to false after response
  };

  useEffect(() => {
    if (wordCloudData.length === 0) return;

    const layout = cloud()
      .size([800, 400])
      .words(wordCloudData.map(d => ({ text: d.text, size: d.size })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90))
      .font("Impact")
      .on("end", draw)
      .start();

    function draw(words) {
      const svg = d3.select(cloudRef.current);
      svg.selectAll("*").remove(); // Clear any previous content

      svg
        .attr("width", 800)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(400,200)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [wordCloudData]);

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

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your SMS here..."
        />
        <div className={styles.buttonContainer}>
          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading && <div className={styles.spinner}></div>}
            {loading ? "Checking..." : "Check Message"}
          </button>
        </div>
      </form>

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

      {/* Word Cloud Visualization */}
      {wordCloudData.length > 0 && (
        <div className={styles.wordCloudContainer}>
          <svg ref={cloudRef}></svg>
        </div>
      )}
    </main>
  );
}
