import axios from "axios";

export const fetchPublicCategories = async () => {
    const response = await axios.get('/api/categories');
    return response.data;
};