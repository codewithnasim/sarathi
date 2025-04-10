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
  const usersPhoto = require('./pic/u.png');
  const driverName = 'Sk Bulbul';

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
          <Text style={styles.totalRating}>⭐ {totalRating.toFixed(1)} Average Rating</Text>
          <Text style={styles.stats}>Followers: {followers} | Unfollowers: {unfollowers}</Text>
        </View>
      </View>

      <Text style={styles.header}>📋 Driver Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewerInfo}>
              <Image source={usersPhoto} style={styles.profilePic} />
              <Text style={styles.reviewerName}>{item.name}</Text>
            </View>
            <Text style={styles.rating}>Rating: {item.rating} ⭐</Text>
            <Text style={styles.comment}>"{item.comment}"</Text>
            {item.reply ? <Text style={styles.reply}>Reply: {item.reply}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Write a reply..."
              placeholderTextColor="#888"
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
    backgroundColor: '#F5F5F5',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    elevation: 3,
  },
  driverPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  driverName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
  },
  totalRating: {
    fontSize: 16,
    color: '#444',
    marginTop: 4,
  },
  stats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePic: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rating: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  comment: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  reply: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#28a745',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default ReviewScreen;
