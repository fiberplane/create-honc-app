import axios from 'axios';

interface User {
  name: string;
  email: string;
}

const seedData: User[] = [
  { name: 'Laszlo Cravensworth', email: 'laszlo.cravensworth@example.com' },
  { name: 'Nadja Antipaxos', email: 'nadja.antipaxos@example.com' },
  { name: 'Colin Robinson', email: 'colin.robinson@example.com' }
];

const seedDatabase = async () => {
  try {
    for (const user of seedData) {
      const response = await axios.post('http://localhost:8787/api/user', user);
      console.log(`User inserted: ${response.data}`);
    }
    console.log('Database seeded successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {

      console.error('Axios error:', error.message);
    } else if (error instanceof Error) {

      console.error('Error:', error.message);
    } else {

      console.error('Unknown error occurred:', error);
    }
  }
};

seedDatabase();
