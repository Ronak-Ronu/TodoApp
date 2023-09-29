import { useState , useEffect} from 'react';
import {db,auth} from "./firebase-config"
import "./App.css";
import {GoogleAuthProvider,signInWithPopup,signOut} from "firebase/auth";

import {collection,addDoc,onSnapshot, deleteDoc, doc,updateDoc} from "firebase/firestore"
 
function App() {
  const [todos,setTodos]=useState([]);
  const [createmytodo, setCreatemytodo] = useState("")
  const [username,setUsername]=useState("");
  // const [id,setId]=useState("");

  const todocollections = collection(db,"TodoCollections");


  
  const handleSignIn =  async(e)=>{
      const google_provider = await new GoogleAuthProvider();
      signInWithPopup(auth,google_provider).then((result)=>{

          const username=result.user.displayName;
          setUsername(username);

      }).catch(
        (error)=>{
          console.log(error);
          alert(error);
        }
      )

  }

  const handleUpdate = async(id,todo)=>{


    const docRef = doc(db, "TodoCollections", id);
    setCreatemytodo(todo);
    const updatedData = {
      Todo:createmytodo
    };
    await updateDoc(docRef, updatedData);
    // alert(todo)
  }

  const handleSignOut = async()=>{
   try {
    await signOut(auth);
    setUsername("");
    console.log("signout");
   } catch (error) {
          console.log(error);
          alert(error)
   }
  }



  const CreateTodo = async () => {
    if (username && createmytodo) {
      
      await addDoc(todocollections,
        {
          Todo:createmytodo,
          TododBy:username
        }); 
      }

    
  }


  const DeleteTodo = async (id)=>{
    if (username && createmytodo) {
      
      await deleteDoc(doc(db,"TodoCollections",id));
    }
    else{
      alert("first sign in ");
    }
  }


  useEffect(()=>{
    const getTodo = onSnapshot(todocollections,
      (snapshot) => {
      const todo = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setTodos(todo);
    });
    return () => getTodo();
},[])

  
  return (
    <div className="App">

      {
        !username ? (
            <div>
              
          <div className="SignInButton" onClick={handleSignIn}>Sign In</div>
          {
          todos.map((todo)=>
          (
            <div key={todo.id}>
                    <p>  <span className='TododBy'>{todo.TododBy}</span> {todo.Todo} &nbsp;&nbsp;&nbsp; <button className="disabled"  onClick={()=>{DeleteTodo(todo.id)}}>Completed</button> </p>
              </div>
            )
            )
          }
        
            </div>
         
         ):(
           
           <div>   
            
          <div className="SignInButton" onClick={handleSignOut}>Sign OUT</div>

               <textarea 
      rows={2} 
      cols={30}
      value={createmytodo}
      onChange={(e)=>{

        setCreatemytodo(e.target.value)
    
      }}/>

      <br />



      <button  onClick={CreateTodo}>Create Todo</button>


  
        {
          todos.map((todo)=>
          (
            <div key={todo.id}>
                {/* <img src={photo} alt="" /> */}
                {/* {setId(todo.id)} */}
                {username== todo.TododBy ?(
                  <div>

  <p>  <span className='TododBy'>{todo.TododBy}</span> {todo.Todo} &nbsp;&nbsp;&nbsp; 
  <button onClick={()=>{DeleteTodo(todo.id)}}>Completed</button>&nbsp;&nbsp;

  <button onClick={()=>{handleUpdate(todo.id,todo.Todo)}}>Edit</button>  </p>
</div>
                ):(



<div>
<p>  <span className='TododBy'>{todo.TododBy}</span> {todo.Todo} &nbsp;&nbsp;&nbsp; 
  <button  className="disabled" disabled onClick={()=>{DeleteTodo(todo.id)}}>Completed</button>&nbsp;&nbsp;

  <button className="disabled" disabled onClick={()=>{handleUpdate(todo.id,todo.Todo)}}>Edit</button>  </p>
</div>


                )
                
              }
                    
                    
                    
                    
                    
              </div>
            )
            )
            
          }


          </div>


            )}
    </div>
  
  );
}

export default App;
