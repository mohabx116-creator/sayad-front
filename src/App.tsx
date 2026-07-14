import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import Locales from 'ui-component/Locales';
import NavigationScroll from 'layout/NavigationScroll';
import RTLLayout from 'ui-component/RTLLayout';
import Snackbar from 'ui-component/extended/Snackbar';
import Notistack from 'ui-component/third-party/Notistack';
import Metrics from 'metrics';

import ThemeCustomization from 'themes';

// auth provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import useConfig from 'hooks/useConfig';

// ==============================|| APP ||============================== //

export default function App() {
  const { state: { themeDirection } } = useConfig();

  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <NavigationScroll>
              <AuthProvider>
                <>
                  <Notistack>
                    {/* Key forces remount of UI components on direction change without unmounting AuthProvider */}
                    <div key={themeDirection} style={{ display: 'contents' }}>
                      <RouterProvider router={router} />
                      <Snackbar />
                    </div>
                  </Notistack>
                </>
              </AuthProvider>
            </NavigationScroll>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      <Metrics />
    </>
  );
}
