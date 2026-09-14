import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import { authRequest, getData } from "../../api/api";
import { useCartDispatch } from '../Components/CreateReducer';
import { useNotification } from "../Components/NotificationContext";

export default function () {
    const [data,setData]=useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            try{
                const response=await getData('/api/mobiles');
                setData(response.data);
            }catch(error){
                console.error('Error fetching data:',error);
            }   
        };
        fetchData();
    },[]);

  return (
    <div>
            {
                data.map((item)=>{
                    return(
                        <div key={item._id}>
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <h4>₹{item.price}</h4>
                        </div>
                    )
                })
            }
    </div>
  )
}
