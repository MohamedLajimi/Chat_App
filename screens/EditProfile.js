import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Modal,
} from "react-native";
import { decode } from 'base64-arraybuffer';
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import firebase from "../config/FirebaseConfig";
import { useToast } from "react-native-toast-notifications";
import supabase from "../config/SupabaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditProfile = () => {
    const navigator = useNavigation();
    const [base64, setBase64] = useState(null);
    const [profilePicture, setProfilePicture] = useState(userData?.profilePicture || '');
    const [fullName, setFullName] = useState(userData?.fullName || '');
    const [bio, setBio] = useState(userData?.bio || '');
    const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const toast = useToast();
    const route = useRoute();
    const { userData } = route.params || {};

    useEffect(() => {
        if (userData) {
            setProfilePicture(userData.profilePicture || '')
            setFullName(userData.fullName || '');
            setBio(userData.bio || '');
            setPhoneNumber(userData.phoneNumber || '');
        }
    }, [userData]);

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

    const handleImagePickFromCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true
        });
        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
            setBase64(result.assets[0].base64);
        }
        setIsModalVisible(false);
    }

    const handleImagePickFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
            setBase64(result.assets[0].base64)
        }
        setIsModalVisible(false);
    };

    const handleSubmit = async () => {

        if (!profilePicture || !fullName || !phoneNumber) {
            showToast('Please enter all your personal informations.',
                { type: 'danger' })
            return;
        }

        setIsLoading(true);


        try {
            const user=firebase.auth().currentUser;
            const userId = user.uid;
            if (base64) {
                const fileName = `${userId}-${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                    .from("profile_images")
                    .upload(fileName, decode(base64), { contentType: "image/jpeg" });

                if (error) {
                    console.log(error);
                    throw error;
                }


                if (error) {
                    throw new Error(error.message);
                }

                const { data: publicUrlData } = supabase.storage.from('profile_images').getPublicUrl(data.path);
                setProfilePicture(publicUrlData.publicUrl);
            }
            const firestore = firebase.firestore();
            const userDocRef = firestore.collection('users').doc(userId);
            await userDocRef.set({
                userId,
                profilePicture: profilePicture,
                email: user.email,
                fullName,
                bio,
                phoneNumber,
                connected: true
            }, { merge: true });
            showToast('Profile updated successfully!', { type: 'success' });
            navigator.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });

        } catch (e) {
            showToast(e.message, { type: 'danger' })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Customize your profile the way you want !</Text>
                    <Text style={styles.headerSubtitle}>
                        Feel free to customize your personal data.
                    </Text>
                </View>
                <View style={styles.imagePickerContainer}>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        {profilePicture ? (
                            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="add-a-photo" size={30} color="#42a5f5" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color="#42a5f5" style={styles.icon} />
                        <TextInput
                            value={fullName}
                            onChangeText={setFullName}
                            style={styles.textInput}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="info" size={20} color="#42a5f5" style={styles.icon} />
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            style={styles.textInput}
                            placeholder="Enter your bio"
                            multiline
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="phone" size={20} color="#42a5f5" style={styles.icon} />
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            style={styles.textInput}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleImagePickFromCamera}
                        >
                            <MaterialIcons name="camera-alt" size={24} color="#42a5f5" />
                            <Text style={styles.modalOptionText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleImagePickFromGallery}
                        >
                            <MaterialIcons name="photo-library" size={24} color="#42a5f5" />
                            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
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
    header: {
        marginTop: 50,
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
    imagePickerContainer: {
        alignItems: "center",
        marginBottom: 20
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: "#42a5f5",
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
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
        width: "50%",
        height: 50,
        backgroundColor: "#42a5f5",
        borderRadius: 10,
    },
    buttonText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    modalOptionText: {
        marginLeft: 10,
        fontSize: 16,
    },
    modalCancel: {
        alignItems: "flex-end",
    },
    modalCancelText: {
        fontSize: 16,
        color: "#42a5f5",
    },
});

export default EditProfile;
