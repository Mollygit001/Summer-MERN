import React,{useEffect, useState} from 'react'
import axios from 'axios';

const GetCurrentUser = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.post('http://localhost:3000/auth/is-user-logged-in', {}, { withCredentials: true });
                if (response.status === 200) {
                    setUser(response.data.userDetails);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    },[]);
  return (
    {user, loading} // Return user and loading state
  )
}

export default GetCurrentUser