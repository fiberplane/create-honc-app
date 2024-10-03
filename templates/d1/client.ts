interface User {
  name: string;
  email: string;
}

const seedData: User[] = [
  { name: "Laszlo Cravensworth", email: "laszlo.cravensworth@example.com" },
  { name: "Nadja Antipaxos", email: "nadja.antipaxos@example.com" },
  { name: "Colin Robinson", email: "colin.robinson@example.com" },
];

const seedDatabase = async () => {
  try {
    for (const user of seedData) {
      const response = await fetch("http://localhost:8787/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Failed to insert user: ${response.statusText}");
      }

      const data = await response.text();

      console.log(`User inserted: ${data}`);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error: ", error.message);
    } else {
      console.error("Unknown error occurred:", error);
    }
  }
};

seedDatabase();
