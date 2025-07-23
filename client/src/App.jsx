import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Result from "./pages/Result";
import BuyCredit from "./pages/BuyCredit";
import Navbaar from "./components/Navbaar";
import Footer from "./components/Footer"; 

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      
      
      <Navbaar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/buy" element={<BuyCredit />} />
      </Routes>
      <Footer />
    </div>
  )
}
export default App;  