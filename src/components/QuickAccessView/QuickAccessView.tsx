import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  Router,
} from 'decky-frontend-lib';
import {
  clearCache,
} from '../../hooks/Cache';

export const QuickAccessView = () => {
  const handleClearCache = () => {
      clearCache();
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