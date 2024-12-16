import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../config/FirebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const ChatList = () => {
    const navigation = useNavigation();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userId = await AsyncStorage.getItem("userId");
                const firestore = firebase.firestore();

                const currentUserDoc = await firestore.collection("users").doc(userId).get();
                setCurrentUser({ id: currentUserDoc.id, ...currentUserDoc.data() });

                const snapshot = await firestore.collection("users").get();
                const fetchedUsers = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((user) => user.id !== userId);

                setUsers(fetchedUsers);
                setFilteredUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = users.filter((user) =>
            user.fullName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const renderUser = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate("Chat", { currentUser, chatUser: item })}
            style={styles.userCard}
        >
            <Image source={{ uri: item.profilePicture }} style={styles.userImage} />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.userBio} numberOfLines={1}>
                    {item.bio || "No bio available"}
                </Text>
            </View>
            <View style={styles.statusContainer}>
                <View
                    style={[
                        styles.statusCircle,
                        { backgroundColor: item.connected ? "#4caf50" : "#e0e0e0" },
                    ]}
                />
                <Text style={[styles.statusText, { color: item.connected ? "#4caf50" : "#9e9e9e" }]}>
                    {item.connected ? "Online" : "Offline"}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#42a5f5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {currentUser && (
                    <>
                        <Image source={{ uri: currentUser.profilePicture }} style={styles.headerImage} />
                        <Text style={styles.headerText}>Hello, {currentUser.fullName.split(" ")[0]}</Text>
                    </>
                )}
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={24} color="#aaa" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyMessage}>No users found</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8EAED",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        paddingTop: 40,
        backgroundColor: "#42a5f5",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    headerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: "#ddd",
        marginTop: 16,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
        color: "#42a5f5",
    },
    searchBar: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    statusCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        color: "#555",
    },
    emptyMessage: {
        textAlign: "center",
        color: "#aaa",
        marginTop: 20,
        fontSize: 14,
    },
});


export default ChatList;
