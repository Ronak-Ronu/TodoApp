import { useState, useEffect } from 'react';
import { db, auth } from "./firebase-config";
import "./App.css";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { FaGoogle, FaPlus, FaEdit, FaTrash, FaCheck, FaSignOutAlt } from "react-icons/fa";

function App() {
  const [todos, setTodos] = useState([]);
  const [createmytodo, setCreatemytodo] = useState("");
  const [username, setUsername] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const todocollections = collection(db, "TodoCollections");

  const handleSignIn = async (e) => {
    setIsLoading(true);
    const google_provider = new GoogleAuthProvider();
    signInWithPopup(auth, google_provider)
      .then((result) => {
        const username = result.user.displayName;
        setUsername(username);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUsername("");
      setCreatemytodo("");
      setEditingId(null);
    } catch (error) {
      console.log(error);
      alert(error);
    }
    setIsLoading(false);
  };

  const handleUpdate = async (id, currentTodo) => {
    if (!createmytodo.trim()) {
      alert("Todo cannot be empty");
      return;
    }
    
    setIsLoading(true);
    try {
      const docRef = doc(db, "TodoCollections", id);
      await updateDoc(docRef, { Todo: createmytodo });
      setEditingId(null);
      setCreatemytodo("");
    } catch (error) {
      console.error("Error updating todo: ", error);
      alert("Failed to update todo");
    }
    setIsLoading(false);
  };

  const CreateTodo = async () => {
    if (!createmytodo.trim()) {
      alert("Todo cannot be empty");
      return;
    }
    
    setIsLoading(true);
    try {
      await addDoc(todocollections, {
        Todo: createmytodo,
        TododBy: username,
        createdAt: new Date().toISOString()
      });
      setCreatemytodo("");
    } catch (error) {
      console.error("Error adding todo: ", error);
      alert("Failed to add todo");
    }
    setIsLoading(false);
  };

  const DeleteTodo = async (id) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "TodoCollections", id));
    } catch (error) {
      console.error("Error deleting todo: ", error);
      alert("Failed to delete todo");
    }
    setIsLoading(false);
  };

  const startEditing = (id, todo) => {
    setEditingId(id);
    setCreatemytodo(todo);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setCreatemytodo("");
  };

  useEffect(() => {
    setIsLoading(true);
    const getTodo = onSnapshot(todocollections, (snapshot) => {
      const todo = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      // Sort todos by creation date
      setTodos(todo.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ));
      setIsLoading(false);
    });
    return () => getTodo();
  }, []);

  return (
    <div className="App">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!username ? (
        <div className="signin-container">
          <div className="app-header">
            <p>Organize your tasks with our simple todo app</p>
          </div>
          
          <div className="signin-card">
            <h2>Sign In to Continue</h2>
            <p>Access your todos across devices</p>
            <button className="signin-button" onClick={handleSignIn} disabled={isLoading}>
              <FaGoogle className="google-icon" /> Sign In with Google
            </button>
          </div>
        </div>
      ) : (
        <div className="app-container">
          <div className="app-header">
            <div>
              <p>Welcome back, <span className="username">{username}</span></p>
            </div>
            <button className="signout-button" onClick={handleSignOut} disabled={isLoading}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>

          <div className="todo-form">
            <h2>{editingId ? "Edit Todo" : "Create New Todo"}</h2>
            <textarea
              rows={3}
              placeholder="What do you need to do today?"
              value={createmytodo}
              onChange={(e) => setCreatemytodo(e.target.value)}
            />
            <div className="form-actions">
              {editingId ? (
                <>
                  <button className="cancel-button" onClick={cancelEditing}>
                    Cancel
                  </button>
                  <button className="update-button" onClick={() => handleUpdate(editingId, createmytodo)}>
                    <FaEdit /> Update
                  </button>
                </>
              ) : (
                <button className="create-button" onClick={CreateTodo}>
                  <FaPlus /> Create Todo
                </button>
              )}
            </div>
          </div>

          <div className="todo-list-container">
            <h2>Your Todos</h2>
            {todos.length === 0 ? (
              <div className="empty-state">
                <p>No todos yet. Create your first todo above!</p>
              </div>
            ) : (
              <div className="todo-list">
                {todos.map((todo) => (
                  <div 
                    key={todo.id} 
                    className={`todo-card ${username === todo.TododBy ? 'current-user' : ''}`}
                  >
                    <div className="todo-content">
                      <div className="todo-header">
                        <span className="todo-author">{todo.TododBy}</span>
                        {/* <span className="todo-date">
                          {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : 'Today'}
                        </span> */}
                      </div>
                      <p className="todo-text">{todo.Todo}</p>
                    </div>
                    
                    {username === todo.TododBy && (
                      <div className="todo-actions">
                        <button 
                          className="edit-button" 
                          onClick={() => startEditing(todo.id, todo.Todo)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-button" 
                          onClick={() => DeleteTodo(todo.id)}
                        >
                          <FaCheck />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;