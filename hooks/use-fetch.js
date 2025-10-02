// const { set } = require("zod");
import { useState } from "react";

const useFetch = (cb) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fn = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
            
        } catch (error) {
            setError(error);
        }finally {
            setLoading(false);
        }
    }

    return {fn, loading, error, data};

}

export default useFetch;