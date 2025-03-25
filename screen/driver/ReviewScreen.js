import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const ReviewScreen = () => {
    const [reviews, setReviews] = useState([
        { id: '1', name: 'A', photo: '', rating: 5, comment: 'Great ride!', reply: '' },
        { id: '2', name: 'B', photo: '', rating: 4, comment: 'Good service.', reply: '' }
    ]);

    const [followers, setFollowers] = useState(120);
    const [unfollowers, setUnfollowers] = useState(10);
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    const driverPhoto = require('./pic/d.png');
    const driverName = 'Sk Bulbul';


     const usersPhoto = require('./pic/u.png');
    
    const handleReply = (id, replyText) => {
        setReviews(reviews.map(review => 
            review.id === id ? { ...review, reply: replyText } : review
        ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.driverInfo}>
                 <Image source={driverPhoto} style={styles.driverPhoto} />
                <View>
                    <Text style={styles.driverName}>{driverName}</Text>
                    <Text style={styles.totalRating}>Total Rating: {totalRating.toFixed(1)} ⭐</Text>
                    <Text style={styles.stats}>Followers: {followers} | Unfollowers: {unfollowers}</Text>
                </View>
            </View>
            
            <Text style={styles.header}>Reviews</Text>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.reviewCard}>
                        <View style={styles.reviewerInfo}>
                            <Image source={usersPhoto} style={styles.profilePic} />
                            <Text style={styles.reviewerName}>{item.name}</Text>
                        </View>
                        <Text style={styles.rating}>Rating: {item.rating} ⭐</Text>
                        <Text style={styles.comment}>{item.comment}</Text>
                        {item.reply ? <Text style={styles.reply}>Reply: {item.reply}</Text> : null}
                        <TextInput
                            style={styles.input}
                            placeholder="Write a reply..."
                            onSubmitEditing={(e) => handleReply(item.id, e.nativeEvent.text)}
                        />
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
        backgroundColor: '#004D40'
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    driverPhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15
    },
    driverName: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    totalRating: {
        fontSize: 18,
        color: '#555'
    },
    stats: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    reviewCard: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10
    },
    reviewerName: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    rating: {
        fontSize: 16,
        color: '#555'
    },
    comment: {
        fontSize: 16,
        marginBottom: 5
    },
    reply: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'green'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginTop: 5
    }
});

export default ReviewScreen;
