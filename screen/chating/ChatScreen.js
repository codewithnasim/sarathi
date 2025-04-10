import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const SERVER_URL = "https://sarathi-backend-file.onrender.com/api";

const ChatScreen = () => {
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        setEmail(storedEmail);

        if (!storedEmail) {
          Alert.alert("No Email", "Please log in to continue.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }

        const sessionRes = await axios.get(
          `${SERVER_URL}/rideSession/active/${storedEmail}`
        );
        const session = sessionRes.data?.session;

        if (session && session._id) {
          setSessionId(session._id);
        } else {
          Alert.alert("No Active Session", "Start a ride to use chat.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } catch (err) {
        console.error("Chat init error:", err.message);
        Alert.alert("Error", "Could not fetch session.", [
          { text: "Go Back", onPress: () => navigation.goBack() },
        ]);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/chat/${sessionId}`);
        setMessages(res.data);
      } catch (error) {
        console.log("Load messages failed:", error.message);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const sendMessage = async () => {
    if (!message.trim() || !sessionId || !email) return;

    try {
      await axios.post(`${SERVER_URL}/chat/send`, {
        sessionId,
        senderName: name,
        message,
      });
      setMessage("");
      Keyboard.dismiss();
    } catch (error) {
      console.log("Send failed:", error.message);
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.senderEmail === email;
    return (
      <View
        style={[
          styles.messageRow,
          isSender ? styles.senderRow : styles.receiverRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <Text
            style={[
              styles.senderText,
              isSender ? styles.senderName : styles.receiverName,
            ]}
          >
            {isSender ? "You" : item.senderEmail}
          </Text>
          <Text
            style={[
              styles.messageText,
              isSender ? styles.senderMsg : styles.receiverMsg,
            ]}
          >
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        ref={flatListRef}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 6,
  },
  senderRow: {
    justifyContent: "flex-end",
  },
  receiverRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  senderBubble: {
    backgroundColor: "#007AFF",
  },
  receiverBubble: {
    backgroundColor: "#e4e6eb",
  },
  senderText: {
    fontSize: 13,
    marginBottom: 4,
  },
  senderName: {
    color: "#e0e0e0",
    fontWeight: "bold",
  },
  receiverName: {
    color: "#333",
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
  },
  senderMsg: {
    color: "#fff",
  },
  receiverMsg: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
    padding: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
