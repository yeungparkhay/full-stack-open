import React, { useEffect, useState } from 'react'
import personService from './services/personService'

const App = () => {
  const [ persons, setPersons ] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ prompt, setPrompt ] = useState('')
  const [ message, setMessage ] = useState('')

  useEffect(() => {
    personService
      .getPersons()
      .then(initialPersons => setPersons(initialPersons))
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handlePromptChange = (event) => {
    setPrompt(event.target.value)
  }

  const addEntry = (event) => {
    event.preventDefault()
    const nameObject = {
      name: newName,
      number: newNumber
    }
    persons.map((person) => person.name).includes(newName)
    ? personService
      .updatePerson(persons.find(person => person.name === newName).id, nameObject)
      .then(returnedPerson => {
        if (window.confirm(`${returnedPerson.name} is already added to phonebook, replace the old number with a new one?`)) {
          setPersons(persons.map(person => person.name !== newName ? person : returnedPerson))
        }
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        setMessage({text: `Information of ${newName} has already been removed from server`, color: "red"})
        setTimeout(() => {
          setMessage('')
        }, 5000)
        setPersons(persons.filter(person => person.name !== newName))
      })    
    : personService
        .createPerson(nameObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setMessage({text: `Added ${newName}`, color: "green"})
          setTimeout(() => {
            setMessage('')
          }, 5000)
          setNewName('')
          setNewNumber('')
        })
		.catch(error => {
			setMessage({text: JSON.stringify(error.response.data.error), color: "red"})
			setTimeout(() => {
				setMessage('')
			  }, 5000)
		})    
  }

  const deleteEntry = id => {
    const personToDelete = persons.filter(person => person.id === id)[0]
    if (window.confirm(`Delete ${personToDelete.name} ?`)) {
      personService
        .deletePerson(personToDelete.id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== personToDelete.id))
        })
    }
  }

  const personsToShow = persons.filter(person => person.name.toLowerCase().search(prompt.toLowerCase()) !== -1)

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter prompt={prompt} handlePromptChange={handlePromptChange}/>
      <h3>Add a new</h3>
      <PersonForm addEntry={addEntry} newName={newName} newNumber={newNumber} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}/>
      <h3>Numbers</h3>
      <Persons persons={personsToShow} deleteEntry={deleteEntry} />
    </div>
  )
}

const Persons = ({ persons, deleteEntry }) => {
  return (
    persons.map((person) => (
      <div key={person.id}>
        <span>{person.name} </span>
        <span>{person.number} </span>
        <button onClick={() => deleteEntry(person.id)}>delete</button>
      </div>
    ))    
  )
}

const Filter = ({ prompt, handlePromptChange }) => {
  return (
    <div>
      filter shown with <input value={prompt} onChange={handlePromptChange} />
    </div>
  )
}

const PersonForm = ({ addEntry, newName, newNumber, handleNameChange, handleNumberChange }) => {
  return (
    <form onSubmit={addEntry}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <button type="submit">add</button>
    </form>
  )
}

const Notification = ({ message }) => {
  const messageStyle = {
    backgroundColor: "#ededed",
    color: message.color,
    padding: 10,
    margin: 10
  }
  
  if (message === '') {
    return (
      <div></div>
    )
  }
  else {
    return (
      <div style={messageStyle}>{message.text}</div>
    )
  }
}

export default App