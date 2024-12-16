import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import firebase from '../config/FirebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const firestore = firebase.firestore();
                const userDoc = await firestore.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    setUserData(userDoc.data());
                } else {
                    console.error('User data not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const firestore = firebase.firestore();
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.set(
            {
                connected: false,
            },
            { merge: true }
        );
        await firebase.auth().signOut();
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    if (!userData) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#42a5f5" />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <LinearGradient
                    colors={[userData.backgroundColor || '#42a5f5', '#7a8ce0']}
                    style={styles.header}
                >
                    <View style={styles.profilePictureContainer}>
                        <Image source={{ uri: userData.profilePicture }} style={styles.profilePicture} />
                    </View>
                </LinearGradient>

                <Text style={styles.name}>{userData.fullName}</Text>
                <Text style={styles.bio}>{userData.bio}</Text>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="email" size={20} color="#42a5f5" />
                        <Text style={styles.infoText}>{userData.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="phone" size={20} color="#42a5f5" />
                        <Text style={styles.infoText}>{userData.phoneNumber}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('Edit-Profile', { userData })}
                >
                    <MaterialIcons name="edit" size={24} color="white" />
                    <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={24} color="#42a5f5" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    header: {
        height: 180,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePictureContainer: {
        position: 'absolute',
        bottom: -75,
        zIndex: 1,
    },
    profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginTop: 80,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        color: '#777',
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 10,
        color: '#333',
    },
    editButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#42a5f5',
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    editProfileButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    logoutButtonText: {
        color: '#42a5f5',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#777',
    },
});

export default Profile;
