import React,{useEffect, useReducer} from 'react'
import {API} from 'aws-amplify';
import {List, Input, Button} from 'antd';
import {listNotes} from './graphql/queries'
import {v4 as uuid} from 'uuid';

import {SET_NOTES, ERROR, ADD_NOTE, RESET_FORM, SET_INPUT} from './store/constants'
import {initialState} from './store/state'

import {createNote as CreateNote} from './graphql/mutations'

import 'antd/dist/antd.css';
import './App.css';

const CLIENT_ID = uuid()

function reducer(state, {type, notes, note, name, value}) {
  switch(type) {
    case ADD_NOTE:
      return {...state, notes: [note, ...state.notes]}
    case RESET_FORM:
      return {...state, form: initialState.form}
    case SET_INPUT:
      return {...state, form: {...state.form, [name]: value}}
    case SET_NOTES:
      return {...state, notes, loading: false }
    case ERROR:
      return {...state, loading: false, error: true}
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    fetchNotes()
  }, [])
  

  async function fetchNotes() {
    try {
      const notesData = await API.graphql({
        query: listNotes
      })
      dispatch({ type: SET_NOTES, notes: notesData.data.listNotes.items})
    } catch (err) {
      console.log('error: ', err)
      dispatch({type: ERROR})
    }
  }

  async function createNote() {
    const {form} = state
    if (!form.name || !form.description) {
      return alert('please enter a name and description')
    }
    const note = {...form, clientId: CLIENT_ID, completed: false, id: uuid()}
    dispatch({type: ADD_NOTE, note})
    dispatch({type: RESET_FORM})
    try {
      await API.graphql({
        query: CreateNote,
        variables: {input: note}
      })
      console.log('Note created!')
    } catch (err) {
      console.log("error: ", err)
    }
  }

  function onChange(e) {
    dispatch({type: SET_INPUT, name: e.target.name, value: e.target.value})
  }

  function renderItem(item) {
    return (
      <List.Item style={styles.item}>
        <List.Item.Meta
          title={item.name}
          description={item.description}
        />
      </List.Item>
    )
  }

  const styles = {
    container: {padding: 20},
    input: {marginBottom: 10},
    item: {textAlign: 'left'},
    p: {color: '#a290ff'}
  }

  return (
    <div style={styles.container}>
      <Input
        onChange={onChange}
        value={state.form.name}
        placeholder="Note title"
        name='name'
        style={styles.input}
      />
      <Input
        onChange={onChange}
        value={state.form.description}
        placeholder="Note"
        name='description'
        style={styles.input}
      />
      <Button
        onClick={createNote}
        type="primary"
      >Create Note</Button>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}

export default App;
