
import './App.css';
import { Routes, Route, Router } from "react-router"
import HomePage from './Pages/HomePage';

function App() {

  return (
    <div >
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
