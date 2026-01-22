import { useEffect, useState } from 'react';
import { getTopics } from '@/api';

export default function TopicsSection({ subject, grade }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    setError(false);          // 🔴 RESET ERROR ON EVERY ATTEMPT

    try {
      const res = await getTopics(subject, grade);
      setTopics(res.data || []);
    } catch (err) {
      console.error('Error loading topics:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subject && grade) {
      loadTopics();
    }
  }, [subject, grade]);

  /* =========================
     UI STATES
     ========================= */

  if (loading) {
    return <div>Loading topics…</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Failed to load topics</p>
        <button onClick={loadTopics}>Try Again</button>
      </div>
    );
  }

  if (!topics.length) {
    return <div>No topics available</div>;
  }

  return (
    <ul>
      {topics.map((topic) => (
        <li key={topic._id || topic.id}>
          <strong>{topic.name}</strong>
          <p>{topic.description}</p>
        </li>
      ))}
    </ul>
  );
}
