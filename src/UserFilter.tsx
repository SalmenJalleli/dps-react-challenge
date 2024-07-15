import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useDebounce from './useDebounce';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    isOldest: boolean;
    city: string;
}

const UserFilter: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchName, setSearchName] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [highlightOldest, setHighlightOldest] = useState(false);
    const debouncedSearchName = useDebounce(searchName, 1000);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('https://dummyjson.com/users');
            setUsers(response.data.users);
            setFilteredUsers(response.data.users);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = users.filter(user =>
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(debouncedSearchName.toLowerCase())
        );

        if (selectedCity) {
            filtered = filtered.filter(user => user.city === selectedCity);
        }

        if (highlightOldest) {
            const oldestUsers: Record<string, User> = {};
            filtered.forEach(user => {
                if (!oldestUsers[user.city] || user.age > oldestUsers[user.city].age) {
                    oldestUsers[user.city] = user;
                }
            });
            filtered = filtered.map(user => ({
                ...user,
                isOldest: oldestUsers[user.city]?.id === user.id
            }));
        }

        setFilteredUsers(filtered);
    }, [debouncedSearchName, selectedCity, highlightOldest, users]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value);
    };

    const handleHighlightOldestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHighlightOldest(e.target.checked);
    };

    const cities = Array.from(new Set(users.map(user => user.city)));

    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={searchName}
                    onChange={handleNameChange}
                />
                <select value={selectedCity} onChange={handleCityChange}>
                    <option value="">All Cities</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <label>
                    <input
                        type="checkbox"
                        checked={highlightOldest}
                        onChange={handleHighlightOldestChange}
                    />
                    Highlight Oldest per City
                </label>
            </div>
            <ul>
                {filteredUsers.map(user => (
                    <li
                        key={user.id}
                        style={{ color: user.isOldest ? 'red' : 'black' }}
                    >
                        {user.firstName} {user.lastName} - {user.city} - {user.age}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserFilter;