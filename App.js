import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Login";
import Register from "./screens/Register";
import { ToastProvider } from "react-native-toast-notifications";
import Home from "./screens/Home";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ToastProvider
    placement="top"
    duration={3000}
    animationType='slide-in'
    animationDuration={250}
    successColor="#42a5f5"
    dangerColor="red"
    warningColor="orange"
    normalColor="gray"
    style={{
      padding:10
    }}
    textStyle={{ fontSize: 14 }}
    offsetTop={50}
    swipeEnabled={true}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
    </ToastProvider>
  );
}

