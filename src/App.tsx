import AppShell from "./layout/AppShell";
import { useNavigation } from "./navigation";
import PortalLayout from "./portal/PortalLayout";
import PortalPage from "./portal/PortalPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReferencePage from "./pages/ReferencePage";
import WorkspacePage from "./pages/WorkspacePage";
import { getRoute } from "./routes";

function App() {
  const { pathname, navigate } = useNavigation();
  const route = getRoute(pathname);

  if (route.kind === "portal") {
    return (
      <PortalLayout>
        <PortalPage projectId={route.projectId} />
      </PortalLayout>
    );
  }

  let page;
  switch (route.kind) {
    case "dashboard":
      page = <Dashboard navigate={navigate} />;
      break;
    case "detail":
      page = (
        <DetailPage entity={route.entity} id={route.id} navigate={navigate} title={route.title} />
      );
      break;
    case "reference":
      page = <ReferencePage />;
      break;
    case "workspace":
      page = <WorkspacePage description={route.description} title={route.title} />;
      break;
    case "not-found":
      page = <NotFoundPage navigate={navigate} />;
      break;
  }

  return (
    <AppShell navigate={navigate} pathname={pathname}>
      {page}
    </AppShell>
  );
}

export default App;
