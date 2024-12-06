import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import firebase from "../config";
import { useToast } from "react-native-toast-notifications";

const Login = () => {
    const navigator = useNavigation();
    const [obscureText, setObscureText] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!email || !password) {
            toast.show("Make sure to fill in all fields.", {
                type: "danger",
                icon: <MaterialIcons name="error" size={25} color="white" />,
            });
            return;
        }

        try {
            setIsLoading(true);
            await firebase.auth().signInWithEmailAndPassword(email, password);
            navigator.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            toast.show(error.message, {
                type: "danger",
                icon: <MaterialIcons name="error" size={20} color="white" />,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image style={styles.logo} source={require("../assets/app-logo.png")} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hi There! Welcome To Lajimi Chat</Text>
                <Text style={styles.headerSubtitle}>
                    Please enter a valid email and password to continue!
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={20} color="#42a5f5" style={styles.icon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="#42a5f5" style={styles.icon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your password"
                        secureTextEntry={obscureText}
                        onChangeText={setPassword}
                    />
                    <MaterialIcons
                        name={obscureText ? "visibility-off" : "visibility"}
                        size={20}
                        color="grey"
                        style={styles.icon}
                        onPress={() => setObscureText(!obscureText)}
                    />
                </View>

                {isLoading ? (
                    <TouchableOpacity disabled style={[styles.button, styles.disabledButton]}>
                        <Text style={styles.buttonText}>Loading...</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                        <Text style={styles.buttonText}>Sign in</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.bottom}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigator.navigate("Register")}>
                    <Text style={styles.textButton}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8EAED",
        paddingHorizontal: 20,
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
    disabledButton: {
        backgroundColor: "#A5C9F5",
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

export default Login;
