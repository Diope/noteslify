import React,{useEffect, useReducer} from 'react'
import {API} from 'aws-amplify';
import {List} from 'antd';
import {listNotes} from './graphql/queries'

import {SET_NOTES, ERROR} from './store/constants'
import {initialState} from './store/state'

import 'antd/dist/antd.css';
import './App.css';

function reducer(state, {type, notes}) {
  switch(type) {
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
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}

export default App;
