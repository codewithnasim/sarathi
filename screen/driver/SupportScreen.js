import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SupportScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Support</Text>
            
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>FAQs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Contact Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Report an Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Terms & Conditions</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#004D40',
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    button: {
        padding: 15,
        backgroundColor: '#007bff',
        marginVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        width: '80%'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default SupportScreen;
