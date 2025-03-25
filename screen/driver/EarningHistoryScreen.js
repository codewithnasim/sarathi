import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const earningsData = [
    {
        id: '1',
        source: 'kolkata',
        destination: 'hwh',
        vehicleType: 'Sedan',
        totalHours: '5 hrs',
        extraShift: '2 hrs',
        paymentType: 'UPI',
        totalFare: '500'
    },
];

const EarningHistoryScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Earning History</Text>
            <FlatList
                data={earningsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.infoText}>Source: {item.source}</Text>
                        <Text style={styles.infoText}>Destination: {item.destination}</Text>
                        <Text style={styles.infoText}>Vehicle Type: {item.vehicleType}</Text>
                        <Text style={styles.infoText}>Total Hours: {item.totalHours}</Text>
                        <Text style={styles.infoText}>Extra Shift: {item.extraShift}</Text>
                        <Text style={styles.infoText}>Payment Type: {item.paymentType}</Text>
                        <Text style={styles.fareText}>Total Fare: {item.totalFare}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor:"#004D40",
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    card: {
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    infoText: {
        fontSize: 16,
        marginVertical: 2
    },
    fareText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5
    }
});

export default EarningHistoryScreen;
