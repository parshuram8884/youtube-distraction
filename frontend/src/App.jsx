import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import VideoPlayer from './components/video_player.jsx';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<VideoPlayer />} />
      </Routes>
    </Router>
  );
}