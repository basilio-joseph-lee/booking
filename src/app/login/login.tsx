
"use client";
import { useState } from "react";
import { loginAuthentication } from "@/services/authServices";
import {useRouter } from "next/navigation";

export default function LoginPage() {

const router = useRouter()
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [error, setError] = useState("")
const [loading, setLoading] = useState(false)

async function Login(){

    setError("")
    setLoading(true)

    try{
        await loginAuthentication({email,password})
        router.push("/users/dashboard")
    }catch(e){
        setError("Invalid Credentials")
        setLoading(false)
    } finally {
        setLoading(false)
    }

}
  return (

    <div className="flex items-center justify-center min-h-screen">
        <div className="w-[30vw] h-[60vh] bg-gray-200 rounded-lg flex items-center justify-center">

            <form action="" className="flex flex-col gap-4 w-80">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg" 
                className="mx-auto"
                alt="" width={80} height={80}/>
                <h1 className="text-2x; font-bold text-center">Login</h1>

               {error && (
                 <span className="alert alert-error text-sm py-2 text-center">
                    Invalid Email or Password
                </span>
               )}

                <input type="text" 
                    placeholder="Username" 
                    className="input input-bordered"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                />

                <input type="text" 
                placeholder="Password" 
                className="input input-bordered" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <div className="divider text-gray-500">
                    Log
                </div>
                <button className="btn btn-primary" onClick={Login} disabled={loading}>

                    {loading ? <span className="loading loading-spinner loading-sm"/> : "Login" }
                </button>
            </form>

        </div>
    </div>

  );
}