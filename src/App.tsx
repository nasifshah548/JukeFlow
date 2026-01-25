import { JSX } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerHome from "./app/customer/CustomerHome";
import PlayerScreen from "./app/player/PlayerScreen";
import NeonPlayer from "./components/player/NeonPlayer";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerScreen />} />
        <Route path="/room/:roomId" element={<CustomerHome />} />
      </Routes>
      {/* Global Player */}
      <NeonPlayer />
    </BrowserRouter>
  );
}

export default App;
