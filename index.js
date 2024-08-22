/**
 * @format
 */
import {Buffer} from 'buffer';
import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {DefaultTheme, PaperProvider} from 'react-native-paper';

// Mock event listener functions to prevent them from fataling.
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.Buffer = Buffer;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0e1111',
    secondary: 'yellow',
    tertiary: '#fff',
  },
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
