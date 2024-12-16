import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import firebase from "./config/FirebaseConfig";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import EditProfile from "./screens/EditProfile";
import { ToastProvider } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Chat from "./screens/Chat";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkUserState = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
      setInitializing(false);
    };

    checkUserState();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#42a5f5" />
      </View>
    );
  }

  return (
    <ActionSheetProvider>
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      animationDuration={250}
      successColor="#42a5f5"
      dangerColor="red"
      warningColor="orange"
      normalColor="gray"
      style={{ padding: 10 }}
      textStyle={{ fontSize: 14 }}
      offsetTop={50}
      swipeEnabled={true}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={userId ? "Home" : "Login"}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="Edit-Profile" component={EditProfile} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
