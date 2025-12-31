import React from 'react';
import { LogBox } from 'react-native';
import LessonScreen from './src/pages/LessonScreen';

// Suppress development messages and disable LogBox overlay
//if (__DEV__) {
  //LogBox.ignoreAllLogs(true);
//}

function App() {
  return <LessonScreen />;
}

export default App;
