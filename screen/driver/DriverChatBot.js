import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Hi Driver 👋 How can I help you today?',
        isBot: true,
        suggestions: ['Start a ride', 'Check earnings', 'Profile info']
      }
    ]);
  }, []);

  const sendMessage = (text = inputText) => {
    if (text.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text,
        isBot: false,
      };
      setMessages((prev) => [userMessage, ...prev]);
      setInputText('');

      setTimeout(() => {
        const botMessage = {
          id: Date.now().toString(),
          text: `Got it! You asked: "${text}"`,
          isBot: true,
          suggestions: ['Check ride history', 'Support', 'Go back']
        };
        setMessages((prev) => [botMessage, ...prev]);
      }, 800);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageWrapper,
        item.isBot ? styles.botMessage : styles.driverMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      {item.isBot && item.suggestions && (
        <View style={styles.suggestionsContainer}>
          {item.suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionButton}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={["#f7f8fa", "#e6ecf0"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.chatContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={styles.sendButton}
          >
            <FontAwesome name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageWrapper: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  driverMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  suggestionButton: {
    backgroundColor: '#e2e6ea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  suggestionText: {
    color: '#333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen;
