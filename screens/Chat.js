import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableWithoutFeedback
} from "react-native";
import firebase from "../config/FirebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { debounce } from "lodash";
import { useActionSheet } from "@expo/react-native-action-sheet";
import supabase from "../config/SupabaseConfig";
import { decode } from "base64-arraybuffer";

const Chat = () => {
    const route = useRoute();
    const { currentUser, chatUser } = route.params;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);

    const chatRoomId = [currentUser.id, chatUser.id].sort().join("_");

    const { showActionSheetWithOptions } = useActionSheet();

    useEffect(() => {
        const dbRef = firebase.database().ref(`chats/${chatRoomId}`);
        const listener = dbRef.on("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedMessages = Object.values(data).sort(
                    (a, b) => b.timestamp - a.timestamp
                );
                setMessages(formattedMessages);
            } else {
                setMessages([]);
            }
        });

        const typingRef = firebase.database().ref(`chats/${chatRoomId}/typing/${chatUser.id}`);
        typingRef.on("value", (snapshot) => {
            setIsTyping(snapshot.val() ? true : false);
        });

        return () => {
            dbRef.off("value", listener);
            typingRef.off("value");
        };
    }, [chatRoomId, chatUser.id]);

    const handleSendMessage = () => {
        const dbRef = firebase.database().ref(`chats/${chatRoomId}`);
        dbRef.push({
            senderId: currentUser.id,
            receiverId: chatUser.id,
            text: message,
            timestamp: Date.now(),
            type: "text",
        });
        setMessage("");
        firebase.database().ref(`chats/${chatRoomId}/typing/${currentUser.id}`).set(false);
    };

    const handlePickFileOrImage = async () => {
        const options = ["🖼️ Pick Image", "📂 Pick File"];

        console.log('hello')

        showActionSheetWithOptions(
            {
                options,
            },
            async (buttonIndex) => {
                if (buttonIndex === 1) {

                } else if (buttonIndex === 0) {
                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (permissionResult.granted) {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 1,
                            base64: true
                        });
                        if (!result.canceled) {
                            console.log(result.assets[0].base64)
                            const fileName = `${currentUser.userId}-${Date.now()}.jpg`;
                            const { data, error } = await supabase.storage
                                .from("chat_images")
                                .upload(fileName, decode(result.assets[0].base64), { contentType: "image/jpeg" });
                            const { data: publicUrlData } = supabase.storage.from('chat_images').getPublicUrl(data.path);
                            const dbRef = firebase.database().ref(`chats/${chatRoomId}`);
                            dbRef.push({
                                senderId: currentUser.id,
                                receiverId: chatUser.id,
                                image: publicUrlData.publicUrl,
                                timestamp: Date.now(),
                                type: "image",
                            });
                        }
                    }
                }
            }
        );
    };

    const handleSendLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
            const dbRef = firebase.database().ref(`chats/${chatRoomId}`);
            dbRef.push({
                senderId: currentUser.id,
                receiverId: chatUser.id,
                location: location.coords,
                timestamp: Date.now(),
                type: "location",
            });
        }
    };

    const handleSearch = debounce((query) => {
        setSearchQuery(query);
    }, 300);

    const handleCloseSearch = () => {
        setSearchQuery('');
        setSearchActive(false);
    }

    const handleTyping = (text) => {
        setMessage(text);
        if (text.trim()) {
            firebase
                .database()
                .ref(`chats/${chatRoomId}/typing/${currentUser.id}`)
                .set(true);
        } else {
            firebase
                .database()
                .ref(`chats/${chatRoomId}/typing/${currentUser.id}`)
                .set(false);
        }
    };

    const renderMessage = ({ item }) => {
        if (searchQuery && (!item.text || !item.text.includes(searchQuery))) return null;

        return (
            <TouchableOpacity
                onLongPress={() => handleLongPress(item)}
                style={[
                    styles.messageContainer,
                    item.senderId === currentUser.id ? styles.currentUserMessage : styles.chatUserMessage,
                    item.type==='image'&& {backgroundColor:'transparent'}
                ]}
            >
                {item.type === "text" && (
                    <Text
                        style={[
                            styles.messageText,
                            { color: item.senderId === currentUser.id ? "#fff" : "#333" },
                        ]}
                    >
                        {item.text}
                    </Text>

                )}
                {item.type === "image" && (
                    <Image source={{ uri: item.image }} style={styles.imageMessage} />
                )}
                {item.type === "location" && (
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`)
                        }
                    >
                        <Text style={styles.locationMessage}>📍 Tap to view location</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const handleLongPress = (item) => {
        setMessageToDelete(item);
        setShowModal(true);
    };

    const handleDeleteMessage = () => {
        const dbRef = firebase.database().ref(`chats/${chatRoomId}`);
        dbRef.orderByChild("timestamp")
            .equalTo(messageToDelete.timestamp)
            .once("value", (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    childSnapshot.ref.remove();
                });
            });

        setShowModal(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Image source={{ uri: chatUser.profilePicture }} style={styles.userImage} />
                <Text style={styles.userName}>{chatUser.fullName}</Text>
                <View style={styles.topBarIcons}>
                    <TouchableOpacity onPress={() => setSearchActive(true)}>
                        <Icon name="search" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:+216${chatUser.phoneNumber}`)}>
                        <Icon name="call" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Icon name="info" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            {searchActive ? (
                <View style={styles.searchContainer}><TextInput
                    style={styles.searchInput}
                    placeholder="Search messages"
                    onChangeText={(query) => handleSearch(query)}
                    autoFocus
                /> <TouchableOpacity onPress={handleCloseSearch}>
                        <Icon name="close" size={24} color="#42a5f5" />
                    </TouchableOpacity></View>) : <View></View>}
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesContainer}
                inverted
            />

            {isTyping && <Text style={styles.typingText}>{chatUser.fullName} is typing...</Text>}

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={handlePickFileOrImage}>
                        <Icon name="attach-file" size={24} color="#42a5f5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSendLocation}>
                        <Icon name="location-on" size={24} color="#42a5f5" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        value={message}
                        onChangeText={handleTyping}
                        onBlur={() => firebase.database().ref(`chats/${chatRoomId}/typing/${currentUser.id}`).set(false)}
                    />
                    <TouchableOpacity onPress={handleSendMessage}>
                        <Icon name="send" size={24} color="#42a5f5" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalText}>Delete Message</Text>
                            <TouchableOpacity onPress={handleDeleteMessage} style={styles.modalDeleteButton}>
                                <Text style={styles.modalButtonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancelButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingTop: 35,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#42a5f5",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        flex: 1,
        marginLeft: 12,
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    topBarIcons: {
        flexDirection: "row",
        gap: 16,
    },
    searchContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchInput: {
        width: 300,
        borderColor: '#42a5f5',
        borderWidth: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        color: "#333",
        marginRight: 10,
    },
    messagesContainer: {
        padding: 12,
    },
    messageContainer: {
        maxWidth: "75%",
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
    },
    currentUserMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#42a5f5",
    },
    chatUserMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e0e0e0",
    },
    messageText: {
        fontSize: 16,
    },
    imageMessage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginVertical: 4,
    },
    locationMessage: {
        color: "#fff",
        fontSize: 16,
    },
    typingText: {
        paddingHorizontal: 10,
        alignSelf: "center",
        fontSize: 14,
        color: "#888",
        marginVertical: 4,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    textInput: {
        flex: 1,
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        width: 300,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    modalDeleteButton: {
        padding: 10,
        backgroundColor: "red",
        borderRadius: 8,
        marginVertical: 6,
        width: "100%",
        alignItems: "center",
    },
    modalCancelButton: {
        padding: 10,
        backgroundColor: "#42a5f5",
        borderRadius: 8,
        marginVertical: 6,
        width: "100%",
        alignItems: "center",
    },
    modalButtonText: {
        fontSize: 16,
        color: "#fff",
    },
});

export default Chat;
