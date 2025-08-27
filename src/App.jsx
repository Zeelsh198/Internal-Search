import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import FetchData from "./components/FetchData";
import DataTable from "./components/DataTable";
import store from "./store/store";
import { Provider } from "react-redux";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FetchData />,
  },
  {
    path: "/dataTable",
    element: <DataTable />,
  },
]);

function App() {
  return (
    // The Provider makes the Redux store available to any nested components
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
