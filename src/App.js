import { useState , useEffect} from 'react';
import {db,auth} from "./firebase-config"
import "./App.css";
import {GoogleAuthProvider,signInWithPopup,signOut} from "firebase/auth";

import {collection,addDoc,onSnapshot, deleteDoc, doc} from "firebase/firestore"
import { async } from '@firebase/util';
 
function App() {
  const [todos,setTodos]=useState([]);
  const [createmytodo, setCreatemytodo] = useState("")
  const [username,setUsername]=useState("");

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

  const handleSignOut = async()=>{
   
   try {
    await signOut(auth);
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
      alert();
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
            
               <textarea 
      rows={2} 
      cols={30}
      defaultValue="Hey Todo !"
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
                    <p>  <span className='TododBy'>{todo.TododBy}</span> {todo.Todo} &nbsp;&nbsp;&nbsp; <button onClick={()=>{DeleteTodo(todo.id)}}>Completed</button> </p>
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
