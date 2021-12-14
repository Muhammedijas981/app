import * as React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { DarkModeProvider, useDarkMode } from 'react-native-dark-mode';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import Material from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './src/screens/Home';
import Settings from './src/screens/Settings';
import global from './src/styles/global';
import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import SignUp from './src/screens/Signup';
import PhoneNumber from './src/screens/PhoneNumber';
import EditProfile from './src/screens/EditProfile';
import Policies from './src/screens/Policies';

const Stack = createStackNavigator();

function HomeScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function SettingsScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <Stack.Screen name="PhoneNumber" component={PhoneNumber} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
      <Stack.Screen name="Policies" component={Policies} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabStack() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        showIcon: true,
        showLabel: false,
        style: { backgroundColor: useDarkMode() ? 'black' : 'white' },
        activeTintColor: global.accent.color,
        inactiveTintColor: global.accent_muted.color,
        indicatorStyle: { backgroundColor: global.accent.color },
      }}
      tabBarPosition={'bottom'}
      initialLayout={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
      <Tab.Screen name="HomeStack" component={HomeScreen} options={{
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          iconName = focused
            ? 'temperature-high'
            : 'temperature-low';
          return <Material name={iconName} size={height / 20} color={color} />;
        },
      }} />
      <Tab.Screen name="SettingStack" component={SettingsScreen} options={{
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          iconName = focused ? 'md-settings-sharp' : 'md-settings-outline';
          return <Ionicons name={iconName} size={height / 20} color={color} />;
        },
      }} />
    </Tab.Navigator>
  );
}

const Tab = createMaterialTopTabNavigator();
const height = Dimensions.get('window').width;
// eslint-disable-next-line no-undef
export default App = () => {
  changeNavigationBarColor(useDarkMode() ? 'black' : 'white', !useDarkMode());
  return (
    <DarkModeProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={useDarkMode() ? 'light-content' : 'dark-content'}
          backgroundColor={useDarkMode() ? 'black' : 'white'}
        />
        <Stack.Navigator
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        >
          <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="Tabs" component={TabStack} options={{ headerShown: false }} />
          <Stack.Screen name="Policy" component={Policies} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </DarkModeProvider>
  );
};
