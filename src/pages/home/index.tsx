import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="planner-container">
      <h1>Vibe Finance Planner</h1>
      <p>Welcome to your personal finance planner. Start by exploring one of the available tools:</p>
      <ul>
        <li><Link to="/car-finance">Car Finance Planner</Link></li>
        <li><Link to="/salary">Salary Planner</Link></li>
      </ul>
      <p>This planner was completely vibe coded for a bit of fun. Please double check your numbers!</p>
    </div>
  );
}

export default Home;
