import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import firebase from "../config";
import { useToast } from "react-native-toast-notifications";

const Register = () => {
  const navigator = useNavigation();
  const [obscureText, setObscureText] = useState(true);
  const [obscureConfirmText, setObscureConfirmText] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const showToast = (message, type) =>
    toast.show(message, {
      type,
      icon: (
        <MaterialIcons
          size={25}
          name={type === "success" ? "done" : "error"}
          color="white"
        />
      ),
    });

    

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      showToast("Make sure to fill in all fields.", "danger");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "danger");
      return;
    }

    try {
      setIsLoading(true);
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      showToast("Account created successfully.", "success");
      navigator.reset({
        index: 0, 
        routes: [{ name: 'Home' }], 
      });
    } catch (error) {
      showToast(error.message, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.logo}
          source={require("../assets/app-logo.png")}
        />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Create an account to start an amazing journey with us.
          </Text>
          <Text style={styles.headerSubtitle}>
            Please enter a valid email and password to continue!
          </Text>
        </View>

        <KeyboardAvoidingView
          style={styles.form}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color="#42a5f5"
              style={styles.icon}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color="#42a5f5"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={obscureText}
              style={styles.textInput}
              placeholder="Enter your password"
            />
            <MaterialIcons
              onPress={() => setObscureText(!obscureText)}
              name={obscureText ? "visibility-off" : "visibility"}
              size={20}
              color="grey"
              style={styles.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color="#42a5f5"
              style={styles.icon}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={obscureConfirmText}
              style={styles.textInput}
              placeholder="Confirm your password"
            />
            <MaterialIcons
              onPress={() => setObscureConfirmText(!obscureConfirmText)}
              name={obscureConfirmText ? "visibility-off" : "visibility"}
              size={20}
              color="grey"
              style={styles.icon}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.button}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Loading..." : "Sign up"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <View style={styles.bottom}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigator.navigate("Login")}>
            <Text style={styles.textButton}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  scrollContainer: {
    
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  logo: {
    marginTop: 50,
    width: 80,
    height: 80,
    alignSelf: "center",
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#9EA1AE",
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#42a5f5",
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#F8F8F8",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  button: {
    marginTop: 20,
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#42a5f5",
    borderRadius: 10,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  textButton: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#42a5f5",
    marginLeft: 5,
  },
});

export default Register;
