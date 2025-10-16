import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <div className="App">
      <RegisterPage></RegisterPage>
      <LoginPage></LoginPage>
     <Home></Home>
    </div>
  );
}

export default App;
