import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
} from "react-native";
import axios from "axios";
import { API_URL } from "../../config.js";

// Function to fetch messages
export const getMessages = async (senderEmail, receiverEmail) => {
  try {
    console.log("Fetching messages for:", senderEmail, receiverEmail);
    const response = await axios.get(`${API_URL}/chat/getMessages`, {
      params: { senderEmail, receiverEmail },
    });
    console.log("Messages received:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching messages:",
      error.response?.data || error.message
    );
    return [];
  }
};

// Function to send a new message
export const sendMessage = async (senderEmail, receiverEmail, message) => {
  try {
    const response = await axios.post(`${API_URL}/chat/sendMessage`, {
      senderEmail,
      receiverEmail,
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const ChatScreen = ({ route }) => {
  const { userEmail, driverEmail, value } = route.params; // Destructure the params (assuming value is passed)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  let [senderEmail, setSenderEmail] = useState(userEmail);
  let [receiverEmail, setReceiverEmail] = useState(driverEmail);

  useEffect(() => {
    // Check the value and swap senderEmail and receiverEmail if value is 2
    if (value === 2) {
      [senderEmail, receiverEmail] = [receiverEmail, senderEmail]; // Swap values
    }

    // Fetch messages when the component mounts
    const fetchMessages = async () => {
      try {
        const messagesData = await getMessages(senderEmail, receiverEmail);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };

    fetchMessages();
  }, [senderEmail, receiverEmail, value]);

  // Handle sending new message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await sendMessage(
          senderEmail,
          receiverEmail,
          newMessage
        );
        // Assuming the response contains the sent message with a timestamp
        const sentMessage = response; // Ensure response has the message data
        setMessages((prevMessages) => [
          ...prevMessages,
          sentMessage, // Add the new message to the message list
        ]);
        setNewMessage(""); // Clear the input field after sending
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.text}>User Email: {senderEmail}</Text>
      <Text style={styles.text}>Driver Email: {receiverEmail}</Text>

      {/* Displaying messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.senderEmail === senderEmail
                ? styles.userMessage
                : styles.driverMessage,
            ]}
          >
            <Text style={styles.senderText}>
              {msg.senderEmail === senderEmail ? "You" : "Driver"}:
            </Text>
            <Text style={styles.messageText}>{msg.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  messagesContainer: {
    width: "100%",
    marginTop: 20,
    maxHeight: "70%", // Limit the size of the message container
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    width: "80%",
    marginRight: 10,
  },
  // Custom styles for messages
  userMessage: {
    backgroundColor: "#d1f7d1", // Light green for user messages
    alignSelf: "flex-end", // Align user messages to the right
  },
  driverMessage: {
    backgroundColor: "#e1e1e1", // Light gray for driver messages
    alignSelf: "flex-start", // Align driver messages to the left
  },
});

export default ChatScreen;
