import React, { useEffect, useState, useFocusEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, Button } from 'react-native'

import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native'
import { createTodo } from './src/graphql/mutations'
// import { listTodos } from './src/graphql/queries'
import * as queries from './src/graphql/queries'

const initialState = { name: '', description: '' }

export default function App() {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [data, setData] = useState([]);

  const { data } = await API.graphql(graphqlOperation(queries.listPosts));
  setData(data.listPosts.items);


  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchPosts() {
    try {
      const { data } = await API.graphql(graphqlOperation(queries.listPosts));
      setData(data.listPosts.items);
    } catch (err) {
      console.log(err, 'error fetching todos');
    }
  }
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  async function addTodo() {
    try {
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <Button title="Create Todo" onPress={addTodo} />
      {
        todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text>{todo.description}</Text>
          </View>
        ))
      }
    </View>
  )
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  todo: { marginBottom: 15 },
  input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
  todoName: { fontSize: 18 }
})