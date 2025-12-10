import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./components/Main.jsx";
import Personalization from "./components/DetailForm.jsx";
import FinanceAid from "./components/Result.jsx";
import ErrorPage from "./components/Error.jsx";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/details" element={<Personalization />} />
        <Route path="/result" element={<FinanceAid />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  )
}