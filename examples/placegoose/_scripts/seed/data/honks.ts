const honks = [
  {
    id: 1,
    gooseId: 16,
    decibels: 104,
  },
  {
    id: 2,
    gooseId: 27,
    decibels: 75,
  },
  {
    id: 3,
    gooseId: 80,
    decibels: 120,
  },
  {
    id: 4,
    gooseId: 24,
    decibels: 66,
  },
  {
    id: 5,
    gooseId: 62,
    decibels: 63,
  },
  {
    id: 6,
    gooseId: 12,
    decibels: 62,
  },
  {
    id: 7,
    gooseId: 66,
    decibels: 96,
  },
  {
    id: 8,
    gooseId: 27,
    decibels: 93,
  },
  {
    id: 9,
    gooseId: 60,
    decibels: 64,
  },
  {
    id: 10,
    gooseId: 74,
    decibels: 79,
  },
  {
    id: 11,
    gooseId: 89,
    decibels: 107,
  },
  {
    id: 12,
    gooseId: 77,
    decibels: 94,
  },
  {
    id: 13,
    gooseId: 83,
    decibels: 80,
  },
  {
    id: 14,
    gooseId: 58,
    decibels: 88,
  },
  {
    id: 15,
    gooseId: 41,
    decibels: 67,
  },
  {
    id: 16,
    gooseId: 92,
    decibels: 110,
  },
  {
    id: 17,
    gooseId: 39,
    decibels: 87,
  },
  {
    id: 18,
    gooseId: 83,
    decibels: 116,
  },
  {
    id: 19,
    gooseId: 94,
    decibels: 95,
  },
  {
    id: 20,
    gooseId: 84,
    decibels: 103,
  },
  {
    id: 21,
    gooseId: 69,
    decibels: 54,
  },
  {
    id: 22,
    gooseId: 34,
    decibels: 60,
  },
  {
    id: 23,
    gooseId: 58,
    decibels: 59,
  },
  {
    id: 24,
    gooseId: 52,
    decibels: 113,
  },
  {
    id: 25,
    gooseId: 46,
    decibels: 99,
  },
  {
    id: 26,
    gooseId: 50,
    decibels: 82,
  },
  {
    id: 27,
    gooseId: 74,
    decibels: 57,
  },
  {
    id: 28,
    gooseId: 59,
    decibels: 86,
  },
  {
    id: 29,
    gooseId: 65,
    decibels: 63,
  },
  {
    id: 30,
    gooseId: 85,
    decibels: 79,
  },
  {
    id: 31,
    gooseId: 22,
    decibels: 117,
  },
  {
    id: 32,
    gooseId: 29,
    decibels: 53,
  },
  {
    id: 33,
    gooseId: 45,
    decibels: 104,
  },
  {
    id: 34,
    gooseId: 43,
    decibels: 55,
  },
  {
    id: 35,
    gooseId: 81,
    decibels: 90,
  },
  {
    id: 36,
    gooseId: 27,
    decibels: 110,
  },
  {
    id: 37,
    gooseId: 88,
    decibels: 112,
  },
  {
    id: 38,
    gooseId: 50,
    decibels: 111,
  },
  {
    id: 39,
    gooseId: 16,
    decibels: 69,
  },
  {
    id: 40,
    gooseId: 60,
    decibels: 66,
  },
  {
    id: 41,
    gooseId: 97,
    decibels: 114,
  },
  {
    id: 42,
    gooseId: 98,
    decibels: 94,
  },
  {
    id: 43,
    gooseId: 8,
    decibels: 73,
  },
  {
    id: 44,
    gooseId: 26,
    decibels: 56,
  },
  {
    id: 45,
    gooseId: 63,
    decibels: 82,
  },
  {
    id: 46,
    gooseId: 90,
    decibels: 115,
  },
  {
    id: 47,
    gooseId: 45,
    decibels: 99,
  },
  {
    id: 48,
    gooseId: 98,
    decibels: 99,
  },
  {
    id: 49,
    gooseId: 59,
    decibels: 98,
  },
  {
    id: 50,
    gooseId: 23,
    decibels: 113,
  },
  {
    id: 51,
    gooseId: 60,
    decibels: 51,
  },
  {
    id: 52,
    gooseId: 65,
    decibels: 59,
  },
  {
    id: 53,
    gooseId: 50,
    decibels: 102,
  },
  {
    id: 54,
    gooseId: 87,
    decibels: 94,
  },
  {
    id: 55,
    gooseId: 35,
    decibels: 104,
  },
  {
    id: 56,
    gooseId: 88,
    decibels: 58,
  },
  {
    id: 57,
    gooseId: 94,
    decibels: 71,
  },
  {
    id: 58,
    gooseId: 68,
    decibels: 58,
  },
  {
    id: 59,
    gooseId: 88,
    decibels: 88,
  },
  {
    id: 60,
    gooseId: 91,
    decibels: 80,
  },
  {
    id: 61,
    gooseId: 99,
    decibels: 95,
  },
  {
    id: 62,
    gooseId: 70,
    decibels: 104,
  },
  {
    id: 63,
    gooseId: 73,
    decibels: 61,
  },
  {
    id: 64,
    gooseId: 14,
    decibels: 93,
  },
  {
    id: 65,
    gooseId: 8,
    decibels: 113,
  },
  {
    id: 66,
    gooseId: 81,
    decibels: 95,
  },
  {
    id: 67,
    gooseId: 14,
    decibels: 71,
  },
  {
    id: 68,
    gooseId: 70,
    decibels: 51,
  },
  {
    id: 69,
    gooseId: 28,
    decibels: 115,
  },
  {
    id: 70,
    gooseId: 98,
    decibels: 54,
  },
  {
    id: 71,
    gooseId: 2,
    decibels: 58,
  },
  {
    id: 72,
    gooseId: 42,
    decibels: 102,
  },
  {
    id: 73,
    gooseId: 15,
    decibels: 81,
  },
  {
    id: 74,
    gooseId: 80,
    decibels: 92,
  },
  {
    id: 75,
    gooseId: 34,
    decibels: 79,
  },
  {
    id: 76,
    gooseId: 94,
    decibels: 51,
  },
  {
    id: 77,
    gooseId: 44,
    decibels: 79,
  },
  {
    id: 78,
    gooseId: 17,
    decibels: 110,
  },
  {
    id: 79,
    gooseId: 27,
    decibels: 98,
  },
  {
    id: 80,
    gooseId: 88,
    decibels: 89,
  },
  {
    id: 81,
    gooseId: 26,
    decibels: 69,
  },
  {
    id: 82,
    gooseId: 84,
    decibels: 100,
  },
  {
    id: 83,
    gooseId: 31,
    decibels: 84,
  },
  {
    id: 84,
    gooseId: 89,
    decibels: 52,
  },
  {
    id: 85,
    gooseId: 86,
    decibels: 91,
  },
  {
    id: 86,
    gooseId: 96,
    decibels: 97,
  },
  {
    id: 87,
    gooseId: 53,
    decibels: 118,
  },
  {
    id: 88,
    gooseId: 62,
    decibels: 117,
  },
  {
    id: 89,
    gooseId: 29,
    decibels: 99,
  },
  {
    id: 90,
    gooseId: 37,
    decibels: 117,
  },
  {
    id: 91,
    gooseId: 11,
    decibels: 58,
  },
  {
    id: 92,
    gooseId: 54,
    decibels: 114,
  },
  {
    id: 93,
    gooseId: 20,
    decibels: 89,
  },
  {
    id: 94,
    gooseId: 49,
    decibels: 110,
  },
  {
    id: 95,
    gooseId: 31,
    decibels: 115,
  },
  {
    id: 96,
    gooseId: 78,
    decibels: 95,
  },
  {
    id: 97,
    gooseId: 97,
    decibels: 63,
  },
  {
    id: 98,
    gooseId: 6,
    decibels: 65,
  },
  {
    id: 99,
    gooseId: 82,
    decibels: 63,
  },
  {
    id: 100,
    gooseId: 17,
    decibels: 82,
  },
];

export default honks;
