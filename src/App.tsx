import { JSX } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerHome from "./app/customer/CustomerHome";
import PlayerScreen from "./app/player/PlayerScreen";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerScreen />} />
        <Route path="/room/:roomId" element={<CustomerHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
