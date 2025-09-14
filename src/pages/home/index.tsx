import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="planner-container">
      <h1>Finance Planner</h1>
      <p>Welcome to your personal finance planner. Start by exploring one of the available tools:</p>
      <ul>
        <li><Link to="/salary">Salary Planner</Link></li>
      </ul>
    </div>
  );
}

export default Home;
