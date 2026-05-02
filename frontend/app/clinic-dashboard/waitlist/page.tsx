import { useEffect, useState } from 'react';

const ClinicWaitlistPage = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const response = await fetch('/api/waitlist');
        const data = await response.json();
        setWaitlist(data);
      } catch (error) {
        console.error('Error fetching waitlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Clinic Waitlist</h1>
      <ul>
        {waitlist.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ClinicWaitlistPage;