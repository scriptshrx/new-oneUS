import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li>
          <Link href="/hospital-dashboard">Home</Link>
        </li>
        <li>
          <Link href="/hospital-dashboard/waitlist">View Waitlist</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;