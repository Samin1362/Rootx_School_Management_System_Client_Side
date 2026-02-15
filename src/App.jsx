import { Outlet } from "react-router";
import { OrganizationProvider } from "./contexts/organization/OrganizationContext";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <OrganizationProvider>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </OrganizationProvider>
  );
}

export default App;
