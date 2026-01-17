import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerHome from "./app/customer/CustomerHome";
import PlayerScreen from "./app/player/PlayerScreen";
import { JSX } from "react";

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/player" element={<PlayerScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
