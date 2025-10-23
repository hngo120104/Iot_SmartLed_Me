import { useState } from "react"
import axios from "axios";
export default function SentText(){
    const [text,setText]=useState(null);
    const [receivedText,setReceivedText]=useState(null);
    const sent=async(e)=>{
        e.preventDefault();
        try{
            const res= await axios.post("http://172.11.242.94:8080/received/text",{text});
            console.log(res.data);
            //setReceivedText(res.data);
        }
        catch (error){
            console.log(error);
        }
    }
    return(
        <div>
            <input type="text" placeholder="Nhập lời nhắn" onChange={(e)=>setText(e.target.value)}/>
            <button type="button" onClick={sent}>Gửi</button>
            <br/>
            <br/>
            <label>{receivedText}</label>
        </div>
    )
}