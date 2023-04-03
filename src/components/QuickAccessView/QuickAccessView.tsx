import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  Router,
  ServerAPI,
} from 'decky-frontend-lib';

type QuickAccessView = {
  serverAPI: ServerAPI;
}

export const QuickAccessView = ({ serverAPI }: QuickAccessView) => {
  const handleClearCache = async () => {
    let output = await serverAPI.callPluginMethod("clear_cache", {});
    if (!output.success) {
      return;
    }
    Router.CloseSideMenus();
  };
  return (
      <PanelSection>
          <PanelSectionRow>
              <ButtonItem layout="below" onClick={handleClearCache}>
                  Clear Cache
              </ButtonItem>
          </PanelSectionRow>
      </PanelSection>
  );
};
