import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaShip } from "react-icons/fa";
import { patchAppPage } from "./AppPatch";
import { QuickAccessView } from "./components/QuickAccessView/QuickAccessView";



export default definePlugin((serverAPI: ServerAPI) => {
  let appPatch = patchAppPage(serverAPI);
  return {
    title: <div className={staticClasses.Title}>GameView Music</div>,
    content: <QuickAccessView serverAPI={serverAPI} />,
    icon: <FaShip />,
    onDismount() {
      serverAPI.routerHook.removePatch("/library/app/:appid", appPatch);
    },
  };
});
